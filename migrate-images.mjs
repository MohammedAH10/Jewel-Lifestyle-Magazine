#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import imagekit from './server/config/imagekit.js';
import { resolveMongoUri } from './server/config/mongoUri.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const isDataUrl = (v) => typeof v === 'string' && v.startsWith('data:');
const isCloudinary = (v) => typeof v === 'string' && v.includes('res.cloudinary.com');

const migrateString = async (v, ctx) => {
  if (isDataUrl(v)) return imagekit.uploadDataUrl(v, { folder: 'seed' });
  if (isCloudinary(v)) return imagekit.migrateRemoteUrl(v, { folder: 'seed' });
  return v;
};

const run = async () => {
  if (!MONGODB_URI) throw new Error('MONGODB_URI missing');
  const { dbName: MONGODB_DB } = resolveMongoUri();
  if (!imagekit.isConfigured()) {
    console.warn('ImageKit not configured yet. Skipping image migration.');
    return;
  }
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB, serverSelectionTimeoutMS: 15000 });
  console.log(`Connected to '${MONGODB_DB}', starting migration...`);

  const models = [
    { name: 'HeroSlide', key: 'image_url' },
    { name: 'MagazineIssue', key: 'cover_image_url' },
    { name: 'ExecutiveInterview', keys: ['headshot_url', 'cover_image_url'] },
    { name: 'TeamMember', key: 'photo_url' },
    { name: 'AwardWinner', key: 'photo_url' },
    { name: 'AwardCategory' },
  ];

  for (const m of models) {
    const Model = (await import(`./server/models/${m.name}.js`)).default;
    const docs = await Model.find({});
    for (const d of docs) {
      let changed = false;
      if (m.key) {
        const v = d[m.key];
        if (isDataUrl(v) || isCloudinary(v)) {
          const newV = await migrateString(v, { model: m.name });
          if (newV !== v) { d[m.key] = newV; changed = true; }
        }
      }
      if (m.keys) {
        for (const k of m.keys) {
          const v = d[k];
          if (isDataUrl(v) || isCloudinary(v)) {
            const newV = await migrateString(v, { model: m.name, key: k });
            if (newV !== v) { d[k] = newV; changed = true; }
          }
        }
      }
      if (d.nominees?.length) {
        for (const n of d.nominees) {
          if (n.image && (isDataUrl(n.image) || isCloudinary(n.image))) {
            n.image = await migrateString(n.image, { model: m.name, nominee: true });
            changed = true;
          }
        }
      }
      if (changed) { await d.save(); console.log(`Updated ${m.name} ${d._id}`); }
    }
  }

  await mongoose.disconnect();
  console.log('Done');
};

run().catch((e) => { console.error('Migration failed:', e.message); process.exit(1); });
