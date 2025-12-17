import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get("x-api-key");
    
    if (!apiKey) {
      console.error("Missing API key");
      return new Response(
        JSON.stringify({ error: "Missing API key. Include X-API-Key header." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for API key validation
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate API key
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("external_api_keys")
      .select("id, name, permissions, is_active, allowed_origins")
      .eq("api_key", apiKey)
      .single();

    if (apiKeyError || !apiKeyData) {
      console.error("Invalid API key:", apiKeyError);
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!apiKeyData.is_active) {
      return new Response(
        JSON.stringify({ error: "API key is deactivated" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check permission
    if (!apiKeyData.permissions?.includes("read_coaches")) {
      return new Response(
        JSON.stringify({ error: "API key does not have read_coaches permission" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optional: Check origin
    const origin = req.headers.get("origin");
    if (origin && apiKeyData.allowed_origins?.length > 0) {
      if (!apiKeyData.allowed_origins.includes(origin)) {
        console.warn(`Origin ${origin} not in allowed list for API key ${apiKeyData.name}`);
        // Note: We log but don't block - can be made stricter if needed
      }
    }

    // Update last_used_at
    await supabase
      .from("external_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKeyData.id);

    // Fetch verified coaches
    const { data: coaches, error: coachesError } = await supabase
      .from("coach_profiles")
      .select("user_id, slug, specialization, bio, expertise, rating, total_sessions")
      .eq("is_verified", true)
      .eq("show_on_homepage", true)
      .order("rating", { ascending: false });

    if (coachesError) {
      console.error("Error fetching coaches:", coachesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch coaches" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get profile info (name, avatar) for these coaches
    const coachIds = coaches?.map(c => c.user_id) || [];
    
    const { data: profiles, error: profilesError } = await supabase
      .rpc("get_public_coach_profiles", { coach_ids: coachIds });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Merge coach data with profile data
    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);
    
    const enrichedCoaches = coaches?.map(coach => {
      const profile = profileMap.get(coach.user_id) as any;
      return {
        id: coach.user_id,
        slug: coach.slug,
        name: profile?.full_name || "Unknown Coach",
        avatar_url: profile?.avatar_url || null,
        specialization: coach.specialization,
        expertise: coach.expertise || [],
        bio: coach.bio,
        rating: coach.rating,
        total_sessions: coach.total_sessions,
      };
    }) || [];

    console.log(`Returning ${enrichedCoaches.length} coaches for API key: ${apiKeyData.name}`);

    return new Response(
      JSON.stringify({
        coaches: enrichedCoaches,
        total: enrichedCoaches.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
