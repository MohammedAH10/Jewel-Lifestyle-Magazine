import mongoose from 'mongoose';

const magazineIssueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issue_number: String,
  month: {
    type: String,
    enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    required: true,
  },
  year: { type: Number, required: true },
  cover_image_url: { type: String, required: true },
  pdf_url: String,
  flipbook_url: String,
  description: String,
  article_content: String,
  scheduled_date: String,
  status: { type: String, enum: ['Draft', 'Scheduled', 'Published'], default: 'Draft' },
  is_current: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('MagazineIssue', magazineIssueSchema);
