import { Router } from 'express';
import TeamMember from '../models/TeamMember.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { publicCache, noCache } from '../middleware/cache.js';

const router = Router();

router.get('/', publicCache(600, 1800), async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ order: 1 }).select('-__v');
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', noCache, authenticate, adminOnly, async (req, res) => {
  try {
    const member = await TeamMember.create(req.body);
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', noCache, authenticate, adminOnly, async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) return res.status(404).json({ error: 'Not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', noCache, authenticate, adminOnly, async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;