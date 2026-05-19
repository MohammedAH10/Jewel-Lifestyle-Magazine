import { Router } from 'express';
import SpotlightAward from '../models/SpotlightAward.js';
import AwardWinner from '../models/AwardWinner.js';
import AwardNomination from '../models/AwardNomination.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/categories', async (req, res) => {
  try {
    const { year } = req.query;
    const filter = {};
    if (year) filter.year = parseInt(year);
    const awards = await SpotlightAward.find(filter).sort({ year: -1 });
    res.json(awards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', authenticate, adminOnly, async (req, res) => {
  try {
    const award = await SpotlightAward.create(req.body);
    res.status(201).json(award);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/categories/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const award = await SpotlightAward.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!award) return res.status(404).json({ error: 'Not found' });
    res.json(award);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/categories/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const award = await SpotlightAward.findByIdAndDelete(req.params.id);
    if (!award) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/winners', async (req, res) => {
  try {
    const { year, category } = req.query;
    const filter = {};
    if (year) filter.year = parseInt(year);
    if (category) filter.award_category = category;
    const winners = await AwardWinner.find(filter).sort({ year: -1 });
    res.json(winners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/winners', authenticate, adminOnly, async (req, res) => {
  try {
    const winner = await AwardWinner.create(req.body);
    res.status(201).json(winner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/winners/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const winner = await AwardWinner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!winner) return res.status(404).json({ error: 'Not found' });
    res.json(winner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/winners/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const winner = await AwardWinner.findByIdAndDelete(req.params.id);
    if (!winner) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/nominations', authenticate, adminOnly, async (req, res) => {
  try {
    const nominations = await AwardNomination.find().sort({ createdAt: -1 });
    res.json(nominations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/nominations', async (req, res) => {
  try {
    const nomination = await AwardNomination.create(req.body);
    res.status(201).json(nomination);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/nominations/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const nomination = await AwardNomination.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!nomination) return res.status(404).json({ error: 'Not found' });
    res.json(nomination);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/nominations/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const nomination = await AwardNomination.findByIdAndDelete(req.params.id);
    if (!nomination) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
