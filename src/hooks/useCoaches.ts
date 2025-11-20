import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Coach {
  id: string;
  name: string;
  email: string;
  specialization: string;
  rating: number;
  clients: number;
  description: string;
  personality: string;
  tags: string[];
  image: string;
  variant: "primary" | "secondary";
  hourlyRate?: number;
  isVerified: boolean;
}

export const useCoaches = () => {
  return useQuery({
    queryKey: ["coaches"],
    queryFn: async () => {
      const { data: coachProfiles, error } = await supabase
        .from("coach_profiles")
        .select(`
          *,
          profiles (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq("is_verified", true)
        .order("rating", { ascending: false });

      if (error) throw error;

      return (coachProfiles || []).map((coach, index): Coach => {
        const profile = Array.isArray(coach.profiles) ? coach.profiles[0] : coach.profiles;
        
        return {
          id: coach.user_id,
          name: profile?.full_name || "Coach",
          email: profile?.email || "",
          specialization: coach.specialization || "General Coaching",
          rating: coach.rating || 4.5,
          clients: coach.total_sessions || 0,
          description: coach.bio || "Experienced coach dedicated to helping clients achieve their goals.",
          personality: coach.personality || "Professional and supportive",
          tags: coach.expertise || ["Coaching"],
          image: profile?.avatar_url || `https://images.unsplash.com/photo-${1500000000000 + index}?w=400&h=400&fit=crop`,
          variant: index % 3 === 0 ? "primary" : "secondary",
          hourlyRate: coach.hourly_rate || undefined,
          isVerified: coach.is_verified || false,
        };
      });
    },
  });
};
