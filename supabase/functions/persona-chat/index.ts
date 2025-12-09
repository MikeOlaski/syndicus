import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get webhook URL from environment variable (secure)
const WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate webhook URL is configured
    if (!WEBHOOK_URL) {
      console.error("N8N_WEBHOOK_URL environment variable not configured");
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { message, message_id, session_id } = body;

    // Input validation
    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (message.length > 10000) {
      return new Response(
        JSON.stringify({ error: "Message exceeds maximum length of 10000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!session_id || typeof session_id !== "string" || session_id.length > 100) {
      return new Response(
        JSON.stringify({ error: "Valid session_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (message_id && (typeof message_id !== "string" || message_id.length > 100)) {
      return new Response(
        JSON.stringify({ error: "Invalid message_id format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending to n8n webhook:", { message, message_id, session_id });

    // Build the endpoint URL for n8n to send additional responses
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const agentResponseEndpoint = `${supabaseUrl}/functions/v1/agent-response`;

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        message, 
        message_id,
        session_id,
        response_endpoint: agentResponseEndpoint,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Webhook error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Webhook returned ${response.status}: ${errorText}` }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const data = await response.text();
    console.log("Webhook response:", data);

    return new Response(data, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in persona-chat function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
