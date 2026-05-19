import { Router } from 'express';
import ExecutiveInterview from '../models/ExecutiveInterview.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category, year, featured, cover } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (year) filter.published_date = { $regex: `^${year}` };
    if (featured === 'true') filter.is_featured = true;
    if (cover === 'true') filter.is_cover_story = true;
    const interviews = await ExecutiveInterview.find(filter).sort({ createdAt: -1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const interview = await ExecutiveInterview.findById(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Not found' });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const interview = await ExecutiveInterview.create(req.body);
    res.status(201).json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const interview = await ExecutiveInterview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!interview) return res.status(404).json({ error: 'Not found' });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const interview = await ExecutiveInterview.findByIdAndDelete(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
