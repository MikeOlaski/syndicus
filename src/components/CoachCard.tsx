import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, ExternalLink } from "lucide-react";

interface CoachCardProps {
  id: string;
  slug: string;
  name: string;
  specialization: string;
  rating: number;
  clients: number;
  description: string;
  personality: string;
  tags: string[];
  image: string;
  variant?: "primary" | "secondary";
}

const CoachCard = ({
  id,
  slug,
  name,
  specialization,
  rating,
  clients,
  description,
  personality,
  tags,
  image,
  variant = "primary",
}: CoachCardProps) => {
  const navigate = useNavigate();
  const buttonClass = variant === "primary" ? "" : "bg-gradient-primary hover:opacity-90";
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-5">
        <div className="flex items-start gap-4 mb-3">
          <div className="relative group/overlay">
            <img
              src={image}
              alt={name}
              className="w-14 h-14 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-all duration-300 ring-1 ring-border shadow-sm group-hover/overlay:shadow-md"
              onClick={() => navigate(`/${slug}`)}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 
              className="font-bold text-base mb-0.5 cursor-pointer hover:text-primary transition-colors truncate"
              onClick={() => navigate(`/${slug}`)}
            >
              {name}
            </h3>
            <p className="text-xs font-medium text-primary mb-1.5 truncate">{specialization}</p>
            <div className="flex items-center gap-3 text-[11px] font-semibold tracking-wide uppercase text-muted-foreground/80">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{rating}</span>
              </div>
              <span>{clients} clients</span>
            </div>
          </div>
        </div>

        <p className="text-[13px] leading-relaxed text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">{description}</p>

        <div className="mb-4 p-3 rounded-xl bg-muted/30 border border-border/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Bot Personality</p>
          <p className="text-xs text-foreground/80 italic line-clamp-1">"{personality}"</p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-[10px] font-medium px-2 py-0 h-5 border-border/50 bg-background text-muted-foreground">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground ml-1">+{tags.length - 3}</span>
          )}
        </div>

        <Button 
          size="sm"
          className={`w-full h-9 rounded-xl text-xs font-semibold ${buttonClass}`}
          onClick={() => navigate(`/${slug}/chat`)}
        >
          <MessageSquare className="w-3.5 h-3.5 mr-2" />
          Try Chatbot
          <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
        </Button>
      </div>
    </Card>
  );
};

export default CoachCard;