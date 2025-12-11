import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Loader2 } from "lucide-react";
import CoachCard from "./CoachCard";
import ExpertAdvisorChat from "./ExpertAdvisorChat";
import { useCoaches } from "@/hooks/useCoaches";

const categories = [
  "All",
  "Leadership",
  "Wellness",
  "Career",
  "Business",
  "Relationships",
  "Performance",
];

const CoachDirectory = () => {
  const { data: coaches = [], isLoading, error } = useCoaches();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredCoaches, setFilteredCoaches] = useState(coaches);

  useEffect(() => {
    if (coaches.length > 0 && filteredCoaches.length === 0) {
      setFilteredCoaches(coaches);
    }
  }, [coaches, filteredCoaches.length]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Check if it's a complex query
    const wordCount = query.trim().split(/\s+/).length;
    if (wordCount > 5 || query.includes('?') || query.includes('help')) {
      setShowAdvisor(true);
      return;
    }

    // Simple filter
    if (query.trim()) {
      const filtered = coaches.filter(
        (coach) =>
          coach.name.toLowerCase().includes(query.toLowerCase()) ||
          coach.specialization.toLowerCase().includes(query.toLowerCase()) ||
          coach.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredCoaches(filtered);
    } else {
      applyFilters(selectedCategory);
    }
  };

  const applyFilters = (category: string) => {
    setSelectedCategory(category);
    if (category === "All") {
      setFilteredCoaches(coaches);
    } else {
      const filtered = coaches.filter((coach) =>
        coach.tags.some((tag) => tag.toLowerCase() === category.toLowerCase())
      );
      setFilteredCoaches(filtered);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSearchQuery("");
    applyFilters(category);
  };

  if (error) {
    return (
      <section className="py-16 px-4 bg-muted/30" id="coach-directory">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Discover Expert Coaches</h2>
          <p className="text-destructive">Error loading coaches. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 px-4 bg-muted/30" id="coach-directory">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Discover Expert Coaches</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our directory of specialized coaches and their AI-powered personabots
            </p>
          </div>

          <div className="max-w-6xl mx-auto mb-8">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search coaches or describe your needs for AI recommendations..."
                className="pl-10 pr-12 h-12"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchQuery && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowAdvisor(true)}
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === selectedCategory ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {filteredCoaches.map((coach) => (
                <CoachCard 
                  key={coach.id} 
                  id={coach.id}
                  slug={coach.slug}
                  name={coach.name}
                  specialization={coach.specialization}
                  rating={coach.rating}
                  clients={coach.clients}
                  description={coach.description}
                  personality={coach.personality}
                  tags={coach.tags}
                  image={coach.image}
                  variant={coach.variant}
                />
              ))}
            </div>
          )}

          {filteredCoaches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No coaches found matching "{searchQuery}"
              </p>
              <Button onClick={() => setShowAdvisor(true)} className="bg-gradient-primary">
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Recommendations
              </Button>
            </div>
          )}
        </div>
      </section>

      {showAdvisor && (
        <ExpertAdvisorChat
          initialQuery={searchQuery || "Help me find the right coaches for my needs"}
          onClose={() => {
            setShowAdvisor(false);
            setSearchQuery("");
          }}
        />
      )}
    </>
  );
};

export default CoachDirectory;
