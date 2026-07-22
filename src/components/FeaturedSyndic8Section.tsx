import { usePublicSyndic8Groups } from "@/hooks/usePublicSyndic8Groups";
import PublicSyndic8Card from "./PublicSyndic8Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Network, ArrowRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeaturedSyndic8SectionProps {
  searchQuery?: string;
  showHeader?: boolean;
  limit?: number;
}

const FeaturedSyndic8Section = ({ 
  searchQuery, 
  showHeader = true,
  limit = 6 
}: FeaturedSyndic8SectionProps) => {
  const navigate = useNavigate();
  const { data: groups, isLoading } = usePublicSyndic8Groups({ 
    limit, 
    searchQuery 
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl">
        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Public Syndic8 Groups Yet</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Be the first to publish your council of experts and share your curated wisdom with the community.
        </p>
        <Button onClick={() => navigate("/auth")}>
          Create Your Syndic8
        </Button>
      </div>
    );
  }

  return (
    <div>
      {showHeader && (
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              <Network className="w-3 h-3 mr-2" />
              Public Councils
            </Badge>
            <h2 className="text-2xl font-bold">Popular Syndic8 Groups</h2>
          </div>
          <Button variant="ghost" onClick={() => navigate("/directory?tab=syndic8")}>
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <PublicSyndic8Card 
            key={group.id} 
            group={group}
            variant={group.is_featured ? "featured" : "default"}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedSyndic8Section;
