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
  webhookUrl?: string;
}

export const useCoaches = () => {
  return useQuery({
    queryKey: ["coaches"],
    queryFn: async () => {
      const { data: coachProfiles, error: coachError } = await supabase
        .from("coach_profiles")
        .select("*")
        .eq("is_verified", true)
        .eq("show_on_homepage", true)
        .order("rating", { ascending: false });

      if (coachError) throw coachError;

      const userIds = (coachProfiles ?? []).map((coach) => coach.user_id);

      let profilesById = new Map<
        string,
        { id: string; full_name: string | null; avatar_url: string | null }
      >();

      if (userIds.length > 0) {
        // Use public_coach_profiles view which has no RLS restrictions for public access
        const { data: profiles, error: profilesError } = await supabase
          .from("public_coach_profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        profilesById = new Map(
          (profiles ?? []).map((profile) => [profile.id!, profile])
        );
      }

      return (coachProfiles || []).map((coach, index): Coach => {
        const profile = profilesById.get(coach.user_id);
        
        return {
          id: coach.user_id,
          name: profile?.full_name || "Coach",
          email: "",
          specialization: coach.specialization || "General Coaching",
          rating: Number(coach.rating ?? 4.5),
          clients: coach.total_sessions || 0,
          description:
            coach.bio ||
            "Experienced coach dedicated to helping clients achieve their goals.",
          personality: coach.personality || "Professional and supportive",
          tags: coach.expertise || ["Coaching"],
          image:
            profile?.avatar_url ||
            `https://images.unsplash.com/photo-${1500000000000 + index}?w=400&h=400&fit=crop`,
          variant: index % 3 === 0 ? "primary" : "secondary",
          hourlyRate: coach.hourly_rate || undefined,
          isVerified: coach.is_verified || false,
          webhookUrl: coach.webhook_url || undefined,
        };
      });
    },
  });
};
