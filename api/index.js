import connectDB from '../server/config/db.js';
import app from '../server/index.js';

connectDB().catch(err => console.error('MongoDB connection:', err.message));

export default app;
