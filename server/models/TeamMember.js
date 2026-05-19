import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  bio: String,
  photo_url: String,
  linkedin_url: String,
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('TeamMember', teamMemberSchema);
