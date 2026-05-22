import connectDB from '../server/config/db.js';
import app from '../server/index.js';

let dbConnected = false;

export default async function handler(req, res) {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (err) {
      console.error('MongoDB connection:', err.message);
      res.status(503).json({ error: 'Database unavailable' });
      return;
    }
  }
  return new Promise((resolve, reject) => {
    app(req, res);
    res.on('finish', resolve);
    res.on('error', reject);
  });
}
