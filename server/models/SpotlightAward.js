import mongoose from 'mongoose';

const spotlightAwardSchema = new mongoose.Schema({
  category_name: { type: String, required: true },
  description: String,
  icon: String,
  year: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('SpotlightAward', spotlightAwardSchema);
