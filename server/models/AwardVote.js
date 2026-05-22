import mongoose from 'mongoose';

const awardVoteSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AwardCategory', required: true },
  selected_nominees: [{ type: String, required: true }],
  voter_name: { type: String, required: true },
  voter_email: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('AwardVote', awardVoteSchema);
