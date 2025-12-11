import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateCoachRequest {
  email?: string;
  fullName: string;
  password?: string;
  bio?: string;
  specialization?: string;
  personality?: string;
  hourlyRate?: number;
  expertise?: string[];
  status?: string;
  isVerified?: boolean;
  webhookUrl?: string;
}

// Reserved slugs that conflict with existing routes
const RESERVED_SLUGS = [
  'auth', 'reset-password', 'about', 'coaches', 'syndic8', 'create-claim',
  'coach-dashboard', 'subscriber-dashboard', 'admin-dashboard',
  'how-it-works', 'pricing', 'success-stories', 'help', 'contact',
  'privacy', 'directory', 'api', 'admin', 'login', 'signup', 'register',
];

// Generate a URL-friendly slug from a name
function generateSlug(name: string): string {
  if (!name || typeof name !== 'string') {
    return `coach-${Date.now()}`;
  }
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
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

    // Input validation - only fullName is required
    if (!requestData.fullName || typeof requestData.fullName !== "string" || requestData.fullName.length < 2 || requestData.fullName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Full name is required (2-100 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate placeholder email if not provided
    let email = requestData.email;
    if (!email) {
      const namePart = requestData.fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      email = `${namePart}-bot-${randomSuffix}@persona.ai`;
    }

    // Validate email format if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate optional fields
    if (requestData.bio && (typeof requestData.bio !== "string" || requestData.bio.length > 2000)) {
      return new Response(
        JSON.stringify({ error: "Bio must be less than 2000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (requestData.hourlyRate !== undefined && (typeof requestData.hourlyRate !== "number" || requestData.hourlyRate < 0 || requestData.hourlyRate > 10000)) {
      return new Response(
        JSON.stringify({ error: "Hourly rate must be between 0 and 10000" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (requestData.expertise && (!Array.isArray(requestData.expertise) || requestData.expertise.length > 20)) {
      return new Response(
        JSON.stringify({ error: "Expertise must be an array with max 20 items" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      fullName,
      password,
      bio,
      specialization,
      personality,
      hourlyRate,
      expertise,
      status = "admin_setup",
      isVerified = false,
      webhookUrl,
    } = requestData;

    console.log(`Creating coach account for: ${email}`);

    // Use provided password or generate one
    const userPassword = password || generatePassword();

    // Generate unique slug
    let baseSlug = generateSlug(fullName);
    
    // If empty after sanitization, use fallback
    if (!baseSlug) {
      baseSlug = 'coach';
    }
    
    // If reserved, append '-coach' suffix
    if (RESERVED_SLUGS.includes(baseSlug)) {
      baseSlug = `${baseSlug}-coach`;
    }
    
    // Check for uniqueness and append counter if needed
    let slug = baseSlug;
    let counter = 2;
    while (true) {
      const { data: existing } = await supabaseAdmin
        .from("coach_profiles")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    console.log(`Generated slug: ${slug}`);

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

    // Step 4: Create the coach profile with slug
    const { data: coachProfileData, error: coachProfileError } = await supabaseAdmin
      .from("coach_profiles")
      .insert({
        user_id: newUserId,
        slug: slug,
        bio: bio || null,
        specialization: specialization || null,
        personality: personality || null,
        hourly_rate: hourlyRate || null,
        expertise: expertise || null,
        status: status,
        is_verified: isVerified,
        is_claimed: false,
        rating: 0,
        total_sessions: 0,
        webhook_url: webhookUrl || null,
      })
      .select('id')
      .single();

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
        slug,
        status,
        is_verified: isVerified,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Coach account created successfully for ${fullName}`,
        userId: newUserId,
        coachProfileId: coachProfileData?.id,
        email,
        slug,
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
