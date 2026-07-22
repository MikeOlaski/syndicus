import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Star, ArrowRight, Crown, Sparkles } from "lucide-react";

interface Syndic8SearchResultsProps {
  searchQuery: string;
  selectedCategory: string | null;
}

interface CoachResult {
  id: string;
  slug: string;
  name: string;
  specialization: string;
  rating: number;
  image: string;
  tags: string[];
}

interface GroupResult {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
}

export const Syndic8SearchResults = ({ searchQuery, selectedCategory }: Syndic8SearchResultsProps) => {
  const navigate = useNavigate();
  
  // Fetch coaches that match search - apply filters at database level
  const { data: coaches = [], isLoading: coachesLoading } = useQuery({
    queryKey: ["syndic8-coaches-search", searchQuery, selectedCategory],
    queryFn: async () => {
      // Fetch ALL verified coaches first, then filter
      const { data: coachProfiles, error } = await supabase
        .from("coach_profiles")
        .select("user_id, slug, specialization, rating, expertise, bio")
        .eq("is_verified", true)
        .order("rating", { ascending: false });
      
      if (error) throw error;
      
      // Get profile info
      const userIds = (coachProfiles ?? []).map((c) => c.user_id);
      let profilesMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("public_coach_profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);
        
        profilesMap = new Map((profiles ?? []).map((p) => [p.id!, p]));
      }
      
      let results = (coachProfiles || []).map((coach): CoachResult => {
        const profile = profilesMap.get(coach.user_id);
        return {
          id: coach.user_id,
          slug: coach.slug,
          name: profile?.full_name || "Coach",
          specialization: coach.specialization || "General Coaching",
          rating: Number(coach.rating ?? 4.5),
          image: profile?.avatar_url || "",
          tags: coach.expertise || [],
        };
      });
      
      // Filter by search query (case-insensitive)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        results = results.filter(coach => 
          coach.name.toLowerCase().includes(query) ||
          coach.specialization.toLowerCase().includes(query) ||
          coach.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      // Filter by category (case-insensitive)
      if (selectedCategory) {
        const cat = selectedCategory.toLowerCase();
        results = results.filter(coach =>
          coach.specialization.toLowerCase().includes(cat) ||
          coach.tags.some(tag => tag.toLowerCase().includes(cat))
        );
      }
      
      // Limit to 6 results AFTER filtering
      return results.slice(0, 6);
    },
    enabled: searchQuery.length > 0 || selectedCategory !== null,
  });

  // Fetch public Syndic8 groups (currently user can only see their own, so this will be empty for public)
  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["syndic8-groups-search", searchQuery],
    queryFn: async () => {
      // Note: Due to RLS, public users won't see any groups
      // This returns an empty array for non-authenticated users
      const { data, error } = await supabase
        .from("syndic8_groups")
        .select("id, name, description")
        .limit(6);
      
      if (error) {
        console.log("Groups query - user likely not authenticated:", error.message);
        return [];
      }
      
      let results: GroupResult[] = (data || []).map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        memberCount: 0, // Would need separate query
      }));
      
      // Filter by search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        results = results.filter(group =>
          group.name.toLowerCase().includes(query) ||
          (group.description?.toLowerCase().includes(query))
        );
      }
      
      return results;
    },
    enabled: searchQuery.length > 0 || selectedCategory !== null,
  });

  const isLoading = coachesLoading || groupsLoading;
  const showResults = searchQuery.length > 0 || selectedCategory !== null;

  if (!showResults) return null;

  return (
    <div className="mt-8 space-y-8">
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto" />
          <p className="text-white/80 mt-4">Searching the network...</p>
        </div>
      ) : (
        <>
          {/* Syndic8 Groups Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Syndic8 Groups</h3>
            </div>
            
            {groups.length > 0 ? (
              <div className="grid gap-3">
                {groups.map(group => (
                  <div key={group.id} className="bg-white/10 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{group.name}</h4>
                      {group.description && (
                        <p className="text-sm text-white/70 line-clamp-1">{group.description}</p>
                      )}
                    </div>
                    <Button size="sm" variant="secondary">
                      View Group
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white/5 rounded-lg">
                <Users className="w-10 h-10 text-white/40 mx-auto mb-3" />
                <p className="text-white/70 mb-2">No public Syndic8 groups available yet</p>
                <p className="text-sm text-white/50">Be the first to create one!</p>
              </div>
            )}
          </div>

          {/* Related Coaches Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Related Coaches</h3>
            </div>
            
            {coaches.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coaches.map(coach => (
                  <div 
                    key={coach.id} 
                    className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/${coach.slug}`)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={coach.image} alt={coach.name} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {coach.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{coach.name}</h4>
                        <p className="text-sm text-white/70 truncate">{coach.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-white/80">{coach.rating.toFixed(1)}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/50" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white/5 rounded-lg">
                <Star className="w-10 h-10 text-white/40 mx-auto mb-3" />
                <p className="text-white/70">No coaches found matching your search</p>
              </div>
            )}
          </div>

          {/* Build Your Own Section */}
          <div className="bg-gradient-to-r from-primary/30 to-secondary/30 backdrop-blur-sm rounded-xl p-6 border border-primary/30">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Build Your Own Expert Cohort</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/10 rounded-lg p-6">
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <Badge variant="outline" className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30">
                    Prime Feature
                  </Badge>
                </div>
                <h4 className="text-white font-medium mb-2">Create Custom Expert Teams</h4>
                <p className="text-white/70 text-sm">
                  Combine multiple coaches into a collaborative council that works together 
                  to provide comprehensive insights tailored to your unique challenges.
                </p>
              </div>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shrink-0"
                onClick={() => navigate('/pricing')}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Prime
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
