import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CoachData {
  id: string;
  name: string;
  specialization: string;
  image: string;
  personality: string;
  webhookUrl: string | null;
}

const ChatHome = () => {
  const { coachId } = useParams();
  const navigate = useNavigate();
  const [coach, setCoach] = useState<CoachData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoach = async () => {
      if (!coachId) return;
      
      try {
        // Fetch coach profile
        const { data: coachProfile, error: coachError } = await supabase
          .from("coach_profiles")
          .select("*")
          .eq("user_id", coachId)
          .maybeSingle();

        if (coachError) throw coachError;

        if (coachProfile) {
          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", coachId)
            .maybeSingle();

          if (profileError) throw profileError;

          setCoach({
            id: coachId,
            name: profile?.full_name || "Coach",
            specialization: coachProfile.specialization || "General Coaching",
            image: profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || 'Coach'}`,
            personality: coachProfile.personality || "Professional and supportive",
            webhookUrl: coachProfile.webhook_url,
          });
        }
      } catch (error) {
        console.error("Error fetching coach:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoach();
  }, [coachId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Coach not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Syndic.us</h1>
              <p className="text-xs text-muted-foreground">Syndicated Digital Twin PersonaBots</p>
            </div>
          </a>
          <div className="flex items-center gap-2">
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(`/coach/${coachId}`)}
            >
              <img src={coach.image} alt={coach.name} className="w-8 h-8 rounded-full" />
              <div className="text-right">
                <div className="font-bold text-sm">{coach.name}</div>
                <div className="text-xs text-primary">{coach.specialization}</div>
              </div>
            </div>
            <span className="flex items-center gap-1 ml-4">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-green-600 font-medium">Online</span>
            </span>
            <Button className="ml-4 bg-gradient-primary">Book Live Session</Button>
          </div>
        </div>
      </header>

      {/* Centered Coach Profile */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <img
            src={coach.image}
            alt={coach.name}
            className="w-32 h-32 rounded-full object-cover mx-auto mb-6 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate(`/coach/${coachId}`)}
          />
          <h1 
            className="text-3xl font-bold mb-2 cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate(`/coach/${coachId}`)}
          >
            {coach.name}
          </h1>
          <p className="text-primary font-medium mb-3">{coach.specialization}</p>
          <p className="text-muted-foreground italic mb-8">{coach.personality}</p>
          <Button 
            size="lg" 
            className="bg-gradient-primary"
            onClick={() => navigate(`/coach/${coachId}/chat/active`)}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Start Conversation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatHome;