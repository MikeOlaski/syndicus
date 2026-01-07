import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ExpertRecruiterChat from "./ExpertRecruiterChat";
import VideoPlayerModal from "./VideoPlayerModal";

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecruiter, setShowRecruiter] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const scrollToCoaches = () => {
    const coachSection = document.querySelector("#coach-directory");
    coachSection?.scrollIntoView({
      behavior: "smooth",
    });
  };
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Any query opens the Expert Recruiter in focus mode
      setShowRecruiter(true);
    }
  };
  return (
    <>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            One Question. <span className="bg-gradient-primary bg-clip-text text-transparent">Eight Expert Minds.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Your toughest challenges deserve more than one perspective. Our AI-powered Council of Experts combines the
            wisdom of world-class coaches into a single, unified conversation—giving you balanced insights, 24/7.
          </p>
          <p className="text-base text-muted-foreground/80 mb-8 max-w-xl mx-auto">
            Whether you need strategic clarity, leadership guidance, or breakthrough thinking—describe your challenge
            and let our Mixture of Experts work together to find your best path forward.
          </p>

          {/* Smart Search Input */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What challenge are you facing today?"
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
              Describe your situation—our AI matches you with the perfect blend of expert perspectives
            </p>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90" onClick={scrollToCoaches}>
              Chat with an Expert
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/syndic8")}>
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
