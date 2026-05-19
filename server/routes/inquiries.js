import { Router } from 'express';
import AdInquiry from '../models/AdInquiry.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const inquiry = await AdInquiry.create(req.body);
    res.status(201).json(inquiry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const inquiries = await AdInquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const inquiry = await AdInquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!inquiry) return res.status(404).json({ error: 'Not found' });
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await AdInquiry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
