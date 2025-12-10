import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a random password
function generatePassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Generate a random email for the bot
function generateBotEmail(botName: string): string {
  const sanitizedName = botName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${sanitizedName}-bot-${randomSuffix}@persona.ai`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for all operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create service role client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check for API key authentication (for n8n/external services)
    const apiKeyHeader = req.headers.get("apikey") || req.headers.get("x-api-key");
    const authHeader = req.headers.get("Authorization");

    let isApiKeyAuth = false;
    let user: { id: string } | null = null;

    // Validate API key if provided (for n8n webhooks)
    if (apiKeyHeader) {
      // Verify API key matches the anon key or service role key
      if (apiKeyHeader === supabaseAnonKey || apiKeyHeader === supabaseServiceRoleKey) {
        isApiKeyAuth = true;
        console.log("Authenticated via API key");
      } else {
        return new Response(
          JSON.stringify({ error: "Invalid API key" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } 
    // Validate JWT if provided (for browser/app calls)
    else if (authHeader) {
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
      if (userError || !userData.user) {
        console.error("Auth error:", userError);
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      user = userData.user;
      console.log("Authenticated via JWT for user:", user.id);
    } 
    // No authentication provided
    else {
      return new Response(
        JSON.stringify({ error: "Missing authorization header. Use 'apikey' or 'Authorization' header." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { message_id, session_id, response, action, bot_name } = body;

    // Input validation
    if (!session_id || typeof session_id !== "string" || session_id.length > 100) {
      console.error("Invalid session_id provided");
      return new Response(
        JSON.stringify({ error: "Valid session_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!message_id || typeof message_id !== "string" || message_id.length > 100) {
      return new Response(
        JSON.stringify({ error: "Valid message_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response || typeof response !== "string" || response.length > 50000) {
      return new Response(
        JSON.stringify({ error: "Response is required and must be less than 50000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action && !["create-bot"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (bot_name && (typeof bot_name !== "string" || bot_name.length > 100 || !/^[a-zA-Z0-9\s\-_]+$/.test(bot_name))) {
      return new Response(
        JSON.stringify({ error: "Invalid bot_name format. Use alphanumeric characters, spaces, hyphens, and underscores only." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Received agent response:", { 
      message_id, 
      session_id, 
      response: response?.substring(0, 100),
      action,
      bot_name,
      user_id: user?.id || "api-key-auth",
      auth_method: isApiKeyAuth ? "api-key" : "jwt"
    });

    // Check admin role if trying to create a bot (only for JWT auth)
    if (action === "create-bot") {
      // API key auth is considered trusted (admin level)
      if (!isApiKeyAuth && user) {
        const { data: hasAdminRole } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

        if (!hasAdminRole) {
          console.error("Non-admin user attempted bot creation:", user.id);
          return new Response(
            JSON.stringify({ error: "Admin role required for bot creation" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      // If API key auth, it's trusted for bot creation
      console.log("Bot creation authorized via:", isApiKeyAuth ? "API key" : "Admin JWT");
    }

    let coachCreated = false;
    let createdCoachData: { userId?: string; email?: string; temporaryPassword?: string } = {};

    // Check if we need to create a bot/coach
    if (action === "create-bot" && bot_name) {
      console.log(`Creating bot/coach with name: ${bot_name}`);

      try {
        const email = generateBotEmail(bot_name);
        const password = generatePassword();

        // Step 1: Create the auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: bot_name,
          },
        });

        if (authError) {
          console.error("Error creating auth user for bot:", authError);
        } else {
          const newUserId = authData.user.id;
          console.log(`Created auth user for bot with ID: ${newUserId}`);

          // Step 2: Update the profiles table
          await supabase
            .from("profiles")
            .update({
              full_name: bot_name,
              avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(bot_name)}`,
            })
            .eq("id", newUserId);

          // Step 3: Add the coach role
          const { error: roleInsertError } = await supabase
            .from("user_roles")
            .insert({
              user_id: newUserId,
              role: "coach",
            });

          if (roleInsertError) {
            console.error("Error inserting coach role:", roleInsertError);
          }

          // Step 4: Create the coach profile
          const { error: coachProfileError } = await supabase
            .from("coach_profiles")
            .insert({
              user_id: newUserId,
              bio: `AI Persona Bot - ${bot_name}`,
              specialization: "AI Assistant",
              status: "admin_setup",
              is_verified: false,
              is_claimed: false,
              rating: 0,
              total_sessions: 0,
            });

          if (coachProfileError) {
            console.error("Error creating coach profile:", coachProfileError);
          } else {
            coachCreated = true;
            createdCoachData = {
              userId: newUserId,
              email,
              temporaryPassword: password,
            };
            console.log(`Successfully created coach profile for bot: ${bot_name}`);
          }
        }
      } catch (createError) {
        console.error("Error during bot creation:", createError);
      }
    }

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
        // Include coach creation info if created
        coach_created: coachCreated,
        coach_data: coachCreated ? createdCoachData : undefined,
      },
    });

    await supabase.removeChannel(channel);

    console.log("Broadcast sent successfully to session:", session_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Response broadcasted",
        coach_created: coachCreated,
        coach_data: coachCreated ? createdCoachData : undefined,
      }),
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
