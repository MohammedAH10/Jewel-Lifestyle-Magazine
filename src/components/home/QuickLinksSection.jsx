import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Users, Award, Megaphone, ArrowRight } from "lucide-react";

const links = [
  {
    title: "Digital Magazine",
    description: "Explore our latest digital editions",
    icon: BookOpen,
    page: "DigitalMagazine",
  },
  {
    title: "Executive Interviews",
    description: "In-depth conversations with industry leaders",
    icon: Users,
    page: "ExecutiveInterviews",
  },
  {
    title: "Spotlight Awards",
    description: "Celebrating excellence and innovation",
    icon: Award,
    page: "SpotlightAwards",
  },
  {
    title: "Advertise",
    description: "Partner with Jewel Lifestyle Magazine",
    icon: Megaphone,
    page: "Advertise",
  },
];

export default function QuickLinksSection() {
  return (
    <section className="py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {links.map((link, index) => (
            <motion.div
              key={link.page}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={createPageUrl(link.page)}
                className="group block p-8 border border-gold/20 bg-black hover:bg-gold/5 transition-all duration-500 h-full"
              >
                <link.icon className="w-10 h-10 text-gold mb-6" strokeWidth={1} />
                <h3 className="font-gilda text-2xl text-white mb-3 group-hover:text-gold transition-colors">
                  {link.title}
                </h3>
                <p className="text-white/50 text-sm mb-6">
                  {link.description}
                </p>
                <div className="flex items-center text-gold text-sm tracking-wider uppercase group-hover:gap-4 gap-2 transition-all">
                  <span>Explore</span>
                  <ArrowRight size={16} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
