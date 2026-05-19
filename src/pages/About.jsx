import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/utils'
import { Target, Eye, Heart, Award, Instagram, Twitter, Linkedin, Sparkles, Globe } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const values = [
  {
    icon: Award,
    title: 'Excellence',
    description:
      'We are dedicated to delivering outstanding content that meets the highest standards of journalism and storytelling.',
  },
  {
    icon: Heart,
    title: 'Integrity',
    description:
      'Trust is our foundation. We uphold the values of honesty, transparency, and ethical reporting in every story we tell.',
  },
  {
    icon: Sparkles,
    title: 'Innovation',
    description:
      'We embrace creativity and forward-thinking approaches to bring fresh perspectives to our readers across digital platforms.',
  },
]

const socialLinks = [
  { icon: Instagram, href: 'https://instagram.com/jewell_magazine', label: 'Instagram' },
  { icon: Twitter, href: 'https://x.com/jewel_magazine', label: 'X (Twitter)' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/jewel-lifestyle-magazine', label: 'LinkedIn' },
  { icon: Globe, href: 'https://pinterest.com/jewellifestyle_magazine', label: 'Pinterest' },
]

export default function About() {
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
            Our Story
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto"
          >
            Discover the passion, purpose, and people behind Jewel Lifestyle Magazine
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-zinc-900/50 border border-gold/10 p-10 rounded-sm"
            >
              <Target className="w-10 h-10 text-gold mb-6" />
              <h2 className="font-gilda text-3xl md:text-4xl text-white mb-4">Our Mission</h2>
              <p className="text-zinc-400 leading-relaxed text-lg">
                Jewel Lifestyle Magazine is your ultimate source of inspiration, celebrating the
                stories of visionaries, entrepreneurs, and changemakers who are shaping the world
                around us.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-zinc-900/50 border border-gold/10 p-10 rounded-sm"
            >
              <Eye className="w-10 h-10 text-gold mb-6" />
              <h2 className="font-gilda text-3xl md:text-4xl text-white mb-4">Our Vision</h2>
              <p className="text-zinc-400 leading-relaxed text-lg">
                To become Africa's leading lifestyle platform, amplifying extraordinary voices and
                fostering a community of dreamers, doers, and leaders across the globe.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gradient-to-b from-black to-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-gold text-sm tracking-[0.3em] uppercase">What We Stand For</span>
            <h2 className="font-gilda text-4xl md:text-5xl text-white mt-4">Our Values</h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={itemVariants}
                className="bg-black border border-gold/10 hover:border-gold/30 p-8 rounded-sm text-center group transition-all duration-500"
              >
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-gold/20 transition-colors">
                  <value.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="font-gilda text-2xl text-white mb-3">{value.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The Jewel Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-gold text-sm tracking-[0.3em] uppercase">Our Journey</span>
              <h2 className="font-gilda text-4xl md:text-5xl text-white mt-4">The Jewel Story</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-6 text-zinc-400 leading-relaxed text-lg"
            >
              <p>
                Founded in 2020, Jewel Lifestyle Magazine was born from a vision to create a
                platform that celebrates excellence, inspires ambition, and connects extraordinary
                individuals with a global audience.
              </p>
              <p>
                Based in Gombe, Nigeria, our magazine has grown from a local publication into a
                globally recognized brand with a perspective that bridges African heritage and
                international influence. We believe that every story has the power to inspire change,
                and we are committed to sharing narratives that matter.
              </p>
              <p>
                From exclusive executive interviews to curated lifestyle content, each piece we
                publish reflects our unwavering commitment to quality, authenticity, and the
                celebration of human achievement. Our team works tirelessly to ensure that every
                edition delivers value, insight, and inspiration to our growing community of readers.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-20 bg-zinc-900/30 border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-gold text-sm tracking-[0.3em] uppercase">Stay Connected</span>
            <h2 className="font-gilda text-4xl md:text-5xl text-white mt-4 mb-6">Follow Us</h2>
            <p className="text-zinc-400 text-lg mb-12 max-w-xl mx-auto">
              Join our community and stay updated with the latest stories, features, and
              behind-the-scenes content.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-6"
          >
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-8 py-4 border border-gold/20 text-zinc-300 hover:border-gold hover:text-gold transition-all duration-300 rounded-sm group"
              >
                <link.icon className="w-5 h-5" />
                <span className="text-sm tracking-wider uppercase">{link.label}</span>
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA - Feature With Us */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-gilda text-4xl md:text-5xl text-white mb-4">Feature With Us</h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
              Have a story to tell? We are always looking for visionary voices to feature. Share
              your journey with our audience.
            </p>
            <Link
              to={createPageUrl('SubmitStory')}
              className="inline-flex items-center gap-3 gradient-gold text-black px-10 py-5 font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity"
            >
              Submit Your Story
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
