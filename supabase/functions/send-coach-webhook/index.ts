import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  event: 'coach.published' | 'coach.updated' | 'coach.unpublished' | 'coach.deleted';
  coach: {
    id: string;
    slug: string;
    name: string;
    email: string | null;
    specialization: string | null;
    avatar_url: string | null;
    bio: string | null;
    expertise: string[];
    rating: number;
    total_sessions: number;
  };
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { event, coachId, coachData } = await req.json();

    if (!event || !coachId) {
      console.error('[send-coach-webhook] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: event, coachId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[send-coach-webhook] Processing event: ${event} for coach: ${coachId}`);

    // Fetch coach data if not provided
    let coach = coachData;
    if (!coach) {
      const { data: coachProfile, error: coachError } = await supabase
        .from('coach_profiles')
        .select('id, slug, user_id, specialization, bio, expertise, rating, total_sessions')
        .eq('id', coachId)
        .single();

      if (coachError) {
        console.error('[send-coach-webhook] Error fetching coach:', coachError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch coach data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch profile info including email
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, email')
        .eq('id', coachProfile.user_id)
        .single();

      coach = {
        id: coachProfile.id,
        slug: coachProfile.slug,
        name: profile?.full_name || 'Unknown Coach',
        email: profile?.email || null,
        specialization: coachProfile.specialization,
        avatar_url: profile?.avatar_url,
        bio: coachProfile.bio,
        expertise: coachProfile.expertise || [],
        rating: coachProfile.rating || 0,
        total_sessions: coachProfile.total_sessions || 0,
      };
    }

    // Fetch all active outbound webhooks that subscribe to this event
    const { data: webhooks, error: webhooksError } = await supabase
      .from('outbound_webhooks')
      .select('*')
      .eq('is_active', true)
      .contains('events', [event]);

    if (webhooksError) {
      console.error('[send-coach-webhook] Error fetching webhooks:', webhooksError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch webhooks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter out expired webhooks
    const now = new Date();
    const validWebhooks = (webhooks || []).filter(webhook => {
      if (!webhook.expires_at) return true; // Never expires
      return new Date(webhook.expires_at) > now;
    });

    const expiredCount = (webhooks?.length || 0) - validWebhooks.length;
    if (expiredCount > 0) {
      console.log(`[send-coach-webhook] Skipped ${expiredCount} expired webhook(s)`);
    }

    if (validWebhooks.length === 0) {
      console.log('[send-coach-webhook] No active/valid webhooks found for event:', event);
      return new Response(
        JSON.stringify({ success: true, message: 'No valid webhooks configured for this event', webhooksSent: 0, expiredSkipped: expiredCount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[send-coach-webhook] Sending to ${validWebhooks.length} webhook(s)`);

    const payload: WebhookPayload = {
      event,
      coach,
      timestamp: new Date().toISOString(),
    };

    const results = await Promise.all(
      validWebhooks.map(async (webhook) => {
        try {
          console.log(`[send-coach-webhook] Calling webhook: ${webhook.name} (${webhook.url})`);
          
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Secret': webhook.secret_key,
              'X-Api-Key': webhook.secret_key,
              'X-Event-Type': event,
              'X-Timestamp': Date.now().toString(),
            },
            body: JSON.stringify(payload),
          });

          const responseStatus = response.status;
          let responseBody = '';
          try {
            responseBody = await response.text();
          } catch {
            responseBody = 'Unable to read response';
          }

          // Log the webhook call
          await supabase.from('webhook_logs').insert({
            webhook_id: webhook.id,
            event_type: event,
            payload: payload as unknown as Record<string, unknown>,
            response_status: responseStatus,
            response_body: responseBody.substring(0, 1000),
          });

          // Update last triggered
          await supabase
            .from('outbound_webhooks')
            .update({ 
              last_triggered_at: new Date().toISOString(),
              last_response_status: responseStatus,
            })
            .eq('id', webhook.id);

          console.log(`[send-coach-webhook] Webhook ${webhook.name} responded with status: ${responseStatus}`);

          return {
            webhookId: webhook.id,
            webhookName: webhook.name,
            success: response.ok,
            status: responseStatus,
          };
        } catch (error) {
          console.error(`[send-coach-webhook] Error calling webhook ${webhook.name}:`, error);
          
          // Log the error
          await supabase.from('webhook_logs').insert({
            webhook_id: webhook.id,
            event_type: event,
            payload: payload as unknown as Record<string, unknown>,
            error_message: error instanceof Error ? error.message : 'Unknown error',
          });

          return {
            webhookId: webhook.id,
            webhookName: webhook.name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;
    console.log(`[send-coach-webhook] Completed: ${successCount}/${results.length} webhooks succeeded`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent to ${results.length} webhook(s)`,
        webhooksSent: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[send-coach-webhook] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
