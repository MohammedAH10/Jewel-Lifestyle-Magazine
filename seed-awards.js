import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import imagekit from './server/config/imagekit.js';
import AwardCategory from './server/models/AwardCategory.js';
import { resolveMongoUri } from './server/config/mongoUri.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { uri: MONGODB_URI, dbName: MONGODB_DB } = resolveMongoUri();
const SOURCE_DIR = path.resolve(process.cwd(), 'JewelSpotlightAwardsNominees');
const YEAR = parseInt(process.env.AWARDS_YEAR || String(new Date().getFullYear()), 10);
const IMAGE_FOLDER = 'spotlight-awards';

const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;

/**
 * Categories where a reader can pick more than one nominee. Judged on a
 * portfolio, so the shortlist is the point rather than a single winner.
 */
const MULTI_SELECT = new Set([
  'Brand of the Year Award',
  'Female Fashion Brand of the Year',
  'Male Fashion Brand of the Year',
  'Food & Beverage Brand of the Year',
]);

async function uploadNomineeImage(filePath, label) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).replace('.', '').toLowerCase();
  const safeLabel = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-+/g, '-');
  const fileName = `${safeLabel}-${path.basename(filePath, path.extname(filePath))}.${ext}`;

  // ImageKit's own filename mangling turns "WhatsApp Image 2026-09-04 at
  // 17.56.53.jpeg" into an unreadable URL, so the label is prepended and
  // whitespace collapsed to keep admin recognisable.
  try {
    return await imagekit.uploadBuffer(buffer, { fileName, folder: IMAGE_FOLDER });
  } catch (err) {
    console.error(`    upload failed (${err.message})`);
    return null;
  }
}

const run = async () => {
  if (!MONGODB_URI) throw new Error('MONGODB_URI missing');
  if (!imagekit.isConfigured()) {
    console.error(
      'ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT.'
    );
    process.exit(1);
  }

  const categoryDirs = fs
    .readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  if (categoryDirs.length === 0) {
    console.error(`No category folders found in ${SOURCE_DIR}`);
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB, serverSelectionTimeoutMS: 20000 });
  console.log(`Connected to '${MONGODB_DB}'. Seeding ${categoryDirs.length} categories from ${path.basename(SOURCE_DIR)}/`);

  let uploaded = 0;
  let skipped = 0;

  for (const dirName of categoryDirs) {
    const files = fs
      .readdirSync(path.join(SOURCE_DIR, dirName))
      .filter((f) => IMAGE_EXT.test(f))
      .sort();

    // Categories are matched by name so re-running adds new nominees to the
    // existing category instead of creating a duplicate.
    let category = await AwardCategory.findOne({ name: dirName });

    if (!category) {
      category = new AwardCategory({
        name: dirName,
        vote_type: MULTI_SELECT.has(dirName) ? 'multi' : 'single',
        year: YEAR,
        active: true,
      });
      console.log(`\n${dirName}  (${category.vote_type})`);
    } else {
      console.log(`\n${dirName}  (existing, ${category.nominees.length} nominees already present)`);
    }

    if (files.length === 0) {
      console.log('  no images in this folder — category left with no nominees');
    }

    for (const [index, file] of files.entries()) {
      const label = `${dirName.split(' ').slice(0, 2).join(' ')} ${index + 1}`;

      // The placeholder label is deterministic (folder name + index), so an
      // existing nominee with that label means this file was already seeded.
      if (category.nominees.some((n) => n.name === label)) {
        console.log(`  ${String(index + 1).padStart(2)}. ${label} (already seeded, skipped)`);
        continue;
      }

      const url = await uploadNomineeImage(path.join(SOURCE_DIR, dirName, file), label);
      if (!url) {
        skipped++;
        continue;
      }

      // Name and title are placeholders for the admin to replace; the model
      // requires a name, so each nominee gets a numbered placeholder.
      category.nominees.push({
        name: label,
        title: '',
        company: '',
        image: url,
      });
      uploaded++;
      console.log(`  ${String(index + 1).padStart(2)}. ${label} -> ${url}`);
    }

    if (files.length > 0) {
      await category.save();
      console.log(`  saved: ${category.nominees.length} nominees`);
    } else {
      await category.save();
    }
  }

  const total = await AwardCategory.countDocuments({});
  console.log(`\nDone. ${uploaded} images uploaded, ${skipped} failed.`);
  console.log(`awardcategories now holds ${total} document(s).`);
  console.log('\nNext: open /AdminDashboard > Awards and fill in each nominee name, title and company.');

  await mongoose.disconnect();
};

run().catch((e) => {
  console.error('Seeding failed:', e.message);
  process.exit(1);
});
