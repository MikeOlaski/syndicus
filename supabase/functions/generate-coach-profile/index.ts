import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-COACH-PROFILE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    const { messages, currentProfile } = await req.json();

    // Fetch coach's knowledge base for context
    const { data: knowledgeBase } = await supabaseClient
      .from("knowledge_base")
      .select("title, content")
      .eq("coach_id", user.id)
      .limit(10);

    // Fetch existing coach profile
    const { data: coachProfile } = await supabaseClient
      .from("coach_profiles")
      .select("bio, specialization, personality, expertise")
      .eq("user_id", user.id)
      .single();

    // Fetch user profile for name
    const { data: userProfile } = await supabaseClient
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const coachName = userProfile?.full_name || "Coach";
    const knowledgeContext = knowledgeBase?.map(kb => `${kb.title}: ${kb.content}`).join("\n\n") || "";

    const systemPrompt = `You are an AI assistant helping ${coachName} create their professional coaching profile. Your role is to have a natural conversation to understand their background, expertise, and coaching style, then help them generate compelling profile content.

CURRENT PROFILE STATE:
- Bio: ${currentProfile?.bio || coachProfile?.bio || "Not set"}
- Specialization: ${currentProfile?.specialization || coachProfile?.specialization || "Not set"}
- Expertise Tags: ${JSON.stringify(currentProfile?.expertise || coachProfile?.expertise || [])}
- Personality & Style: ${currentProfile?.personality || coachProfile?.personality || "Not set"}

${knowledgeContext ? `KNOWLEDGE BASE CONTEXT (from their Digital Twin):
${knowledgeContext}` : ""}

YOUR CAPABILITIES:
1. Ask thoughtful questions about their coaching journey, methodology, and unique approach
2. Generate profile content based on the conversation
3. Suggest expertise tags that match their skills
4. Help refine and improve their bio, specialization, and personality descriptions

WHEN GENERATING CONTENT, use these special markers so the UI can detect and offer to apply them:
- For bio: [GENERATED_BIO]content here[/GENERATED_BIO]
- For specialization: [GENERATED_SPECIALIZATION]content here[/GENERATED_SPECIALIZATION]
- For expertise tags: [GENERATED_EXPERTISE]tag1, tag2, tag3[/GENERATED_EXPERTISE]
- For personality: [GENERATED_PERSONALITY]content here[/GENERATED_PERSONALITY]

Be conversational, supportive, and help the coach articulate their unique value proposition. Ask clarifying questions before generating content unless specifically asked to generate something.`;

    logStep("Calling Lovable AI Gateway");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Streaming response");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
