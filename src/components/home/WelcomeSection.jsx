import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function WelcomeSection() {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gold text-sm tracking-[0.3em] uppercase">Welcome to</span>
            <h2 className="font-gilda text-5xl md:text-6xl text-white mt-4 mb-8">
              Jewel Lifestyle<br />
              <span className="text-gradient-gold">Magazine</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Jewel Lifestyle Magazine is your ultimate source of inspiration, 
              celebrating the stories of visionaries, entrepreneurs, and changemakers 
              who are shaping the world around us. Through exclusive interviews, 
              compelling features, and stunning visuals, we bring you closer to 
              the people and ideas that matter.
            </p>
            <p className="font-gilda text-2xl text-gold/80 italic mb-10">
              "Your Ultimate Source of Inspiration"
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={createPageUrl("SubmitStory")}
                className="gradient-gold text-black px-8 py-4 font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity"
              >
                Feature With Us
              </Link>
              <Link
                to={createPageUrl("About")}
                className="border border-gold text-gold px-8 py-4 font-medium tracking-wider uppercase text-sm hover:bg-gold hover:text-black transition-all"
              >
                Our Story
              </Link>
            </div>
          </motion.div>

          {/* Visual Element */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Decorative frame */}
              <div className="absolute inset-4 border border-gold/30" />
              <div className="absolute inset-8 border border-gold/20" />
              
              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="font-gilda text-8xl md:text-9xl text-gradient-gold">J</span>
                  <p className="text-white/40 text-sm tracking-[0.5em] uppercase mt-4">
                    Est. 2020
                  </p>
                </div>
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-gold" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-gold" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
