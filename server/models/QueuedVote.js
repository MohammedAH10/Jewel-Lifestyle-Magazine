import mongoose from 'mongoose';

/**
 * A vote that has been accepted by the frontend but not yet written to the
 * `awardvotes` collection.
 *
 * Voting returns 202 as soon as a document lands here, so a spike in traffic
 * never turns into a spike in writes against the votes collection. A drain
 * then copies these into `awardvotes` in batches and removes them.
 *
 * The unique index mirrors the one on AwardVote. Without it two concurrent
 * requests from the same device could both be queued, since the "already
 * voted" check happens before the insert.
 */
const queuedVoteSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AwardCategory', required: true },
  selected_nominees: [{ type: String, required: true }],
  voter_name: { type: String, required: true },
  voter_email: { type: String, required: true },
  // SHA-256 of the salted client IP, as in AwardVote.
  voter_ip_hash: { type: String, required: true },
  // When the voter submitted, as opposed to `createdAt` on the stored vote,
  // which is when the drain wrote it. The two can differ by seconds under load.
  queued_at: { type: Date, default: Date.now },
}, { timestamps: true });

queuedVoteSchema.index(
  { category_id: 1, voter_ip_hash: 1 },
  { unique: true, partialFilterExpression: { voter_ip_hash: { $type: 'string' } } }
);

// Drains always ask for the oldest entries first.
queuedVoteSchema.index({ queued_at: 1 });

export default mongoose.model('QueuedVote', queuedVoteSchema);
