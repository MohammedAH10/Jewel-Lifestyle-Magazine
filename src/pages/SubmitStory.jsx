import { api } from '@/api/client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, Loader2, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const storyTypes = [
  'Executive Interview',
  'Lifestyle Feature',
  'Business Story',
  'Event Coverage',
  'Other',
]

export default function SubmitStory() {
  const [formData, setFormData] = useState({
    your_name: '',
    your_email: '',
    phone: '',
    story_title: '',
    story_type: '',
    story_description: '',
    attachment_url: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await api.uploadFile(file)
      handleChange('attachment_url', result.file_url)
    } catch (err) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  function validate() {
    const errors = {}
    if (!formData.your_name.trim()) errors.your_name = 'Your name is required'
    if (!formData.your_email.trim()) {
      errors.your_email = 'Your email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.your_email)) {
      errors.your_email = 'Please enter a valid email address'
    }
    if (!formData.story_title.trim()) errors.story_title = 'Story title is required'
    if (!formData.story_type) errors.story_type = 'Please select a story type'
    if (!formData.story_description.trim()) errors.story_description = 'Story description is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      await api.post('/stories', formData)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-black pt-32 pb-20 px-4">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <CheckCircle className="w-20 h-20 text-gold mx-auto mb-6" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-gilda text-4xl md:text-5xl text-gold mb-4">
              Story Submitted Successfully!
            </h1>
            <p className="text-white/60 text-lg mb-8">
              We'll review it and get back to you.
            </p>
          </motion.div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black pt-32 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-gilda text-5xl md:text-6xl text-gold mb-4">
            Submit a Story
          </h1>
          <p className="text-white/60 text-lg mb-10">
            Share your story with Jewel Lifestyle Magazine
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg px-6 py-4 mb-8"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="your_name" className="text-white/70">
                Your Name <span className="text-gold">*</span>
              </Label>
              <Input
                id="your_name"
                value={formData.your_name}
                onChange={(e) => handleChange('your_name', e.target.value)}
                className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold ${fieldErrors.your_name ? 'border-red-500' : ''}`}
                placeholder="Your full name"
              />
              {fieldErrors.your_name && (
                <p className="text-red-400 text-xs">{fieldErrors.your_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="your_email" className="text-white/70">
                Your Email <span className="text-gold">*</span>
              </Label>
              <Input
                id="your_email"
                type="email"
                value={formData.your_email}
                onChange={(e) => handleChange('your_email', e.target.value)}
                className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold ${fieldErrors.your_email ? 'border-red-500' : ''}`}
                placeholder="you@example.com"
              />
              {fieldErrors.your_email && (
                <p className="text-red-400 text-xs">{fieldErrors.your_email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white/70">
              Phone
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold"
              placeholder="+234 ..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story_title" className="text-white/70">
              Story Title <span className="text-gold">*</span>
            </Label>
            <Input
              id="story_title"
              value={formData.story_title}
              onChange={(e) => handleChange('story_title', e.target.value)}
              className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold ${fieldErrors.story_title ? 'border-red-500' : ''}`}
              placeholder="Title of your story"
            />
            {fieldErrors.story_title && (
              <p className="text-red-400 text-xs">{fieldErrors.story_title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="story_type" className="text-white/70">
              Story Type <span className="text-gold">*</span>
            </Label>
            <Select
              value={formData.story_type}
              onValueChange={(val) => handleChange('story_type', val)}
            >
              <SelectTrigger
                className={`bg-white/5 border-white/10 text-white focus:ring-gold ${fieldErrors.story_type ? 'border-red-500' : ''}`}
              >
                <SelectValue placeholder="Select story type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                {storyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.story_type && (
              <p className="text-red-400 text-xs">{fieldErrors.story_type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="story_description" className="text-white/70">
              Story Description <span className="text-gold">*</span>
            </Label>
            <Textarea
              id="story_description"
              rows={5}
              value={formData.story_description}
              onChange={(e) => handleChange('story_description', e.target.value)}
              className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold resize-none ${fieldErrors.story_description ? 'border-red-500' : ''}`}
              placeholder="Tell us about your story..."
            />
            {fieldErrors.story_description && (
              <p className="text-red-400 text-xs">{fieldErrors.story_description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment" className="text-white/70">
              Attachment <span className="text-white/40">(optional)</span>
            </Label>
            <div className="relative">
              <Input
                id="attachment"
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="bg-white/5 border-white/10 text-white file:bg-gold file:text-black file:border-0 file:px-4 file:py-2 file:mr-4 file:text-sm file:font-medium file:cursor-pointer hover:file:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              />
              {uploading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-gold animate-spin" />
                </div>
              )}
            </div>
            {formData.attachment_url && (
              <p className="text-green-400 text-xs flex items-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3" />
                File uploaded successfully
              </p>
            )}
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={submitting || uploading}
              className="w-full h-12 bg-gold text-black font-medium tracking-wider uppercase text-sm hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Story
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
