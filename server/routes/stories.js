import { Router } from 'express';
import StorySubmission from '../models/StorySubmission.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const submission = await StorySubmission.create(req.body);
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const submissions = await StorySubmission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const submission = await StorySubmission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!submission) return res.status(404).json({ error: 'Not found' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await StorySubmission.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
