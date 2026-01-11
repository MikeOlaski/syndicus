import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Types for council pipeline
interface ExpertDraft {
  expertId: string;
  expertName: string;
  answer: string;
  assumptions: string[];
  uncertainties: string[];
  confidence: number;
  suggestedFollowups: string[];
}

interface ExpertCritique {
  reviewerId: string;
  reviewerName: string;
  targetExpertId: string;
  scores: {
    correctness: number;
    completeness: number;
    actionability: number;
  };
  strengths: string[];
  improvements: string[];
  concerns: string[];
}

interface CouncilSynthesis {
  finalAnswer: string;
  confidence: number;
  consensusPoints: string[];
  dissentSummary: string | null;
  nextSteps: string[];
  primaryContributors: string[];
}

interface CouncilMember {
  id: string;
  coachId: string;
  name: string;
  specialization: string;
  bio: string;
  expertise: string[];
  personality: string;
}

// Tool definitions for structured output extraction
const draftTool = {
  type: "function",
  function: {
    name: "submit_draft",
    description: "Submit your expert draft response with structured analysis",
    parameters: {
      type: "object",
      properties: {
        answer: { type: "string", description: "Your complete expert response in markdown" },
        assumptions: { 
          type: "array", 
          items: { type: "string" },
          description: "Key assumptions underlying your advice"
        },
        uncertainties: { 
          type: "array", 
          items: { type: "string" },
          description: "Areas of uncertainty or unknowns"
        },
        confidence: { 
          type: "number", 
          description: "Confidence level 0-100"
        },
        suggestedFollowups: { 
          type: "array", 
          items: { type: "string" },
          description: "Follow-up questions to clarify or deepen the discussion"
        }
      },
      required: ["answer", "assumptions", "uncertainties", "confidence", "suggestedFollowups"],
      additionalProperties: false
    }
  }
};

const critiqueTool = {
  type: "function",
  function: {
    name: "submit_critique",
    description: "Submit your critique of another expert's draft",
    parameters: {
      type: "object",
      properties: {
        scores: {
          type: "object",
          properties: {
            correctness: { type: "number", description: "Score 1-5 for factual accuracy" },
            completeness: { type: "number", description: "Score 1-5 for thoroughness" },
            actionability: { type: "number", description: "Score 1-5 for practical usefulness" }
          },
          required: ["correctness", "completeness", "actionability"]
        },
        strengths: { type: "array", items: { type: "string" }, description: "Key strengths of this response" },
        improvements: { type: "array", items: { type: "string" }, description: "Suggested improvements" },
        concerns: { type: "array", items: { type: "string" }, description: "Potential risks or concerns" }
      },
      required: ["scores", "strengths", "improvements", "concerns"],
      additionalProperties: false
    }
  }
};

const synthesisTool = {
  type: "function",
  function: {
    name: "submit_synthesis",
    description: "Submit the synthesized council response",
    parameters: {
      type: "object",
      properties: {
        finalAnswer: { type: "string", description: "The coherent synthesized response in markdown" },
        confidence: { type: "number", description: "Overall confidence 0-100" },
        consensusPoints: { type: "array", items: { type: "string" }, description: "Points all experts agreed on" },
        dissentSummary: { type: "string", description: "Summary of disagreements, or null if consensus" },
        nextSteps: { type: "array", items: { type: "string" }, description: "Recommended action items" },
        primaryContributors: { type: "array", items: { type: "string" }, description: "Expert names who contributed most" }
      },
      required: ["finalAnswer", "confidence", "consensusPoints", "nextSteps", "primaryContributors"],
      additionalProperties: false
    }
  }
};

// Build expert system prompt based on council template
function buildExpertPrompt(
  expert: CouncilMember, 
  template: 'balanced' | 'complimentary' | 'adversarial',
  councilSize: number,
  position: number
): string {
  const templateContext = {
    balanced: `You are part of a BALANCED COUNCIL where each expert provides their unique perspective equally. Your role is to offer your specialized insight while respecting other viewpoints.`,
    complimentary: `You are part of a COMPLIMENTARY COUNCIL where experts build upon each other's strengths. Position ${position} of ${councilSize}. Your insights should complement and enhance the overall analysis.`,
    adversarial: `You are part of an ADVERSARIAL COUNCIL designed to stress-test ideas. Your role is to constructively challenge assumptions and identify blind spots. Be rigorous but respectful.`
  };

  return `You are **${expert.name}**, an expert in ${expert.specialization || 'your domain'}.

## YOUR IDENTITY:
${expert.bio || 'An experienced professional providing expert guidance.'}

## YOUR EXPERTISE:
${expert.expertise?.join(', ') || 'General expertise'}

## YOUR PERSONALITY & STYLE:
${expert.personality || 'Professional, thoughtful, and direct.'}

## COUNCIL CONTEXT:
${templateContext[template]}

## INSTRUCTIONS:
- Draw from your unique expertise and perspective
- Be specific and actionable in your advice
- Acknowledge uncertainty when present
- Consider practical implementation
- Stay true to your personality and communication style

Use the submit_draft tool to provide your structured response.`;
}

// Build Chair/Synthesis prompt
function buildSynthesisPrompt(
  template: 'balanced' | 'complimentary' | 'adversarial',
  expertDrafts: ExpertDraft[],
  critiques: ExpertCritique[]
): string {
  const draftsSection = expertDrafts.map(draft => `
### ${draft.expertName} (Confidence: ${draft.confidence}%)
${draft.answer}

**Assumptions:** ${draft.assumptions.join('; ')}
**Uncertainties:** ${draft.uncertainties.join('; ')}
`).join('\n---\n');

  const critiqueSection = critiques.length > 0 ? `
## EXPERT CRITIQUES:
${critiques.map(c => `
**${c.reviewerName} reviewing ${expertDrafts.find(d => d.expertId === c.targetExpertId)?.expertName || 'Expert'}:**
- Scores: Correctness ${c.scores.correctness}/5, Completeness ${c.scores.completeness}/5, Actionability ${c.scores.actionability}/5
- Strengths: ${c.strengths.join('; ')}
- Improvements: ${c.improvements.join('; ')}
- Concerns: ${c.concerns.join('; ')}
`).join('\n')}
` : '';

  return `You are the **Council Chair**, responsible for synthesizing insights from multiple experts into a coherent, actionable response.

## COUNCIL TEMPLATE: ${template.toUpperCase()}

## EXPERT DRAFTS:
${draftsSection}

${critiqueSection}

## YOUR TASK:
1. Identify points of CONSENSUS across experts
2. Note any significant DISSENT or disagreement
3. Synthesize the best insights into ONE coherent answer
4. Weight expert contributions by their confidence and critique scores
5. Provide clear, actionable next steps

## SYNTHESIS PRINCIPLES:
- Preserve expert voices where their unique insight adds value
- Resolve contradictions thoughtfully, explaining your reasoning
- Highlight where the council agrees strongly vs. where uncertainty remains
- Be honest about limitations and unknowns
- Prioritize actionability for the user

Use the submit_synthesis tool to provide your structured synthesis.`;
}

// Call Lovable AI for a single expert draft
async function getExpertDraft(
  apiKey: string,
  expert: CouncilMember,
  template: 'balanced' | 'complimentary' | 'adversarial',
  councilSize: number,
  position: number,
  userQuestion: string,
  conversationHistory: Array<{role: string, content: string}>
): Promise<ExpertDraft> {
  const systemPrompt = buildExpertPrompt(expert, template, councilSize, position);
  
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: userQuestion }
      ],
      tools: [draftTool],
      tool_choice: { type: "function", function: { name: "submit_draft" } }
    }),
  });

  if (!response.ok) {
    console.error(`Expert ${expert.name} draft failed:`, response.status);
    // Return a fallback draft
    return {
      expertId: expert.id,
      expertName: expert.name,
      answer: `[${expert.name} was unable to provide a response at this time]`,
      assumptions: [],
      uncertainties: ["Response unavailable"],
      confidence: 0,
      suggestedFollowups: []
    };
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    try {
      const parsed = JSON.parse(toolCall.function.arguments);
      return {
        expertId: expert.id,
        expertName: expert.name,
        ...parsed
      };
    } catch (e) {
      console.error(`Failed to parse ${expert.name} draft:`, e);
    }
  }

  // Fallback: try to extract from content
  return {
    expertId: expert.id,
    expertName: expert.name,
    answer: data.choices?.[0]?.message?.content || `[${expert.name} response]`,
    assumptions: [],
    uncertainties: [],
    confidence: 50,
    suggestedFollowups: []
  };
}

// Call Lovable AI for critique
async function getExpertCritique(
  apiKey: string,
  reviewer: CouncilMember,
  targetDraft: ExpertDraft,
  template: 'balanced' | 'complimentary' | 'adversarial'
): Promise<ExpertCritique> {
  const critiquePrompt = `You are **${reviewer.name}**, reviewing the response from **${targetDraft.expertName}**.

## THEIR RESPONSE:
${targetDraft.answer}

## YOUR TASK:
Provide constructive critique from your expert perspective. Score their response on:
- Correctness (1-5): Is it factually accurate?
- Completeness (1-5): Does it cover the necessary ground?
- Actionability (1-5): Can the user act on this advice?

${template === 'adversarial' ? 'Be rigorous in identifying weaknesses and blind spots.' : 'Be fair and balanced in your assessment.'}

Use the submit_critique tool.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: critiquePrompt }
      ],
      tools: [critiqueTool],
      tool_choice: { type: "function", function: { name: "submit_critique" } }
    }),
  });

  if (!response.ok) {
    return {
      reviewerId: reviewer.id,
      reviewerName: reviewer.name,
      targetExpertId: targetDraft.expertId,
      scores: { correctness: 3, completeness: 3, actionability: 3 },
      strengths: [],
      improvements: [],
      concerns: []
    };
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    try {
      const parsed = JSON.parse(toolCall.function.arguments);
      return {
        reviewerId: reviewer.id,
        reviewerName: reviewer.name,
        targetExpertId: targetDraft.expertId,
        ...parsed
      };
    } catch (e) {
      console.error(`Failed to parse critique:`, e);
    }
  }

  return {
    reviewerId: reviewer.id,
    reviewerName: reviewer.name,
    targetExpertId: targetDraft.expertId,
    scores: { correctness: 3, completeness: 3, actionability: 3 },
    strengths: [],
    improvements: [],
    concerns: []
  };
}

// Get synthesis from Chair agent
async function getSynthesis(
  apiKey: string,
  template: 'balanced' | 'complimentary' | 'adversarial',
  drafts: ExpertDraft[],
  critiques: ExpertCritique[]
): Promise<CouncilSynthesis> {
  const synthesisPrompt = buildSynthesisPrompt(template, drafts, critiques);

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",  // Use stronger model for synthesis
      messages: [
        { role: "system", content: synthesisPrompt }
      ],
      tools: [synthesisTool],
      tool_choice: { type: "function", function: { name: "submit_synthesis" } }
    }),
  });

  if (!response.ok) {
    console.error("Synthesis failed:", response.status);
    // Fallback synthesis
    return {
      finalAnswer: drafts.map(d => `**${d.expertName}:** ${d.answer}`).join('\n\n---\n\n'),
      confidence: 50,
      consensusPoints: [],
      dissentSummary: "Synthesis unavailable",
      nextSteps: [],
      primaryContributors: drafts.map(d => d.expertName)
    };
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    try {
      return JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Failed to parse synthesis:", e);
    }
  }

  return {
    finalAnswer: data.choices?.[0]?.message?.content || "Synthesis unavailable",
    confidence: 50,
    consensusPoints: [],
    dissentSummary: null,
    nextSteps: [],
    primaryContributors: drafts.map(d => d.expertName)
  };
}

// Tracing structure for observability
interface CouncilTrace {
  requestId: string;
  groupId: string;
  councilSize: number;
  template: string;
  stages: {
    drafts: { startMs: number; endMs: number; durationMs: number; expertTimings: Array<{expertId: string; durationMs: number}> };
    critiques: { startMs: number; endMs: number; durationMs: number };
    synthesis: { startMs: number; endMs: number; durationMs: number };
  };
  totalMs: number;
  success: boolean;
  errorMessage?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize trace
  const trace: CouncilTrace = {
    requestId: crypto.randomUUID(),
    groupId: "",
    councilSize: 0,
    template: "",
    stages: {
      drafts: { startMs: 0, endMs: 0, durationMs: 0, expertTimings: [] },
      critiques: { startMs: 0, endMs: 0, durationMs: 0 },
      synthesis: { startMs: 0, endMs: 0, durationMs: 0 }
    },
    totalMs: 0,
    success: false
  };
  
  const requestStartTime = Date.now();

  try {
    const body = await req.json();
    const { 
      groupId, 
      sessionId, 
      message, 
      template = 'balanced',
      skipCritique = false,
      conversationHistory = []
    } = body;
    
    trace.groupId = groupId;
    trace.template = template;

    // Validate inputs
    if (!groupId || typeof groupId !== "string") {
      return new Response(
        JSON.stringify({ error: "groupId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!['balanced', 'complimentary', 'adversarial'].includes(template)) {
      return new Response(
        JSON.stringify({ error: "Invalid template. Must be balanced, complimentary, or adversarial" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch council members (coaches in the group)
    const { data: groupMembers, error: membersError } = await supabase
      .from("syndic8_group_members")
      .select(`
        id,
        coach_id,
        coach_profiles!inner (
          id,
          user_id,
          specialization,
          bio,
          expertise,
          personality
        )
      `)
      .eq("group_id", groupId);

    if (membersError || !groupMembers || groupMembers.length === 0) {
      return new Response(
        JSON.stringify({ error: "No council members found for this group" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get profile names for each coach
    const userIds = groupMembers.map((m: any) => m.coach_profiles.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

    // Build council member list
    const councilMembers: CouncilMember[] = groupMembers.map((m: any) => ({
      id: m.id,
      coachId: m.coach_id,
      name: profileMap.get(m.coach_profiles.user_id) || "Expert",
      specialization: m.coach_profiles.specialization || "General",
      bio: m.coach_profiles.bio || "",
      expertise: m.coach_profiles.expertise || [],
      personality: m.coach_profiles.personality || ""
    }));

    trace.councilSize = councilMembers.length;
    console.log(`[syndic8-council] [${trace.requestId}] Starting council session with ${councilMembers.length} experts, template: ${template}`);

    // STAGE 1: Parallel Expert Drafts
    trace.stages.drafts.startMs = Date.now() - requestStartTime;
    console.log(`[syndic8-council] [${trace.requestId}] Stage 1: Getting parallel expert drafts...`);
    
    const draftPromises = councilMembers.map(async (expert, index) => {
      const expertStart = Date.now();
      const result = await getExpertDraft(
        LOVABLE_API_KEY,
        expert,
        template,
        councilMembers.length,
        index + 1,
        message,
        conversationHistory
      );
      trace.stages.drafts.expertTimings.push({
        expertId: expert.id,
        durationMs: Date.now() - expertStart
      });
      return result;
    });

    const expertDrafts = await Promise.all(draftPromises);
    trace.stages.drafts.endMs = Date.now() - requestStartTime;
    trace.stages.drafts.durationMs = trace.stages.drafts.endMs - trace.stages.drafts.startMs;
    console.log(`[syndic8-council] [${trace.requestId}] Stage 1 complete: ${expertDrafts.length} drafts received in ${trace.stages.drafts.durationMs}ms`);

    // STAGE 2: Cross-Review (Critique) - each expert reviews one other
    let critiques: ExpertCritique[] = [];
    trace.stages.critiques.startMs = Date.now() - requestStartTime;
    
    if (!skipCritique && councilMembers.length > 1) {
      console.log(`[syndic8-council] [${trace.requestId}] Stage 2: Getting expert critiques...`);
      const critiquePromises: Promise<ExpertCritique>[] = [];
      
      // Each expert reviews the next expert's draft (circular)
      for (let i = 0; i < councilMembers.length; i++) {
        const reviewer = councilMembers[i];
        const targetIndex = (i + 1) % councilMembers.length;
        const targetDraft = expertDrafts[targetIndex];
        
        critiquePromises.push(
          getExpertCritique(LOVABLE_API_KEY, reviewer, targetDraft, template)
        );
      }

      critiques = await Promise.all(critiquePromises);
    }
    
    trace.stages.critiques.endMs = Date.now() - requestStartTime;
    trace.stages.critiques.durationMs = trace.stages.critiques.endMs - trace.stages.critiques.startMs;
    console.log(`[syndic8-council] [${trace.requestId}] Stage 2 complete: ${critiques.length} critiques received in ${trace.stages.critiques.durationMs}ms`);

    // STAGE 3: Synthesis by Chair
    trace.stages.synthesis.startMs = Date.now() - requestStartTime;
    console.log(`[syndic8-council] [${trace.requestId}] Stage 3: Synthesizing council response...`);
    const synthesis = await getSynthesis(LOVABLE_API_KEY, template, expertDrafts, critiques);
    trace.stages.synthesis.endMs = Date.now() - requestStartTime;
    trace.stages.synthesis.durationMs = trace.stages.synthesis.endMs - trace.stages.synthesis.startMs;
    console.log(`[syndic8-council] [${trace.requestId}] Stage 3 complete: Synthesis ready in ${trace.stages.synthesis.durationMs}ms`);

    // Finalize trace
    trace.totalMs = Date.now() - requestStartTime;
    trace.success = true;

    // Prepare response with full council data
    const councilResponse = {
      success: true,
      sessionId,
      template,
      synthesis,
      expertDrafts: expertDrafts.map(d => ({
        expertId: d.expertId,
        expertName: d.expertName,
        answer: d.answer,
        confidence: d.confidence,
        assumptions: d.assumptions,
        uncertainties: d.uncertainties
      })),
      critiques: critiques.map(c => ({
        reviewerName: c.reviewerName,
        targetExpertId: c.targetExpertId,
        scores: c.scores,
        strengths: c.strengths,
        improvements: c.improvements
      })),
      metadata: {
        councilSize: councilMembers.length,
        avgConfidence: expertDrafts.reduce((sum, d) => sum + d.confidence, 0) / expertDrafts.length,
        hasSignificantDissent: synthesis.dissentSummary !== null && synthesis.dissentSummary !== ""
      },
      trace
    };

    // Log structured trace for observability
    console.log(JSON.stringify({ type: "COUNCIL_TRACE", ...trace }));

    return new Response(
      JSON.stringify(councilResponse),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    // Log error trace
    trace.totalMs = Date.now() - requestStartTime;
    trace.success = false;
    trace.errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.log(JSON.stringify({ type: "COUNCIL_TRACE_ERROR", ...trace }));
    
    console.error("[syndic8-council] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});