import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Loader2, LayoutGrid, List, SlidersHorizontal, ArrowUpDown, MessageSquare, Star } from "lucide-react";
import CoachCard from "./CoachCard";
import ExpertAdvisorChat from "./ExpertAdvisorChat";
import { useCoaches } from "@/hooks/useCoaches";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortBy, setSortBy] = useState<"rating" | "clients" | "name">("rating");

  const filteredAndSortedCoaches = useMemo(() => {
    let result = [...coaches];

    // Filter by Category
    if (selectedCategory !== "All") {
      result = result.filter((coach) =>
        coach.tags.some((tag) => tag.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (coach) =>
          coach.name.toLowerCase().includes(query) ||
          coach.specialization.toLowerCase().includes(query) ||
          coach.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "clients") return b.clients - a.clients;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [coaches, selectedCategory, searchQuery, sortBy]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const wordCount = query.trim().split(/\s+/).length;
    if (wordCount > 5 || query.includes('?') || query.includes('help')) {
      setShowAdvisor(true);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSearchQuery("");
    setSelectedCategory(category);
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
      <section className="py-24 px-4 bg-background border-t border-border/50" id="coach-directory">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Discover Expert Coaches</h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto">
              Browse our curated directory of world-class experts and their AI twins
            </p>
          </div>

          <div className="max-w-5xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search coaches by name, specialty, or expertise..."
                  className="pl-10 pr-12 h-11 text-sm border-border/60 bg-muted/20 focus:bg-background shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Open AI coach advisor"
                    className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                    onClick={() => setShowAdvisor(true)}
                  >
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-muted/30 p-1 rounded-xl border border-border/50 flex items-center">
                  <Button
                    size="sm"
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    aria-label="Switch to grid view"
                    aria-pressed={viewMode === "grid"}
                    className={`h-9 w-9 p-0 rounded-lg ${viewMode === "grid" ? "shadow-sm bg-background" : ""}`}
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "table" ? "secondary" : "ghost"}
                    aria-label="Switch to list view"
                    aria-pressed={viewMode === "table"}
                    className={`h-9 w-9 p-0 rounded-lg ${viewMode === "table" ? "shadow-sm bg-background" : ""}`}
                    onClick={() => setViewMode("table")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-11 rounded-xl border-border/60 flex items-center gap-2">
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Sort</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setSortBy("rating")}>Top Rated</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("clients")}>Most Popular</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("name")}>Alphabetical</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" aria-label="Open filters" className="h-11 w-11 p-0 rounded-xl border-border/60">
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300 border ${
                    category === selectedCategory 
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                      : "bg-background text-muted-foreground/70 border-border/60 hover:border-primary hover:text-primary"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {filteredAndSortedCoaches.map((coach) => (
                <CoachCard 
                  key={coach.id} 
                  {...coach}
                />
              ))}
            </div>
          ) : (
            <div className="max-w-7xl mx-auto border rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm shadow-sm">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[300px] text-[10px] font-bold uppercase tracking-wider">Coach</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">Specialization</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">Rating</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">Clients</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedCoaches.map((coach) => (
                    <TableRow key={coach.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img src={coach.image} alt={coach.name} className="w-10 h-10 rounded-lg object-cover ring-1 ring-border" />
                          <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight">{coach.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Verified Coach</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-primary">{coach.specialization}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold">{coach.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-medium">{coach.clients} clients</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 rounded-lg text-[10px] font-bold uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                          onClick={() => window.location.href = `/${coach.slug}/chat`}
                        >
                          <MessageSquare className="w-3 h-3 mr-1.5" />
                          Chat
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredAndSortedCoaches.length === 0 && !isLoading && (
            <div className="text-center py-24">
              <p className="text-muted-foreground mb-6 font-medium">
                No coaches found matching "{searchQuery}"
              </p>
              <Button onClick={() => setShowAdvisor(true)} className="bg-gradient-primary hover:opacity-90 rounded-xl px-6 h-12 shadow-lg shadow-primary/20">
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
