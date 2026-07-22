import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvalScores {
  coherence: number;        // 1-5
  expertUtilization: number; // 0-100%
  dissentAccuracy: number;   // 1-5
  actionability: number;     // 1-5
  themeCoverage: number;     // 0-100%
  overall: number;           // 0-100
}

interface EvalCase {
  id: string;
  question: string;
  expected_council_template: string;
  expected_themes: string[];
  expected_dissent_topics: string[];
  difficulty: string;
  category: string;
}

// Tool for structured scoring output
const scoringTool = {
  type: "function",
  function: {
    name: "submit_scores",
    description: "Submit evaluation scores for the council response",
    parameters: {
      type: "object",
      properties: {
        coherence: { 
          type: "number", 
          description: "1-5 score for logical flow and contradiction resolution" 
        },
        expertUtilization: { 
          type: "number", 
          description: "0-100 percentage of expert insights reflected in synthesis" 
        },
        dissentAccuracy: { 
          type: "number", 
          description: "1-5 score for correct identification of disagreements" 
        },
        actionability: { 
          type: "number", 
          description: "1-5 score for clarity and implementability of next steps" 
        },
        themeCoverage: { 
          type: "number", 
          description: "0-100 percentage of expected themes addressed" 
        },
        reasoning: {
          type: "string",
          description: "Brief explanation of scoring decisions"
        }
      },
      required: ["coherence", "expertUtilization", "dissentAccuracy", "actionability", "themeCoverage", "reasoning"],
      additionalProperties: false
    }
  }
};

async function scoreCouncilResponse(
  apiKey: string,
  evalCase: EvalCase,
  councilResponse: any
): Promise<{ scores: EvalScores; reasoning: string }> {
  const scoringPrompt = `You are an AI evaluation expert. Score this council response against the expected criteria.

## TEST CASE:
Question: "${evalCase.question}"
Expected Themes: ${JSON.stringify(evalCase.expected_themes)}
Expected Dissent Topics: ${JSON.stringify(evalCase.expected_dissent_topics)}
Difficulty: ${evalCase.difficulty}

## COUNCIL RESPONSE:
Final Answer: ${councilResponse.synthesis?.finalAnswer || 'N/A'}
Consensus Points: ${JSON.stringify(councilResponse.synthesis?.consensusPoints || [])}
Dissent Summary: ${councilResponse.synthesis?.dissentSummary || 'None'}
Next Steps: ${JSON.stringify(councilResponse.synthesis?.nextSteps || [])}

## EXPERT DRAFTS:
${councilResponse.expertDrafts?.map((d: any) => `- ${d.expertName}: ${d.answer?.substring(0, 200)}...`).join('\n') || 'No drafts'}

## SCORING RUBRIC:
- COHERENCE (1-5): Does the synthesis flow logically? Are contradictions resolved?
- EXPERT_UTILIZATION (0-100%): What percentage of expert insights are reflected?
- DISSENT_ACCURACY (1-5): Are disagreements correctly identified and explained?
- ACTIONABILITY (1-5): Are next steps clear and implementable?
- THEME_COVERAGE (0-100%): What percentage of expected themes are addressed?

Use the submit_scores tool with your evaluation.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: scoringPrompt }],
      tools: [scoringTool],
      tool_choice: { type: "function", function: { name: "submit_scores" } }
    }),
  });

  if (!response.ok) {
    console.error("Scoring API failed:", response.status);
    return {
      scores: {
        coherence: 3,
        expertUtilization: 50,
        dissentAccuracy: 3,
        actionability: 3,
        themeCoverage: 50,
        overall: 50
      },
      reasoning: "Scoring unavailable - API error"
    };
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

  if (toolCall?.function?.arguments) {
    try {
      const parsed = JSON.parse(toolCall.function.arguments);
      const overall = Math.round(
        (parsed.coherence / 5 * 20) +
        (parsed.expertUtilization * 0.2) +
        (parsed.dissentAccuracy / 5 * 20) +
        (parsed.actionability / 5 * 20) +
        (parsed.themeCoverage * 0.2)
      );
      
      return {
        scores: {
          coherence: parsed.coherence,
          expertUtilization: parsed.expertUtilization,
          dissentAccuracy: parsed.dissentAccuracy,
          actionability: parsed.actionability,
          themeCoverage: parsed.themeCoverage,
          overall
        },
        reasoning: parsed.reasoning || ""
      };
    } catch (e) {
      console.error("Failed to parse scores:", e);
    }
  }

  return {
    scores: {
      coherence: 3,
      expertUtilization: 50,
      dissentAccuracy: 3,
      actionability: 3,
      themeCoverage: 50,
      overall: 50
    },
    reasoning: "Scoring parsing failed"
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Required environment variables not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // GET /syndic8-eval/summary - Get evaluation summary
    if (req.method === "GET" && path === "summary") {
      const { data: results, error } = await supabase
        .from("syndic8_eval_results")
        .select("scores, passed, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const total = results?.length || 0;
      const passed = results?.filter(r => r.passed).length || 0;
      const avgScores = results?.reduce((acc, r) => {
        const s = r.scores as EvalScores;
        return {
          coherence: acc.coherence + (s?.coherence || 0),
          expertUtilization: acc.expertUtilization + (s?.expertUtilization || 0),
          dissentAccuracy: acc.dissentAccuracy + (s?.dissentAccuracy || 0),
          actionability: acc.actionability + (s?.actionability || 0),
          themeCoverage: acc.themeCoverage + (s?.themeCoverage || 0),
          overall: acc.overall + (s?.overall || 0)
        };
      }, { coherence: 0, expertUtilization: 0, dissentAccuracy: 0, actionability: 0, themeCoverage: 0, overall: 0 });

      const summary = {
        totalEvaluations: total,
        passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
        averageScores: total > 0 ? {
          coherence: Math.round(avgScores.coherence / total * 10) / 10,
          expertUtilization: Math.round(avgScores.expertUtilization / total),
          dissentAccuracy: Math.round(avgScores.dissentAccuracy / total * 10) / 10,
          actionability: Math.round(avgScores.actionability / total * 10) / 10,
          themeCoverage: Math.round(avgScores.themeCoverage / total),
          overall: Math.round(avgScores.overall / total)
        } : null
      };

      return new Response(
        JSON.stringify(summary),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /syndic8-eval - Run single evaluation
    if (req.method === "POST" && path !== "batch") {
      const body = await req.json();
      const { evalCaseId, groupId } = body;

      if (!evalCaseId || !groupId) {
        return new Response(
          JSON.stringify({ error: "evalCaseId and groupId are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch the eval case
      const { data: evalCase, error: caseError } = await supabase
        .from("syndic8_eval_cases")
        .select("*")
        .eq("id", evalCaseId)
        .single();

      if (caseError || !evalCase) {
        return new Response(
          JSON.stringify({ error: "Eval case not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Call syndic8-council with the test question
      const startTime = Date.now();
      
      const councilResponse = await fetch(`${SUPABASE_URL}/functions/v1/syndic8-council`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId,
          message: evalCase.question,
          template: evalCase.expected_council_template,
          conversationHistory: []
        }),
      });

      const latencyMs = Date.now() - startTime;
      const councilData = await councilResponse.json();

      if (!councilResponse.ok || !councilData.success) {
        // Save failed result
        await supabase.from("syndic8_eval_results").insert({
          eval_case_id: evalCaseId,
          group_id: groupId,
          synthesis_output: null,
          expert_drafts: null,
          scores: {},
          latency_ms: latencyMs,
          passed: false,
          notes: `Council call failed: ${councilData.error || 'Unknown error'}`
        });

        return new Response(
          JSON.stringify({ error: "Council evaluation failed", details: councilData.error }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Score the response
      const { scores, reasoning } = await scoreCouncilResponse(LOVABLE_API_KEY, evalCase, councilData);

      // Determine pass/fail based on difficulty thresholds
      const passThresholds = {
        easy: 70,
        medium: 60,
        hard: 50
      };
      const threshold = passThresholds[evalCase.difficulty as keyof typeof passThresholds] || 60;
      const passed = scores.overall >= threshold;

      // Save result
      const { data: result, error: insertError } = await supabase
        .from("syndic8_eval_results")
        .insert({
          eval_case_id: evalCaseId,
          group_id: groupId,
          synthesis_output: councilData.synthesis,
          expert_drafts: councilData.expertDrafts,
          expert_critiques: councilData.critiques,
          scores,
          latency_ms: latencyMs,
          stage_timings: councilData.trace?.stages || {},
          passed,
          notes: reasoning
        })
        .select()
        .single();

      if (insertError) {
        console.error("Failed to save eval result:", insertError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          evalCaseId,
          groupId,
          scores,
          passed,
          latencyMs,
          threshold,
          reasoning,
          resultId: result?.id
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /syndic8-eval/batch - Run batch evaluation
    if (req.method === "POST" && path === "batch") {
      const body = await req.json();
      const { groupId, category, difficulty, limit = 10 } = body;

      if (!groupId) {
        return new Response(
          JSON.stringify({ error: "groupId is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch matching eval cases
      let query = supabase
        .from("syndic8_eval_cases")
        .select("*")
        .eq("is_active", true)
        .limit(limit);

      if (category) query = query.eq("category", category);
      if (difficulty) query = query.eq("difficulty", difficulty);

      const { data: cases, error: casesError } = await query;

      if (casesError || !cases || cases.length === 0) {
        return new Response(
          JSON.stringify({ error: "No eval cases found matching criteria" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Run evaluations sequentially to avoid rate limits
      const results = [];
      for (const evalCase of cases) {
        try {
          const startTime = Date.now();
          
          const councilResponse = await fetch(`${SUPABASE_URL}/functions/v1/syndic8-council`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              groupId,
              message: evalCase.question,
              template: evalCase.expected_council_template,
              conversationHistory: []
            }),
          });

          const latencyMs = Date.now() - startTime;
          const councilData = await councilResponse.json();

          if (councilResponse.ok && councilData.success) {
            const { scores, reasoning } = await scoreCouncilResponse(LOVABLE_API_KEY, evalCase, councilData);
            const passThresholds = { easy: 70, medium: 60, hard: 50 };
            const threshold = passThresholds[evalCase.difficulty as keyof typeof passThresholds] || 60;
            const passed = scores.overall >= threshold;

            await supabase.from("syndic8_eval_results").insert({
              eval_case_id: evalCase.id,
              group_id: groupId,
              synthesis_output: councilData.synthesis,
              expert_drafts: councilData.expertDrafts,
              expert_critiques: councilData.critiques,
              scores,
              latency_ms: latencyMs,
              passed,
              notes: reasoning
            });

            results.push({ caseId: evalCase.id, question: evalCase.question, passed, scores, latencyMs });
          } else {
            results.push({ caseId: evalCase.id, question: evalCase.question, passed: false, error: councilData.error });
          }

          // Add delay between evaluations to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (e) {
          results.push({ caseId: evalCase.id, question: evalCase.question, passed: false, error: String(e) });
        }
      }

      const passedCount = results.filter(r => r.passed).length;
      
      return new Response(
        JSON.stringify({
          success: true,
          totalCases: results.length,
          passed: passedCount,
          passRate: Math.round((passedCount / results.length) * 100),
          results
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid endpoint" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[syndic8-eval] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
