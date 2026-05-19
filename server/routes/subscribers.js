import { Router } from 'express';
import Subscriber from '../models/Subscriber.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (!existing.is_active) {
        existing.is_active = true;
        existing.name = name || existing.name;
        await existing.save();
        return res.json(existing);
      }
      return res.status(400).json({ error: 'Already subscribed' });
    }
    const subscriber = await Subscriber.create({
      email,
      name,
      subscribed_date: new Date().toISOString().split('T')[0],
      is_active: true,
    });
    res.status(201).json(subscriber);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
