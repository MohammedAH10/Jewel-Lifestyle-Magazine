import { CheckCircle, X } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Confirmation shown after votes are accepted.
 *
 * The server returns 202 once a vote is queued, so this reflects an accepted
 * submission rather than a completed write. The wording says as much, and the
 * pending count is surfaced in the admin tally rather than here.
 */
export default function VoteConfirmation({ open, onClose, count }) {
  if (!open) return null

  const voteCount = Number(count) || 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vote-confirmation-title"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-black border border-gold/40 shadow-2xl shadow-gold/10"
      >
        {/* Gold rule across the top */}
        <div className="h-1 w-full bg-gradient-to-r from-gold via-gold to-transparent" />

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-white/40 hover:text-gold transition-colors"
        >
          <X size={18} />
        </button>

        <div className="px-8 py-10 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: 'backOut' }}
            className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-gold/40 rounded-full"
          >
            <CheckCircle className="w-8 h-8 text-gold" />
          </motion.div>

          <p className="font-gilda text-xs tracking-[0.3em] uppercase text-gold/70 mb-3">
            Jewel Lifestyle Magazine
          </p>

          <h2
            id="vote-confirmation-title"
            className="font-gilda text-3xl text-white mb-4 text-gradient-gold"
          >
            Your Vote Is In
          </h2>

          <div className="w-12 h-px bg-gold/40 mx-auto mb-5" />

          <p className="text-white/70 leading-relaxed mb-6">
            Thank you for taking part in the Spotlight Awards.
            {voteCount > 0 && (
              <>
                {' '}
                Your {voteCount === 1 ? 'vote has' : `${voteCount} votes have`} been
                recorded.
              </>
            )}
          </p>

          <p className="text-white/40 text-sm mb-8">
            Your submission is secured and will be counted towards the final results.
          </p>

          <button
            onClick={onClose}
            className="w-full h-12 bg-gold text-black font-medium tracking-wider uppercase text-sm hover:bg-gold/90 transition-colors"
          >
            Continue
          </button>
        </div>

        <div className="h-1 w-full bg-gradient-to-r from-gold via-gold to-transparent" />
      </motion.div>
    </div>
  )
}
