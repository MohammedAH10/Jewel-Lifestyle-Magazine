import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { 
  Menu, X, ChevronDown, Instagram, Linkedin, 
  Twitter, Mail, Phone, MapPin 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", page: "Home" },
    { name: "Executive Interviews", page: "ExecutiveInterviews" },
    { name: "Digital Magazine", page: "DigitalMagazine" },
    { name: "Spotlight Awards", page: "SpotlightAwards" },
    { name: "Advertise", page: "Advertise" },
    { name: "About Us", page: "About" },
    { name: "Contact", page: "Contact" },
  ];

  const isAdminPage = currentPageName === "AdminDashboard";
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');
        
        .font-gilda {
          font-family: 'Cormorant Garamond', serif;
        }
        
        .text-gold {
          color: #D4AF37;
        }
        
        .bg-gold {
          background-color: #D4AF37;
        }
        
        .border-gold {
          border-color: #D4AF37;
        }
        
        .hover-gold:hover {
          color: #D4AF37;
        }
        
        .bg-dark-gold {
          background-color: #B8860B;
        }
        
        .gradient-gold {
          background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
        }
        
        .text-gradient-gold {
          background: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Navigation */}
      {!isAdminPage && (
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            isScrolled 
              ? "bg-black/95 backdrop-blur-md shadow-lg shadow-gold/5" 
              : "bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <Link to={createPageUrl("Home")} className="flex flex-col items-start">
                <span className="font-gilda text-3xl md:text-4xl font-light tracking-wide text-gradient-gold">
                  Jewel
                </span>
                <span className="text-[10px] tracking-[0.3em] text-white/60 uppercase -mt-1">
                  Lifestyle Magazine
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    className={`text-sm tracking-wider uppercase transition-colors duration-300 ${
                      currentPageName === link.page
                        ? "text-gold"
                        : "text-white/80 hover:text-gold"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to={createPageUrl("AdminDashboard")}
                    className="text-sm tracking-wider uppercase text-gold border border-gold px-4 py-2 hover:bg-gold hover:text-black transition-all duration-300"
                  >
                    Admin
                  </Link>
                )}
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gold"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden bg-black/98 border-t border-gold/20"
              >
                <nav className="flex flex-col py-6 px-6 space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.page}
                      to={createPageUrl(link.page)}
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-lg font-gilda tracking-wider ${
                        currentPageName === link.page
                          ? "text-gold"
                          : "text-white/80"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link
                      to={createPageUrl("AdminDashboard")}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-lg font-gilda tracking-wider text-gold"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      )}

      {/* Main Content */}
      <main className={isAdminPage ? "" : "pt-20"}>
        {children}
      </main>

      {/* Footer */}
      {!isAdminPage && (
        <footer className="bg-black border-t border-gold/20 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* Logo & Tagline */}
              <div className="md:col-span-1">
                <h3 className="font-gilda text-4xl text-gradient-gold mb-2">Jewel</h3>
                <p className="text-white/40 text-sm tracking-wider uppercase">
                  Lifestyle Magazine
                </p>
                <p className="font-gilda text-lg text-gold/80 mt-4 italic">
                  "Your Ultimate Source of Inspiration"
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-gilda text-xl text-gold mb-6">Quick Links</h4>
                <ul className="space-y-3">
                  {navLinks.slice(0, 4).map((link) => (
                    <li key={link.page}>
                      <Link
                        to={createPageUrl(link.page)}
                        className="text-white/60 hover:text-gold transition-colors text-sm tracking-wide"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* More Links */}
              <div>
                <h4 className="font-gilda text-xl text-gold mb-6">Explore</h4>
                <ul className="space-y-3">
                  {navLinks.slice(4).map((link) => (
                    <li key={link.page}>
                      <Link
                        to={createPageUrl(link.page)}
                        className="text-white/60 hover:text-gold transition-colors text-sm tracking-wide"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      to={createPageUrl("SubmitStory")}
                      className="text-white/60 hover:text-gold transition-colors text-sm tracking-wide"
                    >
                      Submit a Story
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Social & Contact */}
              <div>
                <h4 className="font-gilda text-xl text-gold mb-6">Connect</h4>
                <div className="flex space-x-4 mb-6">
                  <a
                    href="https://instagram.com/jewell_magazine"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-gold/40 flex items-center justify-center hover:bg-gold hover:text-black transition-all duration-300"
                  >
                    <Instagram size={18} />
                  </a>
                  <a
                    href="https://x.com/jewel_magazine"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-gold/40 flex items-center justify-center hover:bg-gold hover:text-black transition-all duration-300"
                  >
                    <Twitter size={18} />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/jewel-lifestyle-magazine"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-gold/40 flex items-center justify-center hover:bg-gold hover:text-black transition-all duration-300"
                  >
                    <Linkedin size={18} />
                  </a>
                </div>
                <a
                  href="mailto:info@jewellmagazine.com"
                  className="text-white/60 hover:text-gold transition-colors text-sm flex items-center gap-2"
                >
                  <Mail size={14} />
                  info@jewellmagazine.com
                </a>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gold/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-white/40 text-sm">
                © {new Date().getFullYear()} Jewel Lifestyle Magazine. All rights reserved.
              </p>
              <p className="text-white/30 text-xs mt-4 md:mt-0">
                jewellmagazine.com
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
