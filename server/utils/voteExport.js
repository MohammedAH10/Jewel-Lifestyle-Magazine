import { createZip } from '../utils/zip.js';

/**
 * Vote export.
 *
 * Produces a ZIP containing an .xlsx workbook and a .csv of the same data, plus
 * a per-category summary. Both formats are written by hand from the ZIP writer
 * in server/utils/zip.js, so no spreadsheet or compression dependency is added
 * to the serverless bundle.
 */

/** Strips characters Excel rejects in sheet names and formula injection. */
const safeSheetName = (name, fallback) => {
  const cleaned = String(name || '').replace(/[\\/*?:[\]]/g, ' ').trim().slice(0, 31);
  return cleaned || fallback;
};

const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // A leading =, +, - or @ makes a cell evaluate as a formula.
    .replace(/^([=+\-@])/, "'$1");

const columnName = (index) => {
  let name = '';
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
};

const csvCell = (value) => {
  const s = String(value ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const toCsv = (rows) => rows.map((row) => row.map(csvCell).join(',')).join('\r\n');

/**
 * One worksheet: a header row of strings followed by data rows.
 */
function sheetXml(rows) {
  const header = rows[0].map((cell) => escapeXml(cell));
  const headerCells = header
    .map((cell, i) => `<c r="${columnName(i)}1" t="inlineStr" s="1"><is><t>${cell}</t></is></c>`)
    .join('');

  const body = rows
    .slice(1)
    .map((row, rowIndex) => {
      const r = rowIndex + 2;
      const cells = row
        .map((cell, colIndex) => {
          const ref = `${columnName(colIndex)}${r}`;
          if (cell === null || cell === undefined || cell === '') return '';
          if (typeof cell === 'number') return `<c r="${ref}"><v>${cell}</v></c>`;
          return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(cell)}</t></is></c>`;
        })
        .join('');
      return `<row r="${r}">${cells}</row>`;
    })
    .join('');

  const lastCol = columnName(Math.max(rows[0].length - 1, 0));
  const lastRow = rows.length;
  const widths = rows[0]
    .map((_, i) => `<col min="${i + 1}" max="${i + 1}" width="22" customWidth="1"/>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetPr><outlinePr summaryBelow="1" summaryRight="1"/></sheetPr>
<dimension ref="A1:${lastCol}${Math.max(lastRow, 1)}"/>
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/>
<cols>${widths}</cols>
<sheetData><row r="1" s="2" ht="20" customHeight="1">${headerCells}</row>${body}</sheetData>
<autoFilter ref="A1:${lastCol}${Math.max(lastRow, 1)}"/>
</worksheet>`;
}

/** Assembles the minimal OOXML package Excel needs to open a workbook. */
function buildXlsx(sheets) {
  const files = [];

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('\n')}
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${sheets
    .map((s, i) => `<sheet name="${escapeXml(safeSheetName(s.name, `Sheet${i + 1}`))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`)
    .join('')}</sheets>
</workbook>`;

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('\n')}
<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  // s="1" bold header on the data sheets, s="2" the header row in row 1.
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD4AF37"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="3">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
</cellXfs>
</styleSheet>`;

  files.push({ name: '[Content_Types].xml', data: contentTypes });
  files.push({ name: '_rels/.rels', data: rootRels });
  files.push({ name: 'xl/workbook.xml', data: workbook });
  files.push({ name: 'xl/_rels/workbook.xml.rels', data: workbookRels });
  files.push({ name: 'xl/styles.xml', data: styles });
  sheets.forEach((s, i) => {
    files.push({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(s.rows) });
  });

  return files;
}

/**
 * Builds the full export bundle.
 *
 * @param {object} options
 * @param {Array} options.votes       stored AwardVote documents
 * @param {Array} options.categories  AwardCategory documents, for names and counts
 * @param {number} options.pending    votes still in the queue
 * @returns {Buffer} a ZIP containing .xlsx and .csv
 */
export function buildVoteExport({ votes = [], categories = [], pending = 0 } = {}) {
  // Looked up once rather than per row: a large vote history would otherwise
  // make find() inside the map quadratic.
  const catById = new Map(categories.map((c) => [String(c._id), c]));
  const catName = new Map(categories.map((c) => [String(c._id), c.name]));
  const voteType = new Map(categories.map((c) => [String(c._id), c.vote_type]));

  const detailRows = [
    ['Category', 'Year', 'Vote type', 'Nominees voted for', 'Nominee count', 'Voter name', 'Voter email', 'Submitted at (UTC)', 'Queued at (UTC)'],
    ...votes.map((v) => [
      catName.get(String(v.category_id)) || '(deleted category)',
      catById.get(String(v.category_id))?.year ?? '',
      voteType.get(String(v.category_id)) || '',
      (v.selected_nominees || []).join(' | '),
      (v.selected_nominees || []).length,
      v.voter_name || '',
      v.voter_email || '',
      v.createdAt ? new Date(v.createdAt).toISOString() : '',
      v.queued_at ? new Date(v.queued_at).toISOString() : '',
    ]),
  ];

  // One tally per category per nominee, with a share-of-vote column.
  const tally = new Map();
  for (const v of votes) {
    const key = String(v.category_id);
    if (!tally.has(key)) {
      const cat = catById.get(key);
      tally.set(key, {
        name: catName.get(key) || '(deleted category)',
        year: cat?.year ?? '',
        type: voteType.get(key) || '',
        total: 0,
        counts: new Map(),
      });
    }
    const entry = tally.get(key);
    entry.total++;
    for (const n of v.selected_nominees || []) {
      entry.counts.set(n, (entry.counts.get(n) || 0) + 1);
    }
  }

  const summaryRows = [
    ['Category', 'Year', 'Vote type', 'Nominee', 'Votes', 'Share of category votes'],
  ];
  for (const entry of tally.values()) {
    const ranked = [...entry.counts.entries()].sort((a, b) => b[1] - a[1]);
    for (const [nominee, count] of ranked) {
      const share = entry.total > 0 ? `${((count / entry.total) * 100).toFixed(1)}%` : '0%';
      summaryRows.push([entry.name, entry.year, entry.type, nominee, count, share]);
    }
  }

  // Categories with no votes still belong in the summary, so a missing shortlist
  // is visible rather than looking like an oversight.
  for (const cat of categories) {
    if (!tally.has(String(cat._id))) {
      summaryRows.push([cat.name, cat.year, cat.vote_type, '(no votes yet)', 0, '0%']);
    }
  }

  const overviewRows = [
    ['Report', 'Jewel Lifestyle Magazine — Spotlight Awards votes'],
    ['Generated at (UTC)', new Date().toISOString()],
    ['Categories', categories.length],
    ['Votes recorded', votes.length],
    ['Votes awaiting write to database', pending],
    [],
    ['Note', 'IP addresses are never stored. Each voter is identified by a salted one-way hash of their IP address.'],
  ];

  const sheets = [
    { name: 'Overview', rows: overviewRows },
    { name: 'Tally', rows: summaryRows },
    { name: 'All votes', rows: detailRows },
  ];

  const files = buildXlsx(sheets);
  files.push({ name: 'votes-tally.csv', data: '﻿' + toCsv(summaryRows) });
  files.push({ name: 'votes-detail.csv', data: '﻿' + toCsv(detailRows) });
  files.push({
    name: 'README.txt',
    data: [
      'Jewel Lifestyle Magazine — Spotlight Awards vote export',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      'Files in this archive:',
      '  spotlight-awards-votes.xlsx  Overview, Tally and All votes worksheets',
      '  votes-tally.csv             one row per nominee, with vote share',
      '  votes-detail.csv            one row per individual vote',
      '',
      'Voting is queued. A vote recorded in the All votes sheet may still be',
      'waiting to be written to the database; the Overview sheet reports how',
      'many. Exports flush the queue first, so the numbers here should reflect',
      'every vote accepted before this file was generated.',
      '',
      'Voter IP addresses are never stored in the database. Each voter is',
      'identified only by a salted one-way hash, included so you can audit',
      'duplicates but not reverse.',
    ].join('\n'),
  });

  return createZip(files);
}

export default { buildVoteExport };
