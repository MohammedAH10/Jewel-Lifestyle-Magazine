import connectDB from '../server/config/db.js';
import app from '../server/index.js';

let dbConnected = false;

export default async function handler(req, res) {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      console.log('DB connected for Vercel');
    } catch (err) {
      console.error('DB connect failed:', err.message);
      res.status(503).json({
        error: 'Database unavailable',
        detail: err.message,
        hint: 'Check MongoDB Atlas IP whitelist (add 0.0.0.0/0) and MONGODB_URI env var in Vercel dashboard',
      });
      return;
    }
  }
  return new Promise((resolve, reject) => {
    app(req, res);
    res.on('finish', resolve);
    res.on('error', reject);
  });
}
