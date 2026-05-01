import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function HeroCarousel({ slides }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="relative h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-gilda text-5xl md:text-7xl text-gradient-gold mb-4">
            Jewel
          </h1>
          <p className="font-gilda text-2xl text-white/60 italic">
            Lifestyle Magazine
          </p>
          <p className="text-gold mt-4 tracking-widest text-sm uppercase">
            Your Ultimate Source of Inspiration
          </p>
        </div>
      </div>
    );
  }

  const goToSlide = (index) => setCurrentIndex(index);
  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length);

  const handleDragEnd = (e, { offset, velocity }) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -1000 || offset.x < -50) {
      goToNext();
    } else if (swipe > 1000 || offset.x > 50) {
      goToPrev();
    }
  };

  return (
    <div className="relative h-screen overflow-hidden touch-pan-y">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover"
            style={{ backgroundImage: `url(${slides[currentIndex]?.image_url})`, backgroundPosition: 'center 20%' }}
            
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="max-w-2xl"
              >
                <span className="inline-block px-4 py-1 border border-gold/50 text-gold text-xs tracking-[0.3em] uppercase mb-6">
                  {slides[currentIndex]?.slide_type || "Featured"}
                </span>
                <h1 className="font-gilda text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-6">
                  {slides[currentIndex]?.title}
                </h1>
                {slides[currentIndex]?.subtitle && (
                  <p className="text-white/70 text-lg md:text-xl mb-8 font-light">
                    {slides[currentIndex]?.subtitle}
                  </p>
                )}
                {slides[currentIndex]?.link_url && (
                  <Link
                    to={slides[currentIndex]?.link_url}
                    className="inline-flex items-center gap-3 gradient-gold text-black px-8 py-4 font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity"
                  >
                    {slides[currentIndex]?.link_text || "Discover More"}
                    <ChevronRight size={18} />
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1 transition-all duration-300 ${
              index === currentIndex
                ? "w-12 bg-gold"
                : "w-6 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
