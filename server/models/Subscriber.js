import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: String,
  subscribed_date: String,
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Subscriber', subscriberSchema);
