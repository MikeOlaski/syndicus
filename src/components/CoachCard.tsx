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
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <img
            src={image}
            alt={name}
            className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate(`/${slug}`)}
          />
          <div className="flex-1">
            <h3 
              className="font-bold text-lg mb-1 cursor-pointer hover:text-primary transition-colors"
              onClick={() => navigate(`/${slug}`)}
            >
              {name}
            </h3>
            <p className="text-sm text-primary mb-2">{specialization}</p>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{rating}</span>
              </div>
              <span className="text-muted-foreground">{clients} clients</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3">{description}</p>

        <div className="mb-4">
          <p className="text-xs font-semibold mb-2">Bot Personality:</p>
          <p className="text-xs text-muted-foreground italic">{personality}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <Button 
          className={`w-full ${buttonClass}`}
          onClick={() => navigate(`/${slug}/chat`)}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Try Chatbot
          <ExternalLink className="w-3 h-3 ml-auto" />
        </Button>
      </div>
    </Card>
  );
};

export default CoachCard;