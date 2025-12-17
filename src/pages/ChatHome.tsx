import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

interface CoachData {
  id: string;
  slug: string;
  name: string;
  specialization: string;
  image: string;
  personality: string;
  webhookUrl: string | null;
}

const ChatHome = () => {
  const { coachSlug } = useParams();
  const navigate = useNavigate();
  const [coach, setCoach] = useState<CoachData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoach = async () => {
      if (!coachSlug) return;
      
      try {
        // Fetch coach profile by slug
        const { data: coachProfile, error: coachError } = await supabase
          .from("coach_profiles")
          .select("user_id, slug, specialization, personality, webhook_url")
          .eq("slug", coachSlug)
          .maybeSingle();

        if (coachError) throw coachError;

        if (coachProfile) {
          // Fetch user profile using secure RPC function (works for anonymous users)
          const { data: profiles, error: profileError } = await supabase
            .rpc("get_public_coach_profiles", { coach_ids: [coachProfile.user_id] });

          if (profileError) {
            console.error("Error fetching public coach profile:", profileError);
          }
          
          const profile = profiles && profiles.length > 0 ? profiles[0] : null;

          setCoach({
            id: coachProfile.user_id,
            slug: coachProfile.slug || coachSlug,
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
  }, [coachSlug]);

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
      <Header />

      {/* Centered Coach Profile */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <img
            src={coach.image}
            alt={coach.name}
            className="w-32 h-32 rounded-full object-cover mx-auto mb-6 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate(`/${coachSlug}`)}
          />
          <h1 
            className="text-3xl font-bold mb-2 cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate(`/${coachSlug}`)}
          >
            {coach.name}
          </h1>
          <p className="text-primary font-medium mb-3">{coach.specialization}</p>
          <p className="text-muted-foreground italic mb-8">{coach.personality}</p>
          <Button 
            size="lg" 
            className="bg-gradient-primary"
            onClick={() => navigate(`/${coachSlug}/chat/active`)}
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
