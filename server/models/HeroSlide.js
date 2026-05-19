import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  image_url: { type: String, required: true },
  link_url: String,
  link_text: String,
  slide_type: {
    type: String,
    enum: ['Interview', 'Award', 'Event', 'Magazine'],
    default: 'Interview',
  },
  order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('HeroSlide', heroSlideSchema);
