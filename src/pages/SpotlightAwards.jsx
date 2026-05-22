import { api } from '@/api/client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Award, Star, Calendar, MapPin, CheckCircle, Loader2, Send, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: "easeOut" },
}

export default function SpotlightAwards() {
  const [categories, setCategories] = useState([])
  const [winners, setWinners] = useState([])
  const [selectedYear, setSelectedYear] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [votes, setVotes] = useState({})
  const [voterName, setVoterName] = useState('')
  const [voterEmail, setVoterEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      try {
        const [categoriesData, winnersData] = await Promise.all([
          api.get('/award-categories'),
          api.get('/awards/winners'),
        ])
        if (cancelled) return
        const cats = categoriesData || []
        const wins = winnersData || []
        setCategories(cats)
        setWinners(wins)
        if (wins.length > 0) {
          const years = [...new Set(wins.map(w => w.year))].sort((a, b) => b - a)
          setSelectedYear(years[0])
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  const activeCats = categories.filter(c => c.active)

  const handleToggleVote = (catId, nomineeName) => {
    setVotes(prev => {
      const cat = categories.find(c => c.id === catId)
      const current = prev[catId] || []
      if (cat?.vote_type === 'single') {
        return { ...prev, [catId]: [nomineeName] }
      }
      const exists = current.includes(nomineeName)
      return {
        ...prev,
        [catId]: exists ? current.filter(n => n !== nomineeName) : [...current, nomineeName],
      }
    })
  }

  const handleSubmitVotes = async () => {
    if (!voterName.trim() || !voterEmail.trim()) {
      setSubmitMsg('Please enter your name and email')
      return
    }
    const catIds = Object.keys(votes)
    if (catIds.length === 0) {
      setSubmitMsg('Please vote in at least one category')
      return
    }
    setSubmitting(true)
    setSubmitMsg('')
    try {
      for (const catId of catIds) {
        await api.post('/award-categories/vote', {
          category_id: catId,
          selected_nominees: votes[catId],
          voter_name: voterName.trim(),
          voter_email: voterEmail.trim(),
        })
      }
      setSubmitMsg('success')
      setVotes({})
      setVoterName('')
      setVoterEmail('')
    } catch (err) {
      setSubmitMsg(err.message || 'Failed to submit votes')
    } finally {
      setSubmitting(false)
    }
  }

  const years = [...new Set(winners.map(w => w.year))].sort((a, b) => b - a)
  const filteredWinners = selectedYear ? winners.filter(w => w.year === selectedYear) : winners

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-gold animate-pulse mx-auto mb-4" />
          <p className="font-gilda text-xl text-gold/60">Loading Spotlight Awards...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="font-gilda text-2xl text-gold mb-4">Spotlight Awards</p>
          <p className="text-white/50 text-sm">Please refresh the page to try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <Trophy className="w-16 h-16 text-gold mx-auto mb-6" />
            <h1 className="font-gilda text-5xl md:text-7xl lg:text-8xl text-gradient-gold mb-6">
              Spotlight Awards
            </h1>
            <p className="font-gilda text-xl md:text-2xl text-white/60 italic max-w-2xl mx-auto">
              Celebrating Excellence in Creativity, Business, and Influence
            </p>
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-gilda text-4xl md:text-5xl text-white mb-6">About the Spotlight Awards</h2>
            <p className="text-white/60 text-lg leading-relaxed">
              The Jewel Lifestyle Magazine Spotlight Awards honor extraordinary individuals
              who have made a significant impact in their fields. From visionary entrepreneurs
              and creative artists to influential leaders, our awards celebrate the drive,
              passion, and innovation that shape our world. Cast your vote below to help
              determine this year's winners.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Calendar, label: "Annual Event", desc: "Held once a year to honor the brightest minds and most impactful contributors across industries." },
              { icon: Award, label: "Multiple Categories", desc: "A diverse range of categories spanning business, arts, technology, philanthropy, and more." },
              { icon: Star, label: "Public Voting", desc: "Your vote matters! Help us recognize those who are making a difference in their fields." },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center p-8 border border-gold/10 hover:border-gold/30 transition-colors duration-500"
              >
                <item.icon className="w-10 h-10 text-gold mx-auto mb-4" />
                <h3 className="font-gilda text-xl text-gold mb-3">{item.label}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Voting Section */}
      {activeCats.length > 0 && (
        <section className="py-20 md:py-28 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="text-center mb-16">
              <h2 className="font-gilda text-4xl md:text-5xl text-white mb-4">Cast Your Vote</h2>
              <p className="text-white/50 text-lg">
                Select your choice in each category
              </p>
            </motion.div>

            <div className="space-y-12">
              {activeCats.map((cat, catIdx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: catIdx * 0.1 }}
                >
                  <div className="mb-6">
                    <h3 className="font-gilda text-3xl text-gold">{cat.name}</h3>
                    {cat.description && <p className="text-white/50 mt-2">{cat.description}</p>}
                    <p className="text-white/40 text-sm mt-1">
                      {cat.vote_type === 'single' ? 'Choose one' : 'You may select multiple'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cat.nominees?.map((nominee) => {
                      const isSelected = (votes[cat.id] || []).includes(nominee.name)
                      return (
                        <button
                          key={nominee.name}
                          onClick={() => handleToggleVote(cat.id, nominee.name)}
                          className={`text-left border transition-all duration-300 ${
                            isSelected
                              ? 'border-gold bg-gold/10'
                              : 'border-gold/10 hover:border-gold/40 bg-black/50'
                          }`}
                        >
                          <div className="aspect-[4/3] relative overflow-hidden">
                            {nominee.image ? (
                              <img src={nominee.image} alt={nominee.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                <span className="font-gilda text-5xl text-gold/30">
                                  {(nominee.name || '?').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute inset-0 bg-gold/20 flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-gold" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="text-white font-medium">{nominee.name}</h4>
                            {nominee.title && <p className="text-white/50 text-sm">{nominee.title}</p>}
                            {nominee.company && <p className="text-white/40 text-xs">{nominee.company}</p>}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {(!cat.nominees || cat.nominees.length === 0) && (
                    <p className="text-white/40 text-sm">No nominees listed yet</p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Voter Info & Submit */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-lg mx-auto mt-16 p-8 border border-gold/20 bg-black/50"
            >
              <h3 className="font-gilda text-2xl text-white mb-6 text-center">Submit Your Vote</h3>
              <div className="space-y-4">
                <Input
                  placeholder="Your Name *"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  className="bg-black border-gold/20 text-white placeholder:text-white/30"
                />
                <Input
                  type="email"
                  placeholder="Your Email *"
                  value={voterEmail}
                  onChange={(e) => setVoterEmail(e.target.value)}
                  className="bg-black border-gold/20 text-white placeholder:text-white/30"
                />
                <Button
                  onClick={handleSubmitVotes}
                  disabled={submitting}
                  className="w-full h-12 bg-gold text-black font-medium tracking-wider uppercase text-sm hover:bg-gold/90 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      Submit Votes
                    </span>
                  )}
                </Button>
                {submitMsg === 'success' ? (
                  <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400">Your votes have been submitted. Thank you!</p>
                  </div>
                ) : submitMsg ? (
                  <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded">
                    <p className="text-red-400 text-sm">{submitMsg}</p>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Previous Winners */}
      {winners.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="text-center mb-16">
              <h2 className="font-gilda text-4xl md:text-5xl text-white mb-4">Previous Winners</h2>
              <p className="text-white/50 text-lg">Honoring the achievements of past recipients</p>
            </motion.div>
            {years.length > 1 && (
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-6 py-2 font-gilda text-lg border transition-all duration-300 ${
                      selectedYear === year
                        ? 'border-gold bg-gold text-black'
                        : 'border-gold/30 text-gold/70 hover:border-gold hover:text-gold'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
            <div
              key={selectedYear}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredWinners.map((winner) => (
                <motion.div
                  key={winner.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="group border border-gold/10 hover:border-gold/40 transition-all duration-500 overflow-hidden"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    {winner.photo_url ? (
                      <img src={winner.photo_url} alt={winner.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full gradient-gold flex items-center justify-center">
                        <span className="font-gilda text-7xl text-black/60">
                          {(winner.name || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-gilda text-2xl text-white mb-1 group-hover:text-gold transition-colors">{winner.name}</h3>
                    <p className="text-gold/80 text-sm mb-2">{winner.title}{winner.company ? ` — ${winner.company}` : ''}</p>
                    <span className="inline-block text-xs uppercase tracking-widest text-white/40 border border-gold/20 px-3 py-1 mb-3">{winner.award_category}</span>
                    {winner.year && <p className="text-white/30 text-xs">Year: {winner.year}</p>}
                    {winner.bio && <p className="text-white/50 text-sm mt-3 leading-relaxed line-clamp-3">{winner.bio}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
            {filteredWinners.length === 0 && (
              <p className="text-center text-white/40 font-gilda text-xl">No winners for {selectedYear}</p>
            )}
          </div>
        </section>
      )}

      {/* Event Info */}
      <section className="py-20 md:py-28 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
            <h2 className="font-gilda text-4xl md:text-5xl text-white mb-12">Event Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-gold/10 p-8 hover:border-gold/30 transition-colors duration-500">
                <Calendar className="w-8 h-8 text-gold mx-auto mb-4" />
                <h3 className="font-gilda text-xl text-gold mb-2">Date</h3>
                <p className="text-white/50 text-sm">Annual Gala — Date To Be Announced</p>
              </div>
              <div className="border border-gold/10 p-8 hover:border-gold/30 transition-colors duration-500">
                <MapPin className="w-8 h-8 text-gold mx-auto mb-4" />
                <h3 className="font-gilda text-xl text-gold mb-2">Location</h3>
                <p className="text-white/50 text-sm">Venue To Be Announced</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
