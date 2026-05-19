import React, { useState } from "react";
import { motion } from "framer-motion";
import { api } from '@/api/client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Mail } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    await api.post('/subscribers', {
      email,
      name,
      subscribed_date: new Date().toISOString().split("T")[0],
      is_active: true,
    });
    
    setIsSuccess(true);
    setIsLoading(false);
    setEmail("");
    setName("");
    
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <section className="py-20 bg-zinc-950 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #D4AF37 0, #D4AF37 1px, transparent 0, transparent 50%)`,
          backgroundSize: "20px 20px",
        }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Mail className="w-12 h-12 text-gold mx-auto mb-6" strokeWidth={1} />
          <h2 className="font-gilda text-4xl md:text-5xl text-white mb-4">
            Stay Inspired
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
            Subscribe to receive exclusive updates on new issues, executive interviews, 
            events, and award announcements.
          </p>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 text-gold"
            >
              <CheckCircle size={24} />
              <span className="text-lg">Thank you for subscribing!</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 h-14 bg-black border-gold/30 text-white placeholder:text-white/40 focus:border-gold"
                />
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 h-14 bg-black border-gold/30 text-white placeholder:text-white/40 focus:border-gold"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 px-8 gradient-gold text-black font-medium tracking-wider uppercase hover:opacity-90 transition-opacity"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
