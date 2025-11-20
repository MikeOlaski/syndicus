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
  "Executive Leadership", "Life & Wellness", "Career Transition", 
  "Business Growth", "Relationship Coaching", "Performance Coaching",
  "Mindfulness & Meditation", "Personal Development", "Health & Fitness"
];

const personalities = [
  "Strategic, analytical, and empowering",
  "Supportive, motivational, and intuitive",
  "Practical, encouraging, and results-focused",
  "Ambitious, tactical, and innovation-driven",
  "Empathetic, insightful, and relationship-focused",
  "High-energy, goal-oriented, and precise"
];

const expertiseSets = [
  ["Leadership", "Strategy", "Executive Coaching"],
  ["Wellness", "Balance", "Personal Growth"],
  ["Career", "Transition", "Planning"],
  ["Business", "Growth", "Entrepreneurship"],
  ["Relationships", "Communication", "Empathy"],
  ["Performance", "Goals", "Optimization"],
  ["Mindfulness", "Meditation", "Stress Management"],
  ["Self-Development", "Confidence", "Motivation"]
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { coaches }: { coaches: CoachData[] } = await req.json();

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

      try {
        // Create auth user with temporary password
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: coach.email,
          password: `TempPass123!${i}`, // Temporary password
          email_confirm: true,
          user_metadata: {
            full_name: coach.fullName
          }
        });

        if (authError) throw authError;

        const userId = authData.user.id;

        // Insert into profiles (will be auto-created by trigger, but we can update)
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({
            full_name: coach.fullName,
            email: coach.email
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
        const randomRate = 100 + (i % 5) * 50; // Rates between 100-350
        const randomRating = 4.5 + (i % 5) * 0.1; // Ratings between 4.5-4.9
        const randomSessions = 50 + (i % 20) * 10; // Sessions between 50-240

        const { error: coachError } = await supabaseAdmin
          .from("coach_profiles")
          .insert({
            user_id: userId,
            specialization: randomSpec,
            bio: `Experienced ${randomSpec.toLowerCase()} coach dedicated to helping clients achieve their goals through proven methodologies and personalized guidance.`,
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
