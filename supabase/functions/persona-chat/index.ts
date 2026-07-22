import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch webhook URL from database
    const { data: webhookData, error: webhookError } = await supabase
      .from("webhook_endpoints")
      .select("url")
      .eq("name", "add_coach_agent")
      .single();

    if (webhookError || !webhookData?.url) {
      console.error("Failed to fetch webhook URL:", webhookError);
      return new Response(
        JSON.stringify({ error: "Webhook not configured. Please set up the webhook URL in the admin dashboard." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const WEBHOOK_URL = webhookData.url;

    if (!WEBHOOK_URL || WEBHOOK_URL.trim() === "") {
      console.error("Webhook URL is empty");
      return new Response(
        JSON.stringify({ error: "Webhook URL is not configured. Please add the webhook URL in the admin dashboard." }),
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

    console.log("Sending to webhook:", { message, message_id, session_id, webhook: WEBHOOK_URL.substring(0, 50) + "..." });

    // Build the endpoint URL for sending additional responses
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