import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Coach {
  id: string;
  slug: string;
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
    staleTime: 0, // Always refetch to ensure latest slug data
    queryFn: async () => {
      console.log("[useCoaches] Fetching coaches with slugs...");
      // Select only needed columns, excluding sensitive data like webhook_url
      const { data: coachProfiles, error: coachError } = await supabase
        .from("coach_profiles")
        .select("user_id, slug, specialization, rating, total_sessions, bio, personality, expertise, hourly_rate, is_verified")
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
        // Use security definer function to get public coach profile data safely
        const { data: profiles, error: profilesError } = await supabase
          .rpc("get_public_coach_profiles", { coach_ids: userIds });

        if (profilesError) throw profilesError;

        profilesById = new Map(
          (profiles ?? []).map((profile: { id: string; full_name: string | null; avatar_url: string | null }) => [profile.id, profile])
        );
      }

      return (coachProfiles || []).map((coach, index): Coach => {
        const profile = profilesById.get(coach.user_id);
        const fallbackImages = [
          "1472099645785-5658abf4ff4e",
          "1580489944761-15a19d654956",
          "1507679722338-947c17693fb",
          "1519085360753-af0119f7cbe7",
          "1531123897727-8f129e1688ce",
          "1531427186611-ecfd6d936c79",
          "1573497019940-1c28c88b4f3e",
          "1544005313-94ddf0286df2",
          "1506794778287-f247c17693fb",
          "1534528741775-53994a69daeb",
        ];
        const fallbackImage = fallbackImages[index % fallbackImages.length];
        
        return {
          id: coach.user_id,
          slug: coach.slug || coach.user_id,
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
            `https://images.unsplash.com/photo-${fallbackImage}?w=400&h=400&fit=crop`,
          variant: index % 3 === 0 ? "primary" : "secondary",
          hourlyRate: coach.hourly_rate || undefined,
          isVerified: coach.is_verified || false,
        };
      });
    },
  });
};
