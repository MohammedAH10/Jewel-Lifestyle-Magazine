import mongoose from 'mongoose';

const executiveInterviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  category: {
    type: String,
    enum: ['Tech', 'Fashion', 'Hospitality', 'Business', 'Finance', 'Healthcare', 'Entertainment', 'Other'],
    required: true,
  },
  headshot_url: String,
  cover_image_url: String,
  excerpt: String,
  content: { type: String, required: true },
  video_url: String,
  interview_type: { type: String, enum: ['Article', 'Q&A', 'Video'], default: 'Article' },
  published_date: String,
  is_featured: { type: Boolean, default: false },
  is_cover_story: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('ExecutiveInterview', executiveInterviewSchema);
