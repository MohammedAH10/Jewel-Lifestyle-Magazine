import { Router } from 'express';
import MagazineIssue from '../models/MagazineIssue.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { publicCache, noCache } from '../middleware/cache.js';

const router = Router();

router.get('/', publicCache(180, 600), async (req, res) => {
  try {
    const issues = await MagazineIssue.find()
      .sort({ year: -1, month: -1 })
      .select('-article_content -__v');
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/current', publicCache(300, 900), async (req, res) => {
  try {
    const issue = await MagazineIssue.findOne({ is_current: true }).select('-article_content -__v');
    if (!issue) {
      const latest = await MagazineIssue.findOne()
        .sort({ year: -1, createdAt: -1 })
        .select('-article_content -__v');
      return res.json(latest);
    }
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', publicCache(300, 900), async (req, res) => {
  try {
    const issue = await MagazineIssue.findById(req.params.id).select('-__v');
    if (!issue) return res.status(404).json({ error: 'Not found' });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', noCache, authenticate, adminOnly, async (req, res) => {
  try {
    const issue = await MagazineIssue.create(req.body);
    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', noCache, authenticate, adminOnly, async (req, res) => {
  try {
    const issue = await MagazineIssue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!issue) return res.status(404).json({ error: 'Not found' });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', noCache, authenticate, adminOnly, async (req, res) => {
  try {
    const issue = await MagazineIssue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;