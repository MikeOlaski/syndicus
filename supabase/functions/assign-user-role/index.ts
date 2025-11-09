import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return new Response(
        JSON.stringify({ error: "Missing userId or role" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate role
    if (!["admin", "coach", "subscriber"].includes(role)) {
      return new Response(
        JSON.stringify({ error: "Invalid role" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Assigning role ${role} to user ${userId}`);

    // Assign role to user using service role key (bypasses RLS)
    const { data, error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: role });

    if (error) {
      console.error("Error assigning role:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If coach, create coach profile
    if (role === "coach") {
      const { error: profileError } = await supabase
        .from("coach_profiles")
        .insert({
          user_id: userId,
          is_claimed: true,
        });

      if (profileError) {
        console.error("Error creating coach profile:", profileError);
        return new Response(
          JSON.stringify({ error: profileError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    console.log(`Successfully assigned role ${role} to user ${userId}`);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in assign-user-role function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
