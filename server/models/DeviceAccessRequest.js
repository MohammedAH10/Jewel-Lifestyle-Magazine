import mongoose from 'mongoose';

const deviceAccessRequestSchema = new mongoose.Schema({
  device_id: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_agent: { type: String, default: '' },
  ip_address: { type: String, default: '' },
  location: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('DeviceAccessRequest', deviceAccessRequestSchema);
