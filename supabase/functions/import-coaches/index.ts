import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CoachData {
  fullName: string;
  email: string;
}

const specializations = [
  "Life Coaching", "Relationship Coaching", "Business & Leadership",
  "Health & Wellness", "Mindfulness & Meditation", "Personal Development",
  "Career Coaching", "Financial Coaching", "Parenting & Family",
  "Spiritual Guidance", "Trauma Recovery", "Performance Coaching"
];

const personalities = [
  "Empathetic and supportive", "Direct and action-oriented",
  "Analytical and strategic", "Creative and intuitive",
  "Warm and encouraging", "Challenging and motivational"
];

const expertiseSets = [
  ["Mindfulness", "Meditation", "Stress Management"],
  ["Relationships", "Communication", "Conflict Resolution"],
  ["Leadership", "Strategy", "Team Building"],
  ["Fitness", "Nutrition", "Holistic Health"],
  ["Goal Setting", "Productivity", "Time Management"],
  ["Self-Discovery", "Purpose", "Transformation"],
  ["Career Development", "Job Search", "Networking"],
  ["Financial Planning", "Wealth Building", "Money Mindset"],
  ["Parenting", "Family Dynamics", "Work-Life Balance"],
  ["Spirituality", "Inner Peace", "Connection"],
  ["Trauma Healing", "PTSD Recovery", "Emotional Resilience"],
  ["Performance", "Achievement", "Excellence"]
];

const avatarUrls = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=400&fit=crop&crop=faces"
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify user is authenticated and has admin role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error("User verification failed:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("Admin role check failed:", roleError?.message || "No admin role found");
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin ${user.id} initiated coach import`);

    const { coaches }: { coaches: CoachData[] } = await req.json();

    // Limit batch size to prevent abuse
    if (!coaches || coaches.length === 0) {
      return new Response(
        JSON.stringify({ error: "No coaches provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (coaches.length > 50) {
      return new Response(
        JSON.stringify({ error: "Maximum 50 coaches per batch" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (let i = 0; i < coaches.length; i++) {
      const coach = coaches[i];
      
      if (!coach.email) {
        results.push({ 
          name: coach.fullName, 
          success: false, 
          error: "Missing email" 
        });
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(coach.email)) {
        results.push({ 
          name: coach.fullName, 
          success: false, 
          error: "Invalid email format" 
        });
        continue;
      }

      try {
        // Generate secure random password
        const securePassword = crypto.randomUUID() + "Aa1!";

        // Create auth user with secure password
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: coach.email,
          password: securePassword,
          email_confirm: true,
          user_metadata: {
            full_name: coach.fullName
          }
        });

        if (authError) throw authError;

        const userId = authData.user.id;

        // Generate avatar URL
        const randomAvatar = avatarUrls[i % avatarUrls.length];

        // Insert into profiles (will be auto-created by trigger, but we can update)
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({
            full_name: coach.fullName,
            email: coach.email,
            avatar_url: randomAvatar
          })
          .eq("id", userId);

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Profile error:", profileError);
        }

        // Assign coach role
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .insert({
            user_id: userId,
            role: "coach"
          });

        if (roleError) throw roleError;

        // Create coach profile with placeholder data
        const randomSpec = specializations[i % specializations.length];
        const randomPersonality = personalities[i % personalities.length];
        const randomExpertise = expertiseSets[i % expertiseSets.length];
        const randomRate = 75 + (i % 9) * 25; // Rates between 75-300
        const randomRating = 4.2 + (i % 9) * 0.1; // Ratings between 4.2-5.0
        const randomSessions = 10 + (i % 50) * 10; // Sessions between 10-500

        const bio = `Experienced ${randomSpec.toLowerCase()} coach dedicated to helping clients achieve meaningful transformation. With a ${randomPersonality.toLowerCase()} approach, ${coach.fullName} specializes in ${randomExpertise.slice(0, 2).join(' and ')}. ${coach.fullName.split(' ')[0]} has helped numerous clients overcome challenges and reach their personal and professional goals.`;

        const { error: coachError } = await supabaseAdmin
          .from("coach_profiles")
          .insert({
            user_id: userId,
            specialization: randomSpec,
            bio: bio,
            personality: randomPersonality,
            hourly_rate: randomRate,
            rating: randomRating,
            total_sessions: randomSessions,
            expertise: randomExpertise,
            is_verified: true, // Auto-verify all imported coaches
            is_claimed: false
          });

        if (coachError) throw coachError;

        results.push({ 
          name: coach.fullName, 
          email: coach.email,
          success: true 
        });

      } catch (error: any) {
        results.push({ 
          name: coach.fullName, 
          success: false, 
          error: error.message 
        });
      }
    }

    console.log(`Import completed: ${results.filter(r => r.success).length} success, ${results.filter(r => !r.success).length} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Import error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
