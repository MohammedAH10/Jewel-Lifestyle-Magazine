import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Instagram, Twitter, Linkedin, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'info@jewellmagazine.com',
    href: 'mailto:info@jewellmagazine.com',
  },
  {
    icon: Phone,
    label: 'Phone / WhatsApp',
    value: '+234 903 135 7319',
    href: 'https://wa.me/2349031357319',
  },
  {
    icon: MapPin,
    label: 'Address',
    value: 'Rainbow Hotel Road, Tumfure Gombe, Gombe State',
    href: null,
  },
]

const socialLinks = [
  {
    icon: Instagram,
    label: 'Instagram',
    handle: '@jewell_magazine',
    href: 'https://instagram.com/jewell_magazine',
  },
  {
    icon: Twitter,
    label: 'X / Twitter',
    handle: '@jewel_magazine',
    href: 'https://x.com/jewel_magazine',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    handle: 'Jewel Lifestyle Magazine',
    href: 'https://www.linkedin.com/in/jewel-lifestyle-magazine',
  },
  {
    icon: Instagram,
    label: 'Pinterest',
    handle: '@jewellifestyle_magazine',
    href: 'https://pinterest.com/jewellifestyle_magazine',
  },
]

function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="w-2 h-2 rotate-45 border border-gold/60" />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </div>
  )
}

export default function Contact() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-gilda text-5xl md:text-6xl lg:text-7xl text-gold mb-4">
            Contact Us
          </h1>
          <GoldDivider />
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            We'd love to hear from you. Get in touch with the Jewel Lifestyle Magazine team.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="group border border-gold/10 hover:border-gold/30 transition-all duration-500 p-6"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 flex items-center justify-center border border-gold/20 group-hover:border-gold/50 transition-colors shrink-0">
                    <item.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-gilda text-sm text-white/40 tracking-widest uppercase mb-1">
                      {item.label}
                    </h3>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="font-gilda text-xl text-white hover:text-gold transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-gilda text-xl text-white">{item.value}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="font-gilda text-sm text-white/40 tracking-widest uppercase mb-6">
              Follow Us
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {socialLinks.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="group border border-gold/10 hover:border-gold/40 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 p-5"
                >
                  <div className="flex items-center gap-4">
                    <item.icon className="w-6 h-6 text-gold/70 group-hover:text-gold transition-colors" />
                    <div>
                      <p className="font-gilda text-white group-hover:text-gold transition-colors">
                        {item.label}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">{item.handle}</p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        <GoldDivider />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center max-w-lg mx-auto mt-16"
        >
          <div className="border border-gold/10 p-8 hover:border-gold/30 transition-all duration-500">
            <Mail className="w-10 h-10 text-gold mx-auto mb-4" />
            <h2 className="font-gilda text-2xl text-gold mb-3">Send Us a Message</h2>
            <p className="text-white/50 text-sm mb-6">
              Have a story tip, press inquiry, or feedback? We're all ears.
            </p>
            <a
              href="mailto:info@jewellmagazine.com"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-black font-medium tracking-wider uppercase text-sm hover:bg-gold/90 transition-all"
            >
              <Mail className="w-4 h-4" />
              Email Us
            </a>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
