import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCoaches } from "@/hooks/useCoaches";
import { usePublicSyndic8Groups } from "@/hooks/usePublicSyndic8Groups";
import { useViewPreferences } from "@/hooks/useViewPreferences";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PublicSyndic8Card from "@/components/PublicSyndic8Card";
import { SEO } from "@/components/SEO";
import { 
  Loader2, 
  Search, 
  Star, 
  MessageSquare, 
  Users,
  DollarSign,
  Filter,
  Grid3X3,
  List,
  RotateCcw,
  Network
} from "lucide-react";

const DEFAULT_DIRECTORY_PREFS = {
  viewMode: "grid" as "grid" | "list",
};

const Directory = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "coaches";
  
  const { data: coaches = [], isLoading: coachesLoading, error: coachesError } = useCoaches();
  const { data: syndic8Groups = [], isLoading: syndic8Loading } = usePublicSyndic8Groups();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { preferences, updatePreference, resetToDefaults } = useViewPreferences({
    storageKey: "directory_view_prefs",
    defaults: DEFAULT_DIRECTORY_PREFS,
  });

  const { viewMode } = preferences;

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
    setSearchQuery("");
    setSelectedTag(null);
  };

  const allTags = Array.from(
    new Set(coaches.flatMap((coach) => coach.tags))
  ).slice(0, 10);

  const filteredCoaches = coaches.filter((coach) => {
    const matchesSearch =
      !searchQuery ||
      coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesTag =
      !selectedTag ||
      coach.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase());
    return matchesSearch && matchesTag;
  });

  const filteredSyndic8 = syndic8Groups.filter((group) => {
    if (!searchQuery) return true;
    return (
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (group.specializations?.some((s) => s?.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
            <SEO title="Directory — Coaches &amp; Public Syndic8 Councils | Syndic.us" description="Search and filter every PersonaBot coach and public Syndic8 council on Syndic.us. Find the right experts for your challenge." path="/directory" />
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Directory</h1>
                <p className="text-muted-foreground mt-1">
                  Discover {coaches.length} coaches and {syndic8Groups.length} expert councils
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="coaches" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Coaches ({coaches.length})
              </TabsTrigger>
              <TabsTrigger value="syndic8" className="flex items-center gap-2">
                <Network className="w-4 h-4" />
                Syndic8 ({syndic8Groups.length})
              </TabsTrigger>
            </TabsList>

            {/* Search and Filters */}
            <div className="mt-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={activeTab === "coaches" 
                      ? "Search by name, specialization, or expertise..." 
                      : "Search councils by name or specialty..."}
                    className="pl-10 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {activeTab === "coaches" && (
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="icon"
                      className="h-12 w-12"
                      onClick={() => updatePreference("viewMode", "grid")}
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="icon"
                      className="h-12 w-12"
                      onClick={() => updatePreference("viewMode", "list")}
                    >
                      <List className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12"
                      onClick={resetToDefaults}
                      title="Reset to default view"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {activeTab === "coaches" && (
                <div className="flex flex-wrap gap-2 items-center">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Button
                    variant={selectedTag === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag(null)}
                  >
                    All
                  </Button>
                  {allTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Coaches Tab */}
            <TabsContent value="coaches" className="mt-6">
              {coachesLoading && (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              )}

              {coachesError && (
                <div className="text-center py-20">
                  <p className="text-destructive text-lg">
                    Error loading coaches. Please try again later.
                  </p>
                </div>
              )}

              {!coachesLoading && !coachesError && filteredCoaches.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg mb-4">
                    No coaches found matching your criteria.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTag(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}

              {!coachesLoading && !coachesError && viewMode === "grid" && filteredCoaches.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCoaches.map((coach) => (
                    <Card
                      key={coach.id}
                      className="overflow-hidden hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <Avatar
                            className="w-16 h-16 cursor-pointer ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all"
                            onClick={() => navigate(`/${coach.slug}`)}
                          >
                            <AvatarImage src={coach.image} alt={coach.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {getInitials(coach.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-bold text-lg truncate cursor-pointer hover:text-primary transition-colors"
                              onClick={() => navigate(`/${coach.slug}`)}
                            >
                              {coach.name}
                            </h3>
                            <p className="text-sm text-primary font-medium truncate">
                              {coach.specialization}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">
                                  {coach.rating > 0 ? coach.rating.toFixed(1) : "New"}
                                </span>
                              </div>
                              {coach.hourlyRate && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <DollarSign className="w-3 h-3" />
                                  <span>{coach.hourlyRate}/hr</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {coach.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {coach.tags.slice(0, 3).map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs cursor-pointer hover:bg-primary/20"
                              onClick={() => setSelectedTag(tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                          {coach.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{coach.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        <Button
                          className="w-full"
                          onClick={() => navigate(`/${coach.slug}/chat`)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Start Chat
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {!coachesLoading && !coachesError && viewMode === "list" && filteredCoaches.length > 0 && (
                <div className="space-y-4">
                  {filteredCoaches.map((coach) => (
                    <Card
                      key={coach.id}
                      className="overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                      <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start">
                        <Avatar
                          className="w-14 h-14 cursor-pointer ring-2 ring-primary/10 hover:ring-primary/30 transition-all flex-shrink-0"
                          onClick={() => navigate(`/${coach.slug}`)}
                        >
                          <AvatarImage src={coach.image} alt={coach.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(coach.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                            <h3
                              className="font-bold text-lg cursor-pointer hover:text-primary transition-colors"
                              onClick={() => navigate(`/${coach.slug}`)}
                            >
                              {coach.name}
                            </h3>
                            <span className="text-sm text-primary font-medium">
                              {coach.specialization}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                            {coach.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">
                                {coach.rating > 0 ? coach.rating.toFixed(1) : "New"}
                              </span>
                            </div>
                            {coach.hourlyRate && (
                              <span className="text-sm text-muted-foreground">
                                ${coach.hourlyRate}/hr
                              </span>
                            )}
                            <div className="hidden sm:flex gap-1.5">
                              {coach.tags.slice(0, 4).map((tag, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button
                          className="w-full sm:w-auto flex-shrink-0"
                          onClick={() => navigate(`/${coach.slug}/chat`)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {!coachesLoading && !coachesError && filteredCoaches.length > 0 && (
                <p className="text-center text-muted-foreground mt-8">
                  Showing {filteredCoaches.length} of {coaches.length} coaches
                </p>
              )}
            </TabsContent>

            {/* Syndic8 Tab */}
            <TabsContent value="syndic8" className="mt-6">
              {syndic8Loading && (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              )}

              {!syndic8Loading && filteredSyndic8.length === 0 && (
                <div className="text-center py-20">
                  <Network className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Public Councils Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Be the first to publish your Syndic8 council and share your curated 
                    team of experts with the community.
                  </p>
                  <Button onClick={() => navigate("/auth")}>
                    Create Your Syndic8
                  </Button>
                </div>
              )}

              {!syndic8Loading && filteredSyndic8.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSyndic8.map((group) => (
                    <PublicSyndic8Card key={group.id} group={group} />
                  ))}
                </div>
              )}

              {!syndic8Loading && filteredSyndic8.length > 0 && (
                <p className="text-center text-muted-foreground mt-8">
                  Showing {filteredSyndic8.length} of {syndic8Groups.length} councils
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Directory;
