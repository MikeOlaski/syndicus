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
    const { message_id, session_id, response } = await req.json();

    console.log("Received agent response:", { message_id, session_id, response: response?.substring(0, 100) });

    if (!message_id || !session_id || !response) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: message_id, session_id, response" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client for broadcasting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Broadcast the response to the specific session channel
    const channel = supabase.channel(`agent-responses-${session_id}`);
    
    await channel.subscribe();
    
    await channel.send({
      type: "broadcast",
      event: "agent-response",
      payload: {
        message_id,
        response,
        timestamp: new Date().toISOString(),
      },
    });

    await supabase.removeChannel(channel);

    console.log("Broadcast sent successfully to session:", session_id);

    return new Response(
      JSON.stringify({ success: true, message: "Response broadcasted" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in agent-response function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
