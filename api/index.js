import connectDB from '../server/config/db.js';
import app from '../server/index.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connect failed:', err.message);
    res.setHeader('Cache-Control', 'no-store');
    res.status(503).json({
      error: 'Database unavailable',
      hint: 'Check MONGODB_URI in Vercel env vars and Atlas IP access list (allow 0.0.0.0/0)',
    });
    return;
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const done = (fn) => (arg) => {
      if (settled) return;
      settled = true;
      fn(arg);
    };

    res.on('finish', done(resolve));
    res.on('close', done(resolve));
    res.on('error', done(reject));

    app(req, res);
  });
}