import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
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

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let keySource: "external_api_keys" | "outbound_webhooks" = "external_api_keys";
    let keyName = "";
    let isValid = false;

    // First, try to validate against external_api_keys table
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("external_api_keys")
      .select("id, name, permissions, is_active, allowed_origins")
      .eq("api_key", apiKey)
      .single();

    if (apiKeyData && !apiKeyError) {
      // Found in external_api_keys
      if (!apiKeyData.is_active) {
        return new Response(
          JSON.stringify({ error: "API key is deactivated" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check chat permission for external_api_keys
      if (!apiKeyData.permissions?.includes("chat")) {
        return new Response(
          JSON.stringify({ error: "API key does not have chat permission" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update last_used_at
      await supabase
        .from("external_api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", apiKeyData.id);

      keySource = "external_api_keys";
      keyName = apiKeyData.name;
      isValid = true;
    } else {
      // Try to validate against outbound_webhooks secret_key
      const { data: webhookData, error: webhookError } = await supabase
        .from("outbound_webhooks")
        .select("id, name, secret_key, is_active, expires_at")
        .eq("secret_key", apiKey)
        .single();

      if (webhookData && !webhookError) {
        // Found in outbound_webhooks
        if (!webhookData.is_active) {
          return new Response(
            JSON.stringify({ error: "Webhook key is deactivated" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if expired
        if (webhookData.expires_at) {
          const expiresAt = new Date(webhookData.expires_at);
          if (expiresAt < new Date()) {
            return new Response(
              JSON.stringify({ error: "Webhook key has expired" }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        // Update last_triggered_at for tracking
        await supabase
          .from("outbound_webhooks")
          .update({ last_triggered_at: new Date().toISOString() })
          .eq("id", webhookData.id);

        keySource = "outbound_webhooks";
        keyName = webhookData.name;
        isValid = true;
      }
    }

    if (!isValid) {
      console.error("Invalid API key - not found in either table");
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`API key validated from ${keySource}: ${keyName}`);

    // Parse request body
    const body = await req.json();
    const { coach_slug, session_id, message } = body;

    if (!coach_slug) {
      return new Response(
        JSON.stringify({ error: "coach_slug is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "message is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Message too long (max 2000 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get coach by slug - must be verified AND published (show_on_homepage)
    const { data: coach, error: coachError } = await supabase
      .from("coach_profiles")
      .select("id, user_id, slug, webhook_url")
      .eq("slug", coach_slug)
      .eq("is_verified", true)
      .eq("show_on_homepage", true)
      .single();

    if (coachError || !coach) {
      console.error("Coach not found or not published:", coachError);
      return new Response(
        JSON.stringify({ error: "Coach not found or not available for chat" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!coach.webhook_url) {
      return new Response(
        JSON.stringify({ error: "Coach is not configured for chat" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate or use provided session ID
    const chatSessionId = session_id || crypto.randomUUID();

    // Call the coach's webhook
    console.log(`Calling webhook for coach ${coach.slug}: ${coach.webhook_url}`);
    
    const webhookResponse = await fetch(coach.webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coachProfileId: coach.id,
        sessionId: chatSessionId,
        action: "sendMessage",
        chatInput: message,
        source: "external_api",
        api_key_name: keyName,
        key_source: keySource,
      }),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error("Webhook error:", webhookResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get response from coach" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let webhookData;
    try {
      webhookData = await webhookResponse.json();
      console.log("Webhook response data:", JSON.stringify(webhookData));
    } catch (e) {
      console.error("Failed to parse webhook response:", e);
      return new Response(
        JSON.stringify({ error: "Invalid response from coach" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the response content - check multiple possible field names
    const responseContent = 
      webhookData.response || 
      webhookData.message || 
      webhookData.content || 
      webhookData.output || 
      webhookData.text || 
      webhookData.reply ||
      webhookData.answer ||
      webhookData.result ||
      (webhookData.data?.response) ||
      (webhookData.data?.message) ||
      (webhookData.data?.output) ||
      "No response";
    
    console.log("Extracted response content:", responseContent);

    console.log(`External chat success for ${keyName} (${keySource}) -> ${coach.slug}`);

    return new Response(
      JSON.stringify({
        response: responseContent,
        session_id: chatSessionId,
        coach: {
          slug: coach.slug,
        },
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
