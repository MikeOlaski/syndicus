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

    // Validate against outbound_webhooks secret_key
    const { data: webhookData, error: webhookError } = await supabase
      .from("outbound_webhooks")
      .select("id, name, secret_key, is_active, expires_at")
      .eq("secret_key", apiKey)
      .single();

    if (webhookError || !webhookData) {
      console.error("Invalid API key:", webhookError);
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!webhookData.is_active) {
      return new Response(
        JSON.stringify({ error: "API key is deactivated" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    if (webhookData.expires_at) {
      const expiresAt = new Date(webhookData.expires_at);
      if (expiresAt < new Date()) {
        return new Response(
          JSON.stringify({ error: "API key has expired" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Update last_triggered_at for tracking
    await supabase
      .from("outbound_webhooks")
      .update({ last_triggered_at: new Date().toISOString() })
      .eq("id", webhookData.id);

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

    console.log(`Returning ${enrichedCoaches.length} coaches for webhook: ${webhookData.name}`);

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
