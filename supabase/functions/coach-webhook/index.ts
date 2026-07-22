import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { coachProfileId, sessionId, action, chatInput } = await req.json();

    // Validate required fields
    if (!coachProfileId || !sessionId || !chatInput) {
      console.error('[coach-webhook] Missing required fields:', { coachProfileId, sessionId, chatInput: !!chatInput });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: coachProfileId, sessionId, chatInput' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input lengths
    if (chatInput.length > 10000) {
      console.error('[coach-webhook] Chat input too long:', chatInput.length);
      return new Response(
        JSON.stringify({ error: 'Chat input exceeds maximum length (10000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[coach-webhook] Processing request for coach:', coachProfileId, 'session:', sessionId);

    // Fetch coach webhook URL using service role (bypasses RLS)
    const { data: coachProfile, error: coachError } = await supabase
      .from('coach_profiles')
      .select('webhook_url, slug')
      .eq('id', coachProfileId)
      .maybeSingle();

    if (coachError) {
      console.error('[coach-webhook] Error fetching coach profile:', coachError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch coach profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!coachProfile) {
      console.error('[coach-webhook] Coach profile not found:', coachProfileId);
      return new Response(
        JSON.stringify({ error: 'Coach profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!coachProfile.webhook_url) {
      console.error('[coach-webhook] No webhook URL configured for coach:', coachProfileId);
      return new Response(
        JSON.stringify({ error: 'Coach has no webhook configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate webhook URL is HTTPS
    const webhookUrl = coachProfile.webhook_url;
    if (!webhookUrl.startsWith('https://')) {
      console.error('[coach-webhook] Insecure webhook URL rejected:', webhookUrl.substring(0, 50));
      return new Response(
        JSON.stringify({ error: 'Webhook URL must use HTTPS' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[coach-webhook] Calling webhook for coach:', coachProfile.slug);

    // Call the external webhook with the coach's configured URL
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Coach-Profile-ID': coachProfileId,
        'X-Session-ID': sessionId,
        'X-Timestamp': Date.now().toString(),
      },
      body: JSON.stringify({
        sessionId,
        action: action || 'sendMessage',
        chatInput,
      }),
    });

    if (!webhookResponse.ok) {
      console.error('[coach-webhook] Webhook request failed:', webhookResponse.status, webhookResponse.statusText);
      return new Response(
        JSON.stringify({ error: `Webhook request failed with status ${webhookResponse.status}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate webhook response
    const responseText = await webhookResponse.text();
    
    // Limit response size
    if (responseText.length > 50000) {
      console.error('[coach-webhook] Response too large:', responseText.length);
      return new Response(
        JSON.stringify({ error: 'Webhook response too large' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[coach-webhook] Invalid JSON response from webhook');
      return new Response(
        JSON.stringify({ error: 'Invalid response from webhook' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate response structure
    if (!responseData || typeof responseData !== 'object') {
      console.error('[coach-webhook] Invalid response format from webhook');
      return new Response(
        JSON.stringify({ error: 'Invalid response format from webhook' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract response content with validation
    let responseContent: string;
    if (typeof responseData.response === 'string') {
      responseContent = responseData.response;
    } else if (typeof responseData.output === 'string') {
      responseContent = responseData.output;
    } else if (typeof responseData.message === 'string') {
      responseContent = responseData.message;
    } else {
      console.error('[coach-webhook] No valid response content found in webhook response');
      return new Response(
        JSON.stringify({ error: 'Invalid response content from webhook' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize and return
    const sanitizedContent = responseContent.slice(0, 50000).trim();
    
    if (!sanitizedContent) {
      console.error('[coach-webhook] Empty response content from webhook');
      return new Response(
        JSON.stringify({ error: 'Empty response from webhook' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[coach-webhook] Successfully processed webhook response');

    return new Response(
      JSON.stringify({ response: sanitizedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[coach-webhook] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
