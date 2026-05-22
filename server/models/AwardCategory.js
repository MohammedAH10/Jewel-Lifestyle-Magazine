import mongoose from 'mongoose';

const nomineeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: String,
  company: String,
  image: String,
  bio: String,
});

const awardCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  icon: String,
  vote_type: { type: String, enum: ['single', 'multi'], default: 'single' },
  year: { type: Number, required: true },
  active: { type: Boolean, default: true },
  nominees: [nomineeSchema],
}, { timestamps: true });

export default mongoose.model('AwardCategory', awardCategorySchema);
