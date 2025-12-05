import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateCoachRequest {
  email: string;
  fullName: string;
  password?: string;
  bio?: string;
  specialization?: string;
  hourlyRate?: number;
  expertise?: string[];
  status?: string;
  isVerified?: boolean;
}

// Generate a random password if none provided
function generatePassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create a client with the user's token to verify they're an admin
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error("Failed to get user:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user is an admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      console.error("User is not an admin:", roleError);
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const requestData: CreateCoachRequest = await req.json();
    const {
      email,
      fullName,
      password,
      bio,
      specialization,
      hourlyRate,
      expertise,
      status = "admin_setup",
      isVerified = false,
    } = requestData;

    console.log(`Creating coach account for: ${email}`);

    // Validate required fields
    if (!email || !fullName) {
      return new Response(
        JSON.stringify({ error: "Email and full name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use provided password or generate one
    const userPassword = password || generatePassword();

    // Step 1: Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${authError.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUserId = authData.user.id;
    console.log(`Created auth user with ID: ${newUserId}`);

    // Step 2: Update the profiles table (trigger should have created it, but let's update with full_name)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: fullName,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      })
      .eq("id", newUserId);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      // Don't fail the whole operation, the profile might not exist yet
    }

    // Step 3: Add the coach role
    const { error: roleInsertError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: newUserId,
        role: "coach",
      });

    if (roleInsertError) {
      console.error("Error inserting role:", roleInsertError);
      return new Response(
        JSON.stringify({ error: `Failed to assign coach role: ${roleInsertError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Assigned coach role to user: ${newUserId}`);

    // Step 4: Create the coach profile
    const { error: coachProfileError } = await supabaseAdmin
      .from("coach_profiles")
      .insert({
        user_id: newUserId,
        bio: bio || null,
        specialization: specialization || null,
        hourly_rate: hourlyRate || null,
        expertise: expertise || null,
        status: status,
        is_verified: isVerified,
        is_claimed: false,
        rating: 0,
        total_sessions: 0,
      });

    if (coachProfileError) {
      console.error("Error creating coach profile:", coachProfileError);
      return new Response(
        JSON.stringify({ error: `Failed to create coach profile: ${coachProfileError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Created coach profile for user: ${newUserId}`);

    // Log the admin action
    await supabaseAdmin.from("admin_actions").insert({
      admin_id: user.id,
      target_user_id: newUserId,
      action_type: "create_coach",
      details: {
        email,
        full_name: fullName,
        status,
        is_verified: isVerified,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Coach account created successfully for ${fullName}`,
        userId: newUserId,
        email,
        temporaryPassword: password ? undefined : userPassword, // Only return if auto-generated
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
