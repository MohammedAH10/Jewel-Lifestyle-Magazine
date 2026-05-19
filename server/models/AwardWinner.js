import mongoose from 'mongoose';

const awardWinnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: String,
  company: String,
  award_category: { type: String, required: true },
  year: { type: Number, required: true },
  photo_url: String,
  bio: String,
}, { timestamps: true });

export default mongoose.model('AwardWinner', awardWinnerSchema);
