import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Play } from "lucide-react";

export default function InterviewCard({ interview, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        to={createPageUrl(`InterviewDetail?id=${interview.id}`)}
        className="group block bg-zinc-900 border border-gold/10 hover:border-gold/30 transition-all duration-500"
      >
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={interview.cover_image_url || interview.headshot_url}
            alt={interview.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          
          {/* Video indicator */}
          {interview.interview_type === "Video" && (
            <div className="absolute top-4 right-4 w-10 h-10 bg-gold flex items-center justify-center">
              <Play size={16} className="text-black ml-0.5" fill="currentColor" />
            </div>
          )}
          
          {/* Category */}
          <span className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-sm text-gold text-xs tracking-wider uppercase border border-gold/30">
            {interview.category}
          </span>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="font-gilda text-2xl text-white mb-2 group-hover:text-gold transition-colors">
              {interview.name}
            </h3>
            <p className="text-white/60 text-sm">{interview.title}</p>
            <p className="text-gold/70 text-sm">{interview.company}</p>
          </div>
        </div>

        {/* Bottom section */}
        <div className="p-6 border-t border-gold/10">
          <p className="text-white/50 text-sm line-clamp-2 mb-4">
            {interview.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs">
              {interview.interview_type}
            </span>
            <div className="flex items-center text-gold text-sm tracking-wider uppercase group-hover:gap-3 gap-1 transition-all">
              <span>Read</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
