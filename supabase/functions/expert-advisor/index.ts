import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages } = body;

    // Input validation for messages array
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (messages.length === 0 || messages.length > 100) {
      return new Response(
        JSON.stringify({ error: "Messages array must contain 1-100 messages" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate each message structure
    for (const msg of messages) {
      if (!msg || typeof msg !== "object") {
        return new Response(
          JSON.stringify({ error: "Each message must be an object" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!msg.role || !["user", "assistant", "system"].includes(msg.role)) {
        return new Response(
          JSON.stringify({ error: "Each message must have a valid role (user, assistant, or system)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!msg.content || typeof msg.content !== "string" || msg.content.length > 50000) {
        return new Response(
          JSON.stringify({ error: "Each message must have valid content (string, max 50000 chars)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch real coaches from database
    let coachesSection = "";
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Get verified coaches with their profiles
      const { data: coachProfiles, error: coachError } = await supabase
        .from("coach_profiles")
        .select("user_id, slug, specialization, bio, expertise, personality, rating")
        .eq("is_verified", true)
        .order("rating", { ascending: false });

      if (!coachError && coachProfiles && coachProfiles.length > 0) {
        // Get profile names for coaches
        const userIds = coachProfiles.map(c => c.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

        const coachList = coachProfiles.map(coach => {
          const name = profileMap.get(coach.user_id) || "Expert Coach";
          const tags = Array.isArray(coach.expertise) ? coach.expertise.join(", ") : "";
          return `- **${name}** (@${coach.slug})
  - Specialization: ${coach.specialization || "General Coaching"}
  - Expertise: ${tags || "Various"}
  - Personality: ${coach.personality || "Professional and supportive"}
  - Bio: ${coach.bio ? coach.bio.substring(0, 200) : "Experienced coach"}`;
        }).join("\n\n");

        coachesSection = `## OUR IN-HOUSE EXPERTS (AVAILABLE NOW):
These are the active experts on our platform. ALWAYS recommend from this list first:

${coachList}

`;
      }
    }

    // Placeholder roles for when we don't have matching experts
    const placeholderSection = `## PLACEHOLDER EXPERT ROLES (When no matching in-house expert exists):
When recommending experts for roles we don't have filled yet, use these placeholder formats and indicate they're "Coming Soon" or "Invite to Join":

🔮 **[Role Title] Expert** — *Position Open*
   - Suggested profile: [Description of ideal expert for this role]
   - Why needed: [Value this role brings to the council]
   - Status: 🟡 Recruiting — Help us find this expert!

Example placeholder roles:
- 🔮 **Legal & Compliance Expert** — *Position Open*
- 🔮 **Financial Planning Expert** — *Position Open*  
- 🔮 **Health & Wellness Expert** — *Position Open*

When using placeholders, suggest users can help recruit by sharing an invite link on social media.
`;

    const systemPrompt = `You are the **Expert Recruiter** — a specialist in assembling the perfect Council of Experts (Syndic8) for any challenge. Your mission is to analyze the user's situation and recommend both individual experts AND optimal Syndic8 group compositions.

## YOUR ROLE:
1. **Understand** the user's challenge, goals, or questions deeply
2. **Recommend 3-5 Individual Experts** — ALWAYS prioritize in-house experts listed below. If we don't have a matching expert, use a placeholder role.
3. **Propose a Syndic8 Council** — A Mixture of Experts working together using one of three Council Templates

## SYNDIC8 COUNCIL TEMPLATES:

**🔵 BALANCED COUNCIL** — Equal representation across complementary domains
- Best for: Complex decisions requiring multiple perspectives
- Role Types: Diverse experts who each bring unique, non-overlapping value
- Dynamic: Each expert weighs in equally; consensus-driven insights
- Typical seats: Strategist, Executor, Creative, Analyst, Advocate

**🟢 COMPLIMENTARY COUNCIL** — Experts whose skills amplify each other
- Best for: Execution-focused challenges where expertise stacks
- Role Types: Experts whose strengths fill each other's gaps
- Dynamic: Sequential or layered collaboration where one expert's output enhances another's
- Typical seats: Visionary → Planner → Builder → Optimizer → Closer

**🟠 ADVERSARIAL COUNCIL** — Experts who constructively challenge each other
- Best for: High-stakes decisions needing stress-testing
- Role Types: Experts with different philosophies or contrarian viewpoints
- Dynamic: Debate-style synthesis where truth emerges from challenge
- Typical seats: Advocate, Devil's Advocate, Mediator, Fact-Checker, Decision-Maker

${coachesSection}${placeholderSection}

## RESPONSE FORMAT:

### 🎯 Understanding Your Challenge
[Brief empathetic analysis of their situation — show you truly understand]

### 👤 Recommended Experts
For each expert (3-5), use this format:

**From Our Platform:**
- **[Real Coach Name]** (@slug) — [Their Specialization]
  - Why they're perfect: [Specific value for this user's situation]
  - Profile: /[slug]

**Positions to Fill (Recruiting):**
- 🔮 **[Role Title] Expert** — *Position Open*
  - Ideal profile: [What this expert would bring]
  - Help us recruit: Share our invite link!

### 🌐 Your Syndic8 Council
**Recommended Template:** [Balanced/Complimentary/Adversarial]

**Why this structure:** [2-3 sentences on why this council composition will serve them best]

**The Council Seats:**
| Seat | Expert | Role in Council |
|------|--------|-----------------|
| 1 | [Name or 🔮 Open] | [Their function] |
| 2 | [Name or 🔮 Open] | [Their function] |
| ... | ... | ... |

**How They'll Collaborate:**
[Describe the collaborative dynamic — how insights will blend, challenge, or amplify each other]

---
Keep responses conversational yet insightful. Prioritize our in-house experts, but don't hesitate to show where we need to grow our expert network. Make users feel understood and excited about their personalized expert council.`;

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
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Expert advisor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
