import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import executiveRoutes from './routes/executives.js';
import magazineRoutes from './routes/magazines.js';
import heroRoutes from './routes/heroes.js';
import awardRoutes from './routes/awards.js';
import teamRoutes from './routes/team.js';
import subscriberRoutes from './routes/subscribers.js';
import storyRoutes from './routes/stories.js';
import inquiryRoutes from './routes/inquiries.js';
import uploadRoutes from './routes/upload.js';
import awardCategoryRoutes from './routes/award-categories.js';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

if (!process.env.VERCEL) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use('/seed-images', express.static(path.join(__dirname, '..', 'images')));
}

app.use('/api/auth', authRoutes);
app.use('/api/executives', executiveRoutes);
app.use('/api/magazines', magazineRoutes);
app.use('/api/heroes', heroRoutes);
app.use('/api/awards', awardRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/award-categories', awardCategoryRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const start = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

if (!process.env.VERCEL) {
  start().catch(err => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
}

export default app;
