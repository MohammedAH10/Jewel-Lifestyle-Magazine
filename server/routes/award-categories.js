import { Router } from 'express';
import AwardCategory from '../models/AwardCategory.js';
import AwardVote from '../models/AwardVote.js';
import QueuedVote from '../models/QueuedVote.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { publicCache, noCache } from '../middleware/cache.js';
import { getClientIp, hashIp } from '../middleware/clientIp.js';
import { enqueue, drain, drainInBackground, pendingCount } from '../config/voteQueue.js';
import { buildVoteExport } from '../utils/voteExport.js';

const router = Router();

router.get('/', publicCache(60, 300), async (req, res) => {
  try {
    const { year, active } = req.query;
    const filter = {};
    if (year) filter.year = parseInt(year);
    if (active !== undefined) filter.active = active === 'true';
    const categories = await AwardCategory.find(filter)
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', noCache, authenticate, adminOnly, async (req, res) => {
  try {
    const category = await AwardCategory.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', noCache, authenticate, adminOnly, async (req, res) => {
  try {
    const category = await AwardCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', noCache, authenticate, adminOnly, async (req, res) => {
  try {
    await AwardCategory.findByIdAndDelete(req.params.id);
    await AwardVote.deleteMany({ category_id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Accepts a vote and queues it.
 *
 * Returns 202 rather than 201: the vote is durably queued but not yet part of
 * the results. The only write on this path is one small document, which keeps
 * a voting spike from becoming a spike of writes against `awardvotes` and the
 * unique index it contends on. `drainInBackground` then flushes the queue in
 * batches.
 */
router.post('/vote', noCache, async (req, res) => {
  try {
    const { category_id, selected_nominees, voter_name, voter_email } = req.body;

    if (!Array.isArray(selected_nominees) || selected_nominees.length === 0) {
      return res.status(400).json({ error: 'Select at least one nominee' });
    }

    const category = await AwardCategory.findById(category_id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    if (!category.active) return res.status(400).json({ error: 'Voting is closed for this category' });

    const validNames = category.nominees.map(n => n.name);
    const invalid = selected_nominees.filter(n => !validNames.includes(n));
    if (invalid.length > 0) {
      return res.status(400).json({ error: `Invalid nominees: ${invalid.join(', ')}` });
    }

    if (category.vote_type === 'single' && selected_nominees.length !== 1) {
      return res.status(400).json({ error: 'Single choice category — select exactly one nominee' });
    }

    const voter_ip_hash = hashIp(getClientIp(req));

    // Checked up front so a repeat voter gets a clear message rather than a
    // generic database error. The unique indexes on QueuedVote and AwardVote
    // are what actually guarantee it, since two requests can pass this check
    // concurrently.
    const existing = await Promise.all([
      AwardVote.findOne({ category_id, voter_ip_hash }).select('_id'),
      QueuedVote.findOne({ category_id, voter_ip_hash }).select('_id'),
    ]);
    if (existing.some(Boolean)) {
      return res.status(409).json({ error: 'You have already voted in this category' });
    }

    try {
      await enqueue({
        category_id,
        selected_nominees,
        voter_name,
        voter_email,
        voter_ip_hash,
      });
    } catch (err) {
      // Duplicate key: a unique index caught a concurrent double vote.
      if (err.code === 11000) {
        return res.status(409).json({ error: 'You have already voted in this category' });
      }
      throw err;
    }

    // Flush without blocking the response. A failure here is not fatal: the
    // entry is durable in the queue and the next drain picks it up.
    res.status(202).json({ queued: true, message: 'Vote received' });
    drainInBackground();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Admin-only. Votes are never exposed publicly, and never cached.
 *
 * Queued votes are flushed first so a tally is not missing votes that are
 * waiting in the queue, then the pending count is reported separately so the
 * admin can see how much is still queued.
 */
/**
 * Admin-only download of every vote, as a ZIP containing .xlsx and .csv.
 *
 * Placed before `/:categoryId/votes` so "export" is not captured as an id.
 */
router.get('/export/votes.zip', noCache, authenticate, adminOnly, async (req, res) => {
  try {
    // Flush first so the download is not missing queued votes.
    const drained = await drain();
    const pending = drained ? drained.remaining : await pendingCount();

    const [votes, categories] = await Promise.all([
      AwardVote.find().sort({ createdAt: -1 }).lean(),
      AwardCategory.find().select('name year vote_type').lean(),
    ]);

    const zip = buildVoteExport({ votes, categories, pending });
    const stamp = new Date().toISOString().slice(0, 10);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="spotlight-awards-votes-${stamp}.zip"`
    );
    res.setHeader('Content-Length', String(zip.length));
    // Never let a CDN hold a copy of the export.
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(200).send(zip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * One category by id. Declared last of the GET routes so the literal paths
 * above are not captured by this `/:id` pattern.
 */
router.get('/:id', publicCache(60, 300), async (req, res) => {
  try {
    const category = await AwardCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:categoryId/votes', noCache, authenticate, adminOnly, async (req, res) => {
  try {
    const drained = await drain();
    const votes = await AwardVote.find({ category_id: req.params.categoryId }).sort({ createdAt: -1 });
    res.json({
      votes,
      queued: drained ? drained.remaining : await pendingCount(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;