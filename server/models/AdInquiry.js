import mongoose from 'mongoose';

const adInquirySchema = new mongoose.Schema({
  contact_name: { type: String, required: true },
  company_name: String,
  email: { type: String, required: true },
  phone: String,
  ad_type: {
    type: String,
    enum: ['Magazine Print Ad', 'Digital Ad', 'Sponsored Content', 'Event Sponsorship', 'Other'],
    required: true,
  },
  message: { type: String, required: true },
  budget_range: String,
  status: {
    type: String,
    enum: ['New', 'Contacted', 'In Progress', 'Closed'],
    default: 'New',
  },
}, { timestamps: true });

export default mongoose.model('AdInquiry', adInquirySchema);
