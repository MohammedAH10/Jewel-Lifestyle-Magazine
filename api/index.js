import connectDB from '../server/config/db.js';
import app from '../server/index.js';

connectDB().catch(err => console.error('MongoDB:', err.message));

export default app;
