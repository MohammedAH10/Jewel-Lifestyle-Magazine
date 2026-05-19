import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, ExternalLink, Calendar, ChevronRight, BookOpen, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/utils'
import { api } from '@/api/client'

const MONTH_ORDER = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function DigitalMagazine() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchIssues() {
      try {
        setLoading(true)
        setError(null)
        const data = await api.get('/magazines')
        if (cancelled) return
        const list = Array.isArray(data) ? data : data?.data || data?.magazines || []
        setIssues(list)
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load magazines')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchIssues()
    return () => { cancelled = true }
  }, [])

  const currentIssue = issues.find(i => i.is_current) || issues[0]

  const pastIssues = issues.filter(i => i.id !== currentIssue?.id).sort((a, b) => {
    const yearDiff = (b.year || 0) - (a.year || 0)
    if (yearDiff !== 0) return yearDiff
    return (MONTH_ORDER[b.month] || -1) - (MONTH_ORDER[a.month] || -1)
  })

  const groupedByYear = {}
  pastIssues.forEach(issue => {
    const year = issue.year || 'Unknown'
    if (!groupedByYear[year]) groupedByYear[year] = []
    groupedByYear[year].push(issue)
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
          <p className="font-gilda text-xl text-gold/60">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="font-gilda text-2xl text-gold mb-4">Digital Magazine</p>
          <p className="text-white/50 text-sm">Unable to load magazine issues. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  if (!issues.length) {
    return (
      <div className="min-h-screen bg-black">
        <section className="relative py-24 bg-gradient-to-b from-zinc-900 to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-gilda text-5xl md:text-6xl lg:text-7xl text-gold mb-6"
            >
              Digital Magazine
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto"
            >
              Access our digital editions
            </motion.p>
          </div>
        </section>
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <BookOpen className="w-16 h-16 text-gold/30 mx-auto mb-6" strokeWidth={1} />
            <p className="font-gilda text-3xl text-white/50 mb-4">No Issues Yet</p>
            <p className="text-white/30 text-sm">Check back soon for our latest editions.</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-b from-zinc-900 to-black overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-gilda text-5xl md:text-6xl lg:text-7xl text-gold mb-6"
          >
            Digital Magazine
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto"
          >
            Access our digital editions
          </motion.p>
        </div>
      </section>

      {/* Current Issue Spotlight */}
      {currentIssue && (
        <section className="py-20 border-b border-gold/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="text-gold text-sm tracking-[0.3em] uppercase">Current Issue</span>
              <h2 className="font-gilda text-4xl md:text-5xl text-white mt-4">
                {currentIssue.title}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="relative"
              >
                <div className="aspect-[4/5] relative overflow-hidden border border-gold/20">
                  {currentIssue.cover_image_url ? (
                    <img
                      src={currentIssue.cover_image_url}
                      alt={currentIssue.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-gold/30" strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 px-4 py-2 bg-gold text-black text-xs tracking-wider uppercase font-medium">
                    Current Issue
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-full h-full border border-gold/10 -z-10" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <div className="flex items-center gap-3 text-gold mb-4">
                  <Calendar size={18} />
                  <span className="text-sm tracking-wider uppercase">
                    {currentIssue.month} {currentIssue.year}
                    {currentIssue.issue_number && ` — ${currentIssue.issue_number}`}
                  </span>
                </div>

                <h3 className="font-gilda text-3xl md:text-4xl text-white mb-6">
                  {currentIssue.title}
                </h3>

                {currentIssue.description && (
                  <p className="text-white/60 leading-relaxed mb-8">
                    {currentIssue.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4">
                  {currentIssue.pdf_url && (
                    <a
                      href={currentIssue.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 gradient-gold text-black px-8 py-4 font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity"
                    >
                      <Download size={18} />
                      Download PDF
                    </a>
                  )}
                  {currentIssue.flipbook_url && (
                    <a
                      href={currentIssue.flipbook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 border border-gold text-gold px-8 py-4 font-medium tracking-wider uppercase text-sm hover:bg-gold hover:text-black transition-all"
                    >
                      <ExternalLink size={18} />
                      Read Online
                    </a>
                  )}
                  <Link
                    to={createPageUrl('Advertise')}
                    className="inline-flex items-center gap-2 text-white/50 hover:text-gold text-sm tracking-wider uppercase transition-colors"
                  >
                    Advertise in Our Next Issue
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Archive */}
      {pastIssues.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="text-gold text-sm tracking-[0.3em] uppercase">Archive</span>
              <h2 className="font-gilda text-4xl md:text-5xl text-white mt-4">
                Past Editions
              </h2>
            </motion.div>

            {Object.entries(groupedByYear).map(([year, yearIssues]) => (
              <div key={year} className="mb-16 last:mb-0">
                <div className="flex items-center gap-6 mb-10">
                  <h3 className="font-gilda text-3xl text-gold whitespace-nowrap">{year}</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                  {yearIssues.map(issue => (
                    <motion.div
                      key={issue.id}
                      variants={itemVariants}
                      className="group relative bg-black border border-gold/10 hover:border-gold/30 transition-all duration-500 overflow-hidden"
                    >
                      <div className="aspect-[3/4] relative overflow-hidden">
                        {issue.cover_image_url ? (
                          <img
                            src={issue.cover_image_url}
                            alt={issue.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-gold/20" strokeWidth={1} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="flex items-center gap-2 px-6 py-3 border border-gold text-gold text-sm tracking-wider uppercase font-medium hover:bg-gold hover:text-black transition-all">
                            <BookOpen size={16} />
                            View Issue
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h4 className="font-gilda text-lg text-white mb-1 truncate group-hover:text-gold transition-colors">
                          {issue.title}
                        </h4>
                        <p className="text-white/40 text-sm">
                          {issue.month} {issue.year}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Submit a Story CTA */}
      <section className="py-24 border-t border-gold/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <BookOpen className="w-12 h-12 text-gold mx-auto mb-6" strokeWidth={1} />
          <h2 className="font-gilda text-4xl md:text-5xl text-white mb-4">
            Have a Story to Share?
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
            We welcome contributions from writers, entrepreneurs, and thought leaders. 
            Submit your story for a chance to be featured in our next edition.
          </p>
          <Link
            to={createPageUrl('SubmitStory')}
            className="inline-flex items-center gap-3 gradient-gold text-black px-10 py-5 font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity"
          >
            Submit a Story
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
