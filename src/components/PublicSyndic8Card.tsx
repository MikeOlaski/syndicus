import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Star, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PublicSyndic8Group } from "@/hooks/usePublicSyndic8Groups";

interface PublicSyndic8CardProps {
  group: PublicSyndic8Group;
  variant?: "default" | "featured";
}

const PublicSyndic8Card = ({ group, variant = "default" }: PublicSyndic8CardProps) => {
  const navigate = useNavigate();

  const handleChat = () => {
    navigate(`/syndic8-chat/${group.id}`);
  };

  const isFeatured = variant === "featured" || group.is_featured;

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${
      isFeatured ? "border-primary/50 bg-gradient-to-br from-primary/5 to-background" : ""
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isFeatured && (
                <Badge variant="default" className="bg-gradient-primary text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {group.member_count} experts
              </Badge>
            </div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {group.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>{group.popularity_score}</span>
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {group.public_description || group.description || "A curated council of expert advisors"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {group.specializations && group.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {group.specializations.slice(0, 3).map((spec, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {group.specializations.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{group.specializations.length - 3} more
              </Badge>
            )}
          </div>
        )}
        <Button 
          className="w-full bg-gradient-primary hover:opacity-90"
          onClick={handleChat}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat with Council
        </Button>
      </CardContent>
    </Card>
  );
};

export default PublicSyndic8Card;
