import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicSyndic8Group {
  id: string;
  name: string;
  description: string | null;
  public_description: string | null;
  cover_image_url: string | null;
  popularity_score: number;
  is_featured: boolean;
  created_at: string;
  owner_id: string;
  member_count: number;
  specializations: string[] | null;
}

export const usePublicSyndic8Groups = (options?: { 
  featured?: boolean; 
  limit?: number;
  searchQuery?: string;
}) => {
  return useQuery({
    queryKey: ["public-syndic8-groups", options],
    queryFn: async () => {
      let query = supabase
        .from("syndic8_groups")
        .select(`
          id,
          name,
          description,
          public_description,
          cover_image_url,
          popularity_score,
          is_featured,
          created_at,
          owner_id,
          syndic8_group_members(
            id,
            coach_id,
            has_approved_public
          )
        `)
        .eq("is_public", true)
        .order("popularity_score", { ascending: false });

      if (options?.featured) {
        query = query.eq("is_featured", true);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter groups where all members have approved and at least 1 member exists
      const approvedGroups = (data || []).filter(group => {
        const members = group.syndic8_group_members || [];
        if (members.length === 0) return false;
        return members.every(m => m.has_approved_public === true);
      });

      // Apply search filter if provided
      let filteredGroups = approvedGroups;
      if (options?.searchQuery) {
        const query = options.searchQuery.toLowerCase();
        filteredGroups = approvedGroups.filter(group => 
          group.name.toLowerCase().includes(query) ||
          (group.description?.toLowerCase().includes(query)) ||
          (group.public_description?.toLowerCase().includes(query))
        );
      }

      // Get coach specializations for each group
      const groupsWithDetails = await Promise.all(
        filteredGroups.map(async (group) => {
          const memberCoachIds = (group.syndic8_group_members || []).map(m => m.coach_id);
          
          const { data: coachData } = await supabase
            .from("coach_profiles")
            .select("specialization")
            .in("id", memberCoachIds);

          return {
            id: group.id,
            name: group.name,
            description: group.description,
            public_description: group.public_description,
            cover_image_url: group.cover_image_url,
            popularity_score: group.popularity_score || 0,
            is_featured: group.is_featured || false,
            created_at: group.created_at,
            owner_id: group.owner_id,
            member_count: (group.syndic8_group_members || []).length,
            specializations: coachData?.map(c => c.specialization).filter(Boolean) || null
          } as PublicSyndic8Group;
        })
      );

      return groupsWithDetails;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
