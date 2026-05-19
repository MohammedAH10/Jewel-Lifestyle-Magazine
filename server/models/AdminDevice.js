import mongoose from 'mongoose';

const adminDeviceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  device_id: { type: String, required: true, unique: true },
  device_name: { type: String, default: '' },
  user_agent: { type: String, default: '' },
  ip_address: { type: String, default: '' },
  is_primary: { type: Boolean, default: false },
  is_active: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  last_seen: { type: Date, default: Date.now },
}, { timestamps: true });

adminDeviceSchema.index({ user: 1, is_primary: 1 });
adminDeviceSchema.index({ user: 1, is_active: 1 });

export default mongoose.model('AdminDevice', adminDeviceSchema);
