import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ExpertAdvisorChat from "./ExpertAdvisorChat";

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvisor, setShowAdvisor] = useState(false);

  const scrollToCoaches = () => {
    const coachSection = document.querySelector('#coach-directory');
    coachSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Check if it's a complex query (more than a few words)
      const wordCount = searchQuery.trim().split(/\s+/).length;
      if (wordCount > 5 || searchQuery.includes('?') || searchQuery.includes('help')) {
        setShowAdvisor(true);
      } else {
        // Simple search - scroll to coaches
        scrollToCoaches();
      }
    }
  };

  return (
    <>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Meet Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Digital Twin
            </span>{" "}
            Coach
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with AI-powered personabots created by world-class coaches. Get personalized
            guidance, 24/7 availability, and transformative insights tailored to your unique journey.
          </p>
          
          {/* Smart Search Input */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Describe your goals or challenges... (e.g., 'I need help with leadership and work-life balance')"
                className="w-full px-6 py-4 pr-12 text-lg border-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-background shadow-lg"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 top-2 rounded-full bg-gradient-primary"
                disabled={!searchQuery.trim()}
              >
                <Sparkles className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ask a question or describe your needs - our AI will help you build the perfect expert team
            </p>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90" onClick={scrollToCoaches}>
              Browse All Coaches
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {showAdvisor && (
        <ExpertAdvisorChat
          initialQuery={searchQuery}
          onClose={() => {
            setShowAdvisor(false);
            setSearchQuery("");
          }}
        />
      )}
    </>
  );
};

export default Hero;
