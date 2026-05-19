import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import InterviewCard from '@/components/interviews/InterviewCard'
import { api } from '@/api/client'

const CATEGORIES = [
  'All', 'Tech', 'Fashion', 'Hospitality', 'Business',
  'Finance', 'Healthcare', 'Entertainment', 'Other'
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

export default function ExecutiveInterviews() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [year, setYear] = useState('All')
  const [availableYears, setAvailableYears] = useState([])

  useEffect(() => {
    fetchInterviews()
  }, [category, year])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInterviews()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  async function fetchInterviews() {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (search) params.search = search
      if (category && category !== 'All') params.category = category
      if (year && year !== 'All') params.year = year
      const data = await api.get('/executives', params)
      const list = Array.isArray(data) ? data : data?.data || data?.interviews || []
      setInterviews(list)
      if (availableYears.length === 0) {
        const years = [...new Set(list.map(i => {
          const d = i.published_date || i.created_at
          return d ? new Date(d).getFullYear() : null
        }).filter(Boolean))].sort((a, b) => b - a)
        setAvailableYears(years)
      }
    } catch (err) {
      setError(err.message || 'Failed to load interviews')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Hero Banner */}
      <section className="relative py-24 bg-gradient-to-b from-zinc-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-gilda text-5xl md:text-6xl lg:text-7xl text-gold mb-6"
          >
            Executive Interviews
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto"
          >
            In-depth conversations with industry leaders, CEOs, innovators, and changemakers
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Search by name or company..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-zinc-900 border-gold/20 text-white placeholder:text-zinc-500 focus-visible:ring-gold/50"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full md:w-44 h-10 pl-10 pr-4 bg-zinc-900 border border-gold/20 text-white text-sm rounded-md appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/50"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1 md:flex-none">
                <select
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="w-full md:w-32 h-10 pl-4 pr-8 bg-zinc-900 border border-gold/20 text-white text-sm rounded-md appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/50"
                >
                  <option value="All">All Years</option>
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              {(search || category !== 'All' || year !== 'All') && (
                <Button
                  onClick={() => { setSearch(''); setCategory('All'); setYear('All') }}
                  variant="outline"
                  className="border-gold/30 text-gold hover:bg-gold hover:text-black whitespace-nowrap"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-32">
              <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-32">
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <Button
                onClick={fetchInterviews}
                className="bg-gold text-black hover:bg-gold/90"
              >
                Try Again
              </Button>
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-zinc-500 text-lg mb-2">No interviews found</p>
              <p className="text-zinc-600 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {interviews.map((interview, index) => (
                <InterviewCard key={interview.id} interview={interview} index={index} />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
