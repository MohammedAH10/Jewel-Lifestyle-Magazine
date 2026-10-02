import QueuedVote from '../models/QueuedVote.js';
import AwardVote from '../models/AwardVote.js';

/**
 * Vote queue.
 *
 * The problem: a voting spike turns directly into a spike of writes against
 * `awardvotes`. Every write contends on the unique index and, on a small
 * cluster, enough of them at once will exhaust connections.
 *
 * The approach: `enqueue` inserts one small document and returns. That is the
 * only write on the request path. A background drain moves queued votes into
 * `awardvotes` in batches, so the burst is smoothed out rather than passed
 * through.
 *
 * Queuing also removes index contention at the exact moment it is worst: the
 * unique index on `awardvotes` is hit once per batch instead of once per vote.
 *
 * Durability note: entries live in MongoDB, not in process memory, so a
 * serverless instance being recycled or a deploy cannot lose a vote. A drain
 * only runs when the instance is still alive to run it; the next request or
 * admin view picks up whatever is left. Nothing expires.
 */

const BATCH_SIZE = 100;
const MAX_BATCHES_PER_DRAIN = 10;

/**
 * Returns the number of votes accepted but not yet written to `awardvotes`.
 */
export async function pendingCount() {
  try {
    return await QueuedVote.countDocuments({});
  } catch {
    return 0;
  }
}

/**
 * Queues a vote. Throws with `code === 11000` if this device has already
 * queued a vote in this category.
 */
export async function enqueue(vote) {
  return QueuedVote.create({
    category_id: vote.category_id,
    selected_nominees: vote.selected_nominees,
    voter_name: vote.voter_name,
    voter_email: vote.voter_email,
    voter_ip_hash: vote.voter_ip_hash,
  });
}

/**
 * Moves queued votes into `awardvotes`.
 *
 * Each document is claimed with `findOneAndDelete`, which is atomic, so two
 * instances draining at the same time cannot both take the same vote.
 *
 * @returns {Promise<{drained: number, rejected: number, remaining: number}>}
 */
export async function drain(options = {}) {
  const batchSize = options.batchSize || BATCH_SIZE;
  const maxBatches = options.maxBatches || MAX_BATCHES_PER_DRAIN;

  let drained = 0;
  let rejected = 0;

  for (let batch = 0; batch < maxBatches; batch++) {
    const ids = await QueuedVote.find({})
      .sort({ queued_at: 1 })
      .limit(batchSize)
      .select('_id')
      .lean();

    if (ids.length === 0) break;

    const claimed = [];
    for (const { _id } of ids) {
      // Null means another instance already claimed this one.
      const doc = await QueuedVote.findOneAndDelete({ _id });
      if (doc) claimed.push(doc);
    }

    if (claimed.length === 0) continue;

    await Promise.all(
      claimed.map(async (doc) => {
        try {
          await AwardVote.create({
            category_id: doc.category_id,
            selected_nominees: doc.selected_nominees,
            voter_name: doc.voter_name,
            voter_email: doc.voter_email,
            voter_ip_hash: doc.voter_ip_hash,
            queued_at: doc.queued_at,
          });
          drained++;
        } catch (err) {
          if (err.code === 11000) {
            // The device already has a stored vote in this category. The
            // queued copy is redundant, so it is discarded rather than retried.
            rejected++;
            return;
          }
          // Anything else is transient or a data problem. Put the document
          // back so it is retried on the next drain instead of being lost.
          rejected++;
          try {
            await QueuedVote.create({
              category_id: doc.category_id,
              selected_nominees: doc.selected_nominees,
              voter_name: doc.voter_name,
              voter_email: doc.voter_email,
              voter_ip_hash: doc.voter_ip_hash,
              queued_at: doc.queued_at,
            });
          } catch (requeueErr) {
            if (requeueErr.code !== 11000) {
              console.error('Vote requeue failed:', requeueErr.message);
            }
          }
          console.error('Vote drain error, requeued:', err.message);
        }
      })
    );
  }

  return { drained, rejected, remaining: await pendingCount() };
}

/**
 * Runs a drain without letting a failure surface to the caller, and without
 * two overlapping drains in the same instance.
 */
let draining = false;
export async function drainInBackground() {
  if (draining) return null;
  draining = true;
  try {
    return await drain();
  } catch (err) {
    console.error('Vote drain failed:', err.message);
    return null;
  } finally {
    draining = false;
  }
}

export default { enqueue, drain, drainInBackground, pendingCount };
