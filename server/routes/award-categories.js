import { Router } from 'express';
import AwardCategory from '../models/AwardCategory.js';
import AwardVote from '../models/AwardVote.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { publicCache, noCache } from '../middleware/cache.js';
import { getClientIp, hashIp } from '../middleware/clientIp.js';

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

router.get('/:id', publicCache(60, 300), async (req, res) => {
  try {
    const category = await AwardCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
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
    // generic database error. The unique index below is what actually
    // guarantees it, since two requests can pass this check concurrently.
    const alreadyVoted = await AwardVote.findOne({ category_id, voter_ip_hash }).select('_id');
    if (alreadyVoted) {
      return res.status(409).json({ error: 'You have already voted in this category' });
    }

    let vote;
    try {
      vote = await AwardVote.create({
        category_id,
        selected_nominees,
        voter_name,
        voter_email,
        voter_ip_hash,
      });
    } catch (err) {
      // Duplicate key: the unique index caught a concurrent double vote.
      if (err.code === 11000) {
        return res.status(409).json({ error: 'You have already voted in this category' });
      }
      throw err;
    }

    res.status(201).json(vote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:categoryId/votes', noCache, authenticate, adminOnly, async (req, res) => {
  try {
    const votes = await AwardVote.find({ category_id: req.params.categoryId }).sort({ createdAt: -1 });
    res.json(votes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;