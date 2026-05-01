import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CoverStoriesCarousel({ interviews }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (interviews.length === 0) return null;

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-gold text-sm tracking-[0.3em] uppercase">Featured</span>
            <h2 className="font-gilda text-4xl md:text-5xl text-white mt-2">
              Cover Stories
            </h2>
          </div>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-12 h-12 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all duration-300"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all duration-300"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {interviews.map((interview, index) => (
            <Link
              key={interview.id}
              to={createPageUrl(`InterviewDetail?id=${interview.id}`)}
              className="flex-shrink-0 w-[300px] md:w-[380px] group snap-start"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
                  <img
                    src={interview.cover_image_url || interview.headshot_url}
                    alt={interview.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  {/* Category Badge */}
                  <span className="absolute top-4 left-4 px-3 py-1 bg-gold text-black text-xs tracking-wider uppercase font-medium">
                    {interview.category}
                  </span>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-gilda text-2xl md:text-3xl text-white mb-2 group-hover:text-gold transition-colors">
                      {interview.name}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {interview.title}
                    </p>
                    <p className="text-gold/80 text-sm mt-1">
                      {interview.company}
                    </p>
                  </div>
                </div>

                {/* Gold accent line */}
                <div className="h-1 bg-gradient-to-r from-gold to-transparent mt-0 transition-all duration-300 group-hover:from-gold group-hover:to-gold/50" />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
