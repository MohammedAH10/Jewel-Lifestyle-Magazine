import { Router } from 'express';
import AwardCategory from '../models/AwardCategory.js';
import AwardVote from '../models/AwardVote.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { year, active } = req.query;
    const filter = {};
    if (year) filter.year = parseInt(year);
    if (active !== undefined) filter.active = active === 'true';
    const categories = await AwardCategory.find(filter).sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await AwardCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const category = await AwardCategory.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const category = await AwardCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await AwardCategory.findByIdAndDelete(req.params.id);
    await AwardVote.deleteMany({ category_id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/vote', async (req, res) => {
  try {
    const { category_id, selected_nominees, voter_name, voter_email } = req.body;
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

    const vote = await AwardVote.create({ category_id, selected_nominees, voter_name, voter_email });
    res.status(201).json(vote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:categoryId/votes', authenticate, adminOnly, async (req, res) => {
  try {
    const votes = await AwardVote.find({ category_id: req.params.categoryId }).sort({ createdAt: -1 });
    res.json(votes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
