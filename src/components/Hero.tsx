import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ExpertRecruiterChat from "./ExpertRecruiterChat";
import VideoPlayerModal from "./VideoPlayerModal";

const headlines = [
  {
    main: "A Board of Advisors on Demand —",
    highlight: "For the Price of\nOne Coaching Session"
  },
  {
    main: "8 Expert Minds.\n1 Conversation.",
    highlight: "Decisions You Can Actually Trust."
  },
  {
    main: "One Coach. One Perspective.\n8 Blind Spots.",
    highlight: "There's a Better Way."
  }
];

const Hero = () => {
  const navigate = useNavigate();
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecruiter, setShowRecruiter] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeadline((prev) => (prev + 1) % headlines.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollToCoaches = () => {
    const coachSection = document.querySelector("#coach-directory");
    coachSection?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowRecruiter(true);
    }
  };

  return (
    <>
      <section className="py-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="min-h-[180px] md:min-h-[220px] flex flex-col items-center justify-center mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentHeadline}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full"
              >
                <h1 className="text-4xl md:text-6xl font-bold leading-tight whitespace-pre-line">
                  {headlines[currentHeadline].main}{"\n"}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    {headlines[currentHeadline].highlight}
                  </span>
                </h1>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2 mt-8">
              {headlines.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentHeadline(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentHeadline 
                      ? "bg-primary w-6" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Your toughest challenges deserve more than one perspective. Our AI-powered Council of Experts combines the
            wisdom of world-class coaches into a single, unified conversation—giving you balanced insights, 24/7.
          </p>
          <p className="text-base text-muted-foreground/80 mb-10 max-w-xl mx-auto">
            Whether you need strategic clarity, leadership guidance, or breakthrough thinking—describe your challenge
            and let our Mixture of Experts work together to find your best path forward.
          </p>

          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-10">
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What challenge are you facing today?"
                className="w-full px-8 py-5 pr-14 text-lg border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background shadow-xl group-hover:shadow-2xl transition-all duration-300"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Search coaches and start your council session"
                className="absolute right-2.5 top-2.5 h-11 w-11 rounded-xl bg-gradient-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                disabled={!searchQuery.trim()}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </Button>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mt-4">
              Step 1: Describe your situation below
            </p>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8 rounded-xl bg-gradient-primary shadow-lg shadow-primary/20 hover:opacity-95 transition-all" onClick={scrollToCoaches}>
              Chat with an Expert
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl border-border/60 hover:bg-muted/50 transition-all font-semibold" onClick={() => navigate("/syndic8")}>
              Build Your Expert Council
            </Button>
          </div>
        </div>
      </section>

      {showRecruiter && (
        <ExpertRecruiterChat
          initialQuery={searchQuery}
          onClose={() => {
            setShowRecruiter(false);
            setSearchQuery("");
          }}
        />
      )}

      <VideoPlayerModal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} />
    </>
  );
};

export default Hero;
