import { api } from '@/api/client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Award, Star, Calendar, MapPin, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/utils'
import { Button } from '@/components/ui/button'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: "easeOut" },
}

const stagger = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 },
}

export default function SpotlightAwards() {
  const [categories, setCategories] = useState([])
  const [winners, setWinners] = useState([])
  const [selectedYear, setSelectedYear] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        const [categoriesData, winnersData] = await Promise.all([
          api.get('/awards/categories'),
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
        if (!cancelled) {
          setError(err.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [])

  const years = [...new Set(winners.map(w => w.year))].sort((a, b) => b - a)
  const filteredWinners = selectedYear
    ? winners.filter(w => w.year === selectedYear)
    : winners

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
            <h2 className="font-gilda text-4xl md:text-5xl text-white mb-6">
              About the Spotlight Awards
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              The Jewel Lifestyle Magazine Spotlight Awards honor extraordinary individuals
              who have made a significant impact in their fields. From visionary entrepreneurs
              and creative artists to influential leaders, our awards celebrate the drive,
              passion, and innovation that shape our world. Each nominee is carefully evaluated
              through a rigorous selection process, ensuring that only the most deserving
              pioneers receive this prestigious recognition.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Calendar, label: "Annual Event", desc: "Held once a year to honor the brightest minds and most impactful contributors across industries." },
              { icon: Award, label: "Multiple Categories", desc: "A diverse range of categories spanning business, arts, technology, philanthropy, and more." },
              { icon: Star, label: "Nomination-Based", desc: "Candidates are nominated by peers, industry experts, and our editorial team before final selection." },
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

      {/* Award Categories */}
      {categories.length > 0 && (
        <section className="py-20 md:py-28 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="text-center mb-16">
              <h2 className="font-gilda text-4xl md:text-5xl text-white mb-4">
                Award Categories
              </h2>
              <p className="text-white/50 text-lg">
                Explore the categories that define excellence
              </p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={{
                animate: { transition: { staggerChildren: 0.08 } },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {categories.map((cat) => (
                <motion.div
                  key={cat.id || cat.category_name}
                  variants={{
                    initial: { opacity: 0, y: 30 },
                    animate: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5 }}
                  className="group p-6 border border-gold/10 hover:border-gold/40 bg-black/50 hover:bg-black/80 transition-all duration-500"
                >
                  <Trophy className="w-8 h-8 text-gold mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-gilda text-2xl text-white mb-2 group-hover:text-gold transition-colors">
                    {cat.category_name}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {cat.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Previous Winners */}
      {winners.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="text-center mb-16">
              <h2 className="font-gilda text-4xl md:text-5xl text-white mb-4">
                Previous Winners
              </h2>
              <p className="text-white/50 text-lg">
                Honoring the achievements of past recipients
              </p>
            </motion.div>

            {/* Year Filter */}
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

            {/* Winners Grid */}
            <motion.div
              key={selectedYear}
              initial="initial"
              animate="animate"
              variants={{
                animate: { transition: { staggerChildren: 0.08 } },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredWinners.map((winner) => (
                <motion.div
                  key={winner.id}
                  variants={{
                    initial: { opacity: 0, y: 30 },
                    animate: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5 }}
                  className="group border border-gold/10 hover:border-gold/40 transition-all duration-500 overflow-hidden"
                >
                  {/* Photo */}
                  <div className="aspect-[4/3] overflow-hidden">
                    {winner.photo_url ? (
                      <img
                        src={winner.photo_url}
                        alt={winner.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full gradient-gold flex items-center justify-center">
                        <span className="font-gilda text-7xl text-black/60">
                          {(winner.name || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="font-gilda text-2xl text-white mb-1 group-hover:text-gold transition-colors">
                      {winner.name}
                    </h3>
                    <p className="text-gold/80 text-sm mb-2">
                      {winner.title}{winner.company ? ` — ${winner.company}` : ''}
                    </p>
                    <span className="inline-block text-xs uppercase tracking-widest text-white/40 border border-gold/20 px-3 py-1 mb-3">
                      {winner.award_category}
                    </span>
                    {winner.year && (
                      <p className="text-white/30 text-xs">Year: {winner.year}</p>
                    )}
                    {winner.bio && (
                      <p className="text-white/50 text-sm mt-3 leading-relaxed line-clamp-3">
                        {winner.bio}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {filteredWinners.length === 0 && (
              <p className="text-center text-white/40 font-gilda text-xl">
                No winners for {selectedYear}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Event Info */}
      <section className="py-20 md:py-28 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
            <h2 className="font-gilda text-4xl md:text-5xl text-white mb-12">
              Event Details
            </h2>
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

      {/* Nominate CTA */}
      <section className="py-20 md:py-28">
        <motion.div {...fadeUp} className="text-center">
          <h2 className="font-gilda text-4xl md:text-5xl text-white mb-4">
            Know a Remarkable Leader?
          </h2>
          <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
            Submit a nomination and help us recognize those who are making a difference.
          </p>
          <Link to={createPageUrl('NominationForm')}>
            <Button className="bg-gold hover:bg-gold/90 text-black font-gilda text-lg px-10 py-6 rounded-none inline-flex items-center gap-2">
              Submit a Nomination <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
