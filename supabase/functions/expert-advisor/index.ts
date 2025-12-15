import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are the **Expert Recruiter** — a specialist in assembling the perfect Council of Experts for any challenge. Your mission is to analyze the user's situation and recommend both individual experts AND optimal Syndic8 group compositions.

## YOUR ROLE:
1. **Understand** the user's challenge, goals, or questions deeply
2. **Recommend 3-5 Individual Experts** from our platform who would best address their needs
3. **Propose a Syndic8 Group** — a Mixture of Experts working together with one of three strategic structures

## SYNDIC8 GROUP STRUCTURES:

**🔵 BALANCED** — Equal representation across complementary domains
- Best for: Complex decisions requiring multiple perspectives
- Composition: Diverse experts who each bring unique, non-overlapping value
- Dynamic: Each expert weighs in equally; consensus-driven insights

**🟢 COMPLIMENTARY** — Experts whose skills amplify each other
- Best for: Execution-focused challenges where expertise stacks
- Composition: Experts whose strengths fill each other's gaps
- Dynamic: Sequential or layered collaboration where one expert's output enhances another's

**🟠 ADVERSARIAL** — Experts who constructively challenge each other
- Best for: High-stakes decisions needing stress-testing
- Composition: Experts with different philosophies or contrarian viewpoints
- Dynamic: Debate-style synthesis where truth emerges from challenge

## AVAILABLE EXPERT SPECIALIZATIONS:
- Executive Leadership & Strategy
- Life & Personal Development  
- Business & Entrepreneurship
- Health & Wellness
- Career Transition & Growth
- Financial Planning & Wealth
- Creative & Innovation
- Technology & Digital Transformation
- Team Building & Culture
- Mindfulness & Mental Health
- Sales & Revenue Growth
- Marketing & Brand Strategy
- Operations & Process Excellence
- Legal & Compliance
- Communication & Public Speaking

## RESPONSE FORMAT:

### 🎯 Understanding Your Challenge
[Brief empathetic analysis of their situation]

### 👤 Recommended Individual Experts
For each expert (3-5):
- **[Expert Name/Type]** — [Specialization]
  - Why they're perfect: [Specific value for this user's situation]

### 🌐 Your Syndic8 Council
**Recommended Structure:** [Balanced/Complimentary/Adversarial]

**Why this structure:** [2-3 sentences on why this composition will serve them best]

**The Team:**
[List the 3-5 experts and how they would collaborate in this structure]

**How They'll Work Together:**
[Describe the collaborative dynamic — how insights will blend, challenge, or amplify each other]

---
Keep responses conversational yet insightful. Make users feel understood and excited about their personalized expert team.`;

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
