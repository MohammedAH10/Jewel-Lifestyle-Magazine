import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, User, Building, Play, Share2, Twitter, Linkedin, Facebook, Copy, Check } from 'lucide-react'
import { api } from '@/api/client'
import { createPageUrl } from '@/utils'
import { Button } from '@/components/ui/button'

function isHTML(str) {
  return /<[a-z][\s\S]*>/i.test(str)
}

export default function InterviewDetail() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) {
      setError('No interview ID provided')
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchInterview = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await api.get(`/executives/${id}`)
        if (!cancelled) {
          setInterview(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load interview')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchInterview()

    return () => {
      cancelled = true
    }
  }, [id])

  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = interview
    ? `Check out the interview with ${interview.name} on Jewel Lifestyle Magazine`
    : 'Jewel Lifestyle Magazine'

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const input = document.createElement('input')
      input.value = pageUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin mb-4" />
        <p className="text-white/50 font-gilda text-lg">Loading interview...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <p className="text-red-400 font-gilda text-2xl mb-4">Oops</p>
        <p className="text-white/60 mb-8 text-center">{error}</p>
        <Link
          to={createPageUrl('ExecutiveInterviews')}
          className="inline-flex items-center gap-2 text-gold border border-gold/40 px-6 py-3 hover:bg-gold hover:text-black transition-all duration-300 text-sm tracking-wider uppercase"
        >
          <ArrowLeft size={16} />
          Back to Interviews
        </Link>
      </div>
    )
  }

  if (!interview) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <p className="text-white/60 font-gilda text-2xl mb-8">Interview not found</p>
        <Link
          to={createPageUrl('ExecutiveInterviews')}
          className="inline-flex items-center gap-2 text-gold border border-gold/40 px-6 py-3 hover:bg-gold hover:text-black transition-all duration-300 text-sm tracking-wider uppercase"
        >
          <ArrowLeft size={16} />
          Back to Interviews
        </Link>
      </div>
    )
  }

  const contentIsHTML = isHTML(interview.content)

  return (
    <div className="relative">
      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          to={createPageUrl('ExecutiveInterviews')}
          className="inline-flex items-center gap-2 text-white/50 hover:text-gold transition-colors text-sm tracking-wider uppercase group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Interviews
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] mt-4 overflow-hidden">
        <img
          src={interview.cover_image_url || interview.headshot_url}
          alt={interview.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-black/80 backdrop-blur-sm text-gold text-xs tracking-wider uppercase border border-gold/30">
                {interview.category}
              </span>
              <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-white/70 text-xs tracking-wider uppercase border border-white/10">
                {interview.interview_type}
              </span>
              {interview.published_date && (
                <span className="flex items-center gap-1.5 text-white/50 text-xs">
                  <Calendar size={12} />
                  {new Date(interview.published_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>

            <h1 className="font-gilda text-4xl sm:text-5xl lg:text-6xl text-white mb-4 leading-tight">
              {interview.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/70">
              <span className="flex items-center gap-2">
                <User size={14} className="text-gold" />
                {interview.title}
              </span>
              {interview.company && (
                <span className="flex items-center gap-2">
                  <Building size={14} className="text-gold" />
                  {interview.company}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex gap-12">
          {/* Share Sidebar */}
          <div className="hidden lg:flex flex-col items-center gap-4 sticky top-32 self-start">
            <span className="text-white/40 text-xs tracking-wider uppercase mb-2">Share</span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-gold hover:border-gold/50 transition-all duration-300"
            >
              <Twitter size={16} />
            </a>
            <a
              href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-gold hover:border-gold/50 transition-all duration-300"
            >
              <Linkedin size={16} />
            </a>
            <a
              href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-gold hover:border-gold/50 transition-all duration-300"
            >
              <Facebook size={16} />
            </a>
            <button
              onClick={handleCopyLink}
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-gold hover:border-gold/50 transition-all duration-300"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 min-w-0"
          >
            {/* Video Button */}
            {interview.video_url && (
              <div className="mb-10">
                <a
                  href={interview.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 gradient-gold text-black px-8 py-4 text-sm tracking-wider uppercase font-medium hover:opacity-90 transition-opacity"
                >
                  <Play size={18} fill="currentColor" />
                  Watch Video
                </a>
              </div>
            )}

            {/* Excerpt */}
            {interview.excerpt && (
              <p className="text-gold/80 font-gilda text-xl sm:text-2xl leading-relaxed mb-8 italic">
                {interview.excerpt}
              </p>
            )}

            {/* Content */}
            <div className="border-t border-gold/20 pt-8">
              {contentIsHTML ? (
                <div
                  className="prose prose-invert prose-gold max-w-none
                    prose-headings:font-gilda prose-headings:text-gold
                    prose-a:text-gold prose-a:no-underline hover:prose-a:underline
                    prose-blockquote:border-gold prose-blockquote:text-white/70
                    prose-strong:text-white
                    prose-code:text-gold
                    prose-li:marker:text-gold
                    [&_p]:text-white/80 [&_p]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: interview.content }}
                />
              ) : (
                <div className="text-white/80 leading-relaxed whitespace-pre-wrap font-gilda text-lg">
                  {interview.content}
                </div>
              )}
            </div>

            {/* Mobile Share */}
            <div className="mt-12 pt-8 border-t border-gold/20 lg:hidden">
              <p className="text-white/40 text-xs tracking-wider uppercase mb-4">Share this interview</p>
              <div className="flex items-center gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-gold hover:border-gold/50 transition-all duration-300"
                >
                  <Twitter size={16} />
                </a>
                <a
                  href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-gold hover:border-gold/50 transition-all duration-300"
                >
                  <Linkedin size={16} />
                </a>
                <a
                  href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-gold hover:border-gold/50 transition-all duration-300"
                >
                  <Facebook size={16} />
                </a>
                <button
                  onClick={handleCopyLink}
                  className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-gold hover:border-gold/50 transition-all duration-300"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
