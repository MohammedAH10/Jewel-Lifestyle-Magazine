import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import HeroCarousel from "@/components/home/HeroCarousel";
import CoverStoriesCarousel from "@/components/home/CoverStoriesCarousel";
import WelcomeSection from "@/components/home/WelcomeSection";
import QuickLinksSection from "@/components/home/QuickLinksSection";
import NewsletterSection from "@/components/home/NewletterSection";
import { api } from "@/api/client";

export default function Home() {
  const [slides, setSlides] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [slidesData, interviewsData] = await Promise.all([
          api.get("/heroes"),
          api.get("/executives", { cover: "true" }),
        ]);

        if (cancelled) return;

        setSlides(slidesData || []);
        setInterviews(interviewsData || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
          <p className="font-gilda text-xl text-gold/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="font-gilda text-2xl text-gold mb-4">Welcome to Jewel Lifestyle Magazine</p>
          <p className="text-white/50 text-sm">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      <HeroCarousel slides={slides} />
      <WelcomeSection />
      <QuickLinksSection />
      <CoverStoriesCarousel interviews={interviews} />
      <NewsletterSection />
    </main>
  );
}
