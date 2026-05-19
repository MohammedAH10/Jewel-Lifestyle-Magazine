import { api } from '@/api/client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Megaphone, Users, Target, BarChart3, Mail, Phone, Globe, ChevronRight, Loader2, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

const stats = [
  { icon: Users, label: "Monthly Readers", value: "50K+" },
  { icon: BarChart3, label: "Executive Interviews", value: "200+" },
  { icon: Globe, label: "Annual Events", value: "5+" },
  { icon: Target, label: "Reach", value: "Global" },
]

const benefits = [
  {
    icon: Users,
    title: "Premium Audience",
    description: "Connect with affluent, discerning readers who value luxury, culture, and sophistication.",
  },
  {
    icon: Target,
    title: "Brand Alignment",
    description: "Position your brand alongside curated content that reflects excellence and prestige.",
  },
  {
    icon: BarChart3,
    title: "Measurable Impact",
    description: "Gain valuable insights with detailed analytics on engagement, reach, and conversion.",
  },
  {
    icon: Megaphone,
    title: "Multi-Platform Exposure",
    description: "Reach your audience across print, digital, social media, and exclusive events.",
  },
]

const adOptions = [
  {
    title: "Magazine Print Ad",
    description: "Full-page, half-page, or spread placements in our premium print edition distributed to elite subscribers.",
    features: ["High-quality gloss finish", "Premium paper stock", "Nationwide distribution"],
  },
  {
    title: "Digital Ad",
    description: "Targeted banner placements across our website and digital magazine with rich media capabilities.",
    features: ["Animated & static options", "Geo-targeting available", "Real-time analytics"],
  },
  {
    title: "Sponsored Content",
    description: "Native editorial features and branded content that tells your story in an authentic way.",
    features: ["Expert copywriting", "Social media promotion", "SEO-optimized"],
  },
  {
    title: "Event Sponsorship",
    description: "Exclusive sponsorship opportunities at Jewel Lifestyle events, galas, and executive gatherings.",
    features: ["VIP networking", "Brand visibility", "Speaking opportunities"],
  },
]

const adTypes = [
  "Magazine Print Ad",
  "Digital Ad",
  "Sponsored Content",
  "Event Sponsorship",
  "Other",
]

export default function Advertise() {
  const [team, setTeam] = useState([])
  const [teamLoading, setTeamLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    contact_name: "",
    company_name: "",
    email: "",
    phone: "",
    ad_type: "",
    budget_range: "",
    message: "",
  })

  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    let cancelled = false

    async function fetchTeam() {
      try {
        const data = await api.get('/team')
        if (!cancelled) setTeam(data || [])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setTeamLoading(false)
      }
    }

    fetchTeam()

    return () => { cancelled = true }
  }, [])

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  function validate() {
    const errors = {}
    if (!formData.contact_name.trim()) errors.contact_name = "Contact name is required"
    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }
    if (!formData.message.trim()) errors.message = "Message is required"
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      await api.post('/inquiries', formData)
      setSuccess(true)
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.")
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
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <CheckCircle className="w-20 h-20 text-gold mx-auto mb-6" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-gilda text-4xl md:text-5xl text-gold mb-4">
              Inquiry Sent Successfully
            </h1>
            <p className="text-white/60 text-lg mb-8">
              Thank you for your interest. Our advertising team will get back to you within 48 hours.
            </p>
            <Link
              to={createPageUrl("Home")}
              className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors font-medium"
            >
              <ChevronRight className="w-4 h-4" />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-black min-h-screen">
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-b from-zinc-900 to-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Megaphone className="w-12 h-12 text-gold/60 mx-auto mb-6" />
            <h1 className="font-gilda text-5xl md:text-6xl lg:text-7xl text-gold mb-6">
              Advertise With Us
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto">
              Reach an exclusive audience of industry leaders, innovators, and tastemakers through
              Jewel Lifestyle Magazine's premier advertising platforms.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats / Reach */}
      <section className="py-16 border-y border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-gold mx-auto mb-3" />
                <div className="font-gilda text-3xl md:text-4xl text-white mb-1">{stat.value}</div>
                <div className="text-zinc-500 text-sm uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Advertise */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="font-gilda text-4xl md:text-5xl text-gold mb-4">Why Advertise With Jewel</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Partner with a brand that embodies luxury, sophistication, and influence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-6 rounded-lg border border-gold/10 bg-zinc-900/50 hover:border-gold/30 hover:bg-zinc-900/80 transition-all duration-300"
              >
                <benefit.icon className="w-8 h-8 text-gold mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-gilda text-xl text-white mb-2">{benefit.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Options */}
      <section className="py-20 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="font-gilda text-4xl md:text-5xl text-gold mb-4">Advertising Options</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Choose the format that best showcases your brand to our discerning audience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {adOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 rounded-lg border border-gold/10 bg-black hover:border-gold/30 transition-all duration-300"
              >
                <h3 className="font-gilda text-2xl text-gold mb-3">{option.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">{option.description}</p>
                <ul className="space-y-2">
                  {option.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-zinc-500 text-sm">
                      <ChevronRight className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="font-gilda text-4xl md:text-5xl text-gold mb-4">Meet Our Team</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              The passionate professionals behind Jewel Lifestyle Magazine.
            </p>
          </motion.div>

          {teamLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
          ) : team.length === 0 ? (
            <p className="text-center text-zinc-500">Team information coming soon.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <motion.div
                  key={member.id || member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group p-6 rounded-lg border border-gold/10 bg-zinc-900/50 hover:border-gold/30 transition-all duration-300 text-center"
                >
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4 ring-2 ring-gold/20"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gold/10 mx-auto mb-4 flex items-center justify-center ring-2 ring-gold/20">
                      <span className="font-gilda text-2xl text-gold">
                        {member.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                  <h3 className="font-gilda text-lg text-white mb-1">{member.name}</h3>
                  <p className="text-gold text-sm mb-3">{member.role}</p>
                  {member.bio && (
                    <p className="text-zinc-400 text-xs leading-relaxed mb-4 line-clamp-3">{member.bio}</p>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-gold transition-colors"
                    >
                      LinkedIn
                      <ChevronRight className="w-3 h-3" />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact / Inquiry Form */}
      <section className="py-20 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-12">
              <h2 className="font-gilda text-4xl md:text-5xl text-gold mb-4">Send Us an Inquiry</h2>
              <p className="text-zinc-400 text-lg">
                Ready to elevate your brand? Fill out the form below and our team will reach out.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-4 mb-12">
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gold/10 bg-black">
                <Mail className="w-5 h-5 text-gold flex-shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500">Email</p>
                  <p className="text-sm text-white">advertise@jewellifestyle.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gold/10 bg-black">
                <Phone className="w-5 h-5 text-gold flex-shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500">Phone</p>
                  <p className="text-sm text-white">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gold/10 bg-black">
                <Globe className="w-5 h-5 text-gold flex-shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500">Web</p>
                  <p className="text-sm text-white">jewellifestyle.com/advertise</p>
                </div>
              </div>
            </div>

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
                  <Label htmlFor="contact_name" className="text-white/70">
                    Contact Name <span className="text-gold">*</span>
                  </Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => handleChange("contact_name", e.target.value)}
                    className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold ${
                      fieldErrors.contact_name ? "border-red-500" : ""
                    }`}
                    placeholder="Your full name"
                  />
                  {fieldErrors.contact_name && (
                    <p className="text-red-400 text-xs">{fieldErrors.contact_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name" className="text-white/70">
                    Company Name
                  </Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleChange("company_name", e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold"
                    placeholder="Your company"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/70">
                    Email <span className="text-gold">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold ${
                      fieldErrors.email ? "border-red-500" : ""
                    }`}
                    placeholder="you@example.com"
                  />
                  {fieldErrors.email && (
                    <p className="text-red-400 text-xs">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white/70">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ad_type" className="text-white/70">
                    Ad Type
                  </Label>
                  <Select
                    value={formData.ad_type}
                    onValueChange={(val) => handleChange("ad_type", val)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-gold">
                      <SelectValue placeholder="Select ad type" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {adTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget_range" className="text-white/70">
                    Budget Range
                  </Label>
                  <Input
                    id="budget_range"
                    value={formData.budget_range}
                    onChange={(e) => handleChange("budget_range", e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold"
                    placeholder="e.g. $5,000 - $10,000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-white/70">
                  Message <span className="text-gold">*</span>
                </Label>
                <Textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold resize-none ${
                    fieldErrors.message ? "border-red-500" : ""
                  }`}
                  placeholder="Tell us about your advertising goals and requirements..."
                />
                {fieldErrors.message && (
                  <p className="text-red-400 text-xs">{fieldErrors.message}</p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-gold text-black font-medium tracking-wider uppercase text-sm hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      Send Inquiry
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
