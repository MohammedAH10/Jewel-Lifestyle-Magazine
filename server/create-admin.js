import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jewel-magazine';

async function main() {
  await mongoose.connect(MONGODB_URI);

  const User = (await import('./models/User.js')).default;
  const count = await User.countDocuments();

  if (count >= 5) {
    console.log('Max admins (5) reached. Cannot create more.');
    process.exit(1);
  }

  const email = process.argv[2] || 'admin@jewellmagazine.com';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Admin';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
  } else {
    await User.create({ email, password, name });
    console.log(`Admin created: ${email} / ${password}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
