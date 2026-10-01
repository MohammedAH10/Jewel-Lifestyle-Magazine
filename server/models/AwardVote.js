import mongoose from 'mongoose';

const awardVoteSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AwardCategory', required: true },
  selected_nominees: [{ type: String, required: true }],
  voter_name: { type: String, required: true },
  voter_email: { type: String, required: true },
  // SHA-256 of the salted client IP. Used to stop one device voting twice
  // without storing the raw address.
  voter_ip_hash: { type: String, index: true },
}, { timestamps: true });

// One vote per device per category. The sparse flag lets documents written
// before this change (which have no hash) stay in the collection.
awardVoteSchema.index(
  { category_id: 1, voter_ip_hash: 1 },
  { unique: true, partialFilterExpression: { voter_ip_hash: { $type: 'string' } } }
);

export default mongoose.model('AwardVote', awardVoteSchema);