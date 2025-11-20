import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const coaches = [
  {"fullName":"Danita Young","email":"rehabit+danita+young@mikeolaski.com"},
  {"fullName":"Mike Olaski","email":"rehabit+mike+olaski@mikeolaski.com"},
  {"fullName":"Radek Sefcik","email":"rehabit+radek+sefcik@mikeolaski.com"},
  {"fullName":"Sonia Ricotti","email":"rehabit+sonia+ricotti@mikeolaski.com"},
  {"fullName":"Barnet Bain","email":"rehabit+barnet+bain@mikeolaski.com"},
  {"fullName":"Julian Cowan Hill","email":"rehabit+julian+cowan@mikeolaski.com"},
  {"fullName":"Korina Lymnioudi","email":"rehabit+korina+lymnioudi@mikeolaski.com"},
  {"fullName":"Dr. Russell Kennedy","email":"rehabit+dr+russell@mikeolaski.com"},
  {"fullName":"Dr. Nima Rahmany","email":"rehabit+dr+nima@mikeolaski.com"},
  {"fullName":"Nathan Oxenfeld","email":"rehabit+nathan+oxenfeld@mikeolaski.com"},
  {"fullName":"Noah Allen","email":"rehabit+noah+allen@mikeolaski.com"},
  {"fullName":"Josh Hudson","email":"rehabit+josh+hudson@mikeolaski.com"},
  {"fullName":"Sarah Rosensweet","email":"rehabit+sarah+rosensweet@mikeolaski.com"},
  {"fullName":"Chris Blundell","email":"rehabit+chris+blundell@mikeolaski.com"},
  {"fullName":"Trevor Turnbull","email":"rehabit+trevor+turnbull@mikeolaski.com"},
  {"fullName":"Brent May","email":"rehabit+brent+may@mikeolaski.com"},
  {"fullName":"Stacy Thomas","email":"rehabit+stacy+thomas@mikeolaski.com"},
  {"fullName":"Chris Hemingway","email":"rehabit+chris+hemingway@mikeolaski.com"},
  {"fullName":"Kasper Larsen","email":"rehabit+kasper+larsen@mikeolaski.com"},
  {"fullName":"Melissa Metrano","email":"rehabit+melissa+metrano@mikeolaski.com"},
  {"fullName":"Jovanka Ciares","email":"rehabit+jovanka+ciares@mikeolaski.com"},
  {"fullName":"Carolin von Breitenbuch","email":"rehabit+carolin+von@mikeolaski.com"},
  {"fullName":"Dale Shover","email":"rehabit+dale+shover@mikeolaski.com"},
  {"fullName":"Cath Gonzalez","email":"rehabit+cath+gonzalez@mikeolaski.com"},
  {"fullName":"Brenda Turner","email":"rehabit+brenda+turner@mikeolaski.com"},
  {"fullName":"Heidi Priebe","email":"rehabit+heidi+priebe@mikeolaski.com"},
  {"fullName":"Grace Smith","email":"rehabit+grace+smith@mikeolaski.com"},
  {"fullName":"Marisa Murgatroyd","email":"rehabit+marisa+murgatroyd@mikeolaski.com"},
  {"fullName":"Geoffrey Setiawan","email":"rehabit+geoffrey+setiawan@mikeolaski.com"},
  {"fullName":"Dan Buglio","email":"rehabit+dan+buglio@mikeolaski.com"},
  {"fullName":"Quazi Johir","email":"rehabit+quazi+johir@mikeolaski.com"},
  {"fullName":"Shaan Kassam","email":"rehabit+shaan+kassam@mikeolaski.com"},
  {"fullName":"David Deida","email":"rehabit+david+deida@mikeolaski.com"},
  {"fullName":"Robert Glover","email":"rehabit+robert+glover@mikeolaski.com"},
  {"fullName":"Max Kramer","email":"rehabit+max+kramer@mikeolaski.com"},
  {"fullName":"Brian Scott","email":"rehabit+brian+scott@mikeolaski.com"},
  {"fullName":"Sunny Lenarduzzi","email":"rehabit+sunny+lenarduzzi@mikeolaski.com"},
  {"fullName":"Mary Morrissey","email":"rehabit+mary+morrissey@mikeolaski.com"},
  {"fullName":"Natalie Ledwell","email":"rehabit+natalie+ledwell@mikeolaski.com"},
  {"fullName":"Nicole Lapera","email":"rehabit+nicole+lapera@mikeolaski.com"},
  {"fullName":"Regan Hillyer","email":"rehabit+regan+hillyer@mikeolaski.com"},
  {"fullName":"Dr. Shefali Tsabary","email":"rehabit+dr+shefali@mikeolaski.com"},
  {"fullName":"Joshua Tongol","email":"rehabit+joshua+tongol@mikeolaski.com"},
  {"fullName":"Thais Gibson","email":"rehabit+thais+gibson@mikeolaski.com"},
  {"fullName":"Nick Saerev","email":"rehabit+nick+saerev@mikeolaski.com"},
  {"fullName":"Joe Dispenza","email":"rehabit+joe+dispenza@mikeolaski.com"},
  {"fullName":"Bob Proctor","email":"rehabit+bob+proctor@mikeolaski.com"},
  {"fullName":"Dan Martell","email":"rehabit+dan+martell@mikeolaski.com"},
  {"fullName":"Becky Kennedy","email":"rehabit+becky+kennedy@mikeolaski.com"},
  {"fullName":"Mark Rober","email":"rehabit+mark+rober@mikeolaski.com"},
  {"fullName":"Sandy Breathe","email":"rehabit+breathe+with@mikeolaski.com"},
  {"fullName":"Brian Tracy","email":"rehabit+brian+tracy@mikeolaski.com"},
  {"fullName":"Joe Beam","email":"rehabit+joe+beam@mikeolaski.com"},
  {"fullName":"John Gottman","email":"rehabit+john+gottman@mikeolaski.com"},
  {"fullName":"John Griffin","email":"rehabit+john+griffin@mikeolaski.com"},
  {"fullName":"Jessica Connor","email":"rehabit+jessica+connor@mikeolaski.com"},
  {"fullName":"Liam Evans","email":"rehabit+liam+evans@mikeolaski.com"},
  {"fullName":"Rekha Tak Magon","email":"rehabit+rekha+tak@mikeolaski.com"},
  {"fullName":"Ken Honda","email":"rehabit+ken+honda@mikeolaski.com"},
  {"fullName":"Alan Watts","email":"rehabit+alan+watts@mikeolaski.com"},
  {"fullName":"Lee Davy","email":"rehabit+lee+davy@mikeolaski.com"},
  {"fullName":"Dennis Simsek","email":"rehabit+dennis+simsek@mikeolaski.com"},
  {"fullName":"Oliver Cowlishaw","email":"rehabit+oliver+cowlishaw@mikeolaski.com"},
  {"fullName":"Hasan Khan","email":"rehabit+hasan+khan@mikeolaski.com"},
  {"fullName":"Jessica Knight","email":"rehabit+jessica+knight@mikeolaski.com"},
  {"fullName":"Oscar Patel","email":"rehabit+oscar+patel@mikeolaski.com"},
  {"fullName":"Lisa Romano","email":"rehabit+lisa+romano@mikeolaski.com"},
  {"fullName":"Karyn Seitz","email":"rehabit+karyn+seitz@mikeolaski.com"},
  {"fullName":"Christine Jewell","email":"rehabit+christine+jewell@mikeolaski.com"},
  {"fullName":"Tim Fletcher","email":"rehabit+tim+fletcher@mikeolaski.com"},
  {"fullName":"Adam Lane Smith","email":"rehabit+adam+lane@mikeolaski.com"},
  {"fullName":"Rick Reynolds","email":"rehabit+rick+reynolds@mikeolaski.com"},
  {"fullName":"Steve Horsmon","email":"rehabit+steve+horsmon@mikeolaski.com"},
  {"fullName":"Kim Foster","email":"rehabit+kim+foster@mikeolaski.com"},
  {"fullName":"Felix Harter","email":"rehabit+felix+harter@mikeolaski.com"},
  {"fullName":"Rob Dial","email":"rehabit+rob+dial@mikeolaski.com"},
  {"fullName":"Doug Bopst","email":"rehabit+doug+bopst@mikeolaski.com"},
  {"fullName":"Bobby Rio","email":"rehabit+bobby+rio@mikeolaski.com"},
  {"fullName":"Leon Hendrix","email":"rehabit+leon+hendrix@mikeolaski.com"},
  {"fullName":"David McEwen","email":"rehabit+david+mcewen@mikeolaski.com"},
  {"fullName":"Ashley Lima","email":"rehabit+ashley+lima@mikeolaski.com"},
  {"fullName":"Laurin Ponce","email":"rehabit+laurin+ponce@mikeolaski.com"},
  {"fullName":"Nichole Sachs","email":"rehabit+nichole+sachs@mikeolaski.com"},
  {"fullName":"Melissa Adams","email":"rehabit+melissa+adams@mikeolaski.com"},
  {"fullName":"Jessica Morgan","email":"rehabit+jessica+morgan@mikeolaski.com"},
  {"fullName":"Josiah Brandt","email":"rehabit+josiah+brandt@mikeolaski.com"},
  {"fullName":"Karl Moore","email":"rehabit+karl+moore@mikeolaski.com"},
  {"fullName":"Dan Koe","email":"rehabit+dan+koe@mikeolaski.com"},
  {"fullName":"Jefferson Fisher","email":"rehabit+jefferson+fisher@mikeolaski.com"},
  {"fullName":"David Bayer","email":"rehabit+david+bayer@mikeolaski.com"},
  {"fullName":"Andre Duqum","email":"rehabit+andre+duqum@mikeolaski.com"},
  {"fullName":"Lubo Dzubak","email":"rehabit+lubo+dzubak@mikeolaski.com"},
  {"fullName":"Michael Elliot","email":"rehabit+michael+elliot@mikeolaski.com"},
  {"fullName":"Mark Romero","email":"rehabit+mark+romero@mikeolaski.com"},
  {"fullName":"Irene Lyon","email":"rehabit+irene+lyon@mikeolaski.com"},
  {"fullName":"Cassandra Bodzak","email":"rehabit+cassandra+bodzak@mikeolaski.com"},
  {"fullName":"Sahara Rose","email":"rehabit+sahara+rose@mikeolaski.com"},
  {"fullName":"Darcy Murphy","email":"rehabit+darcy+murphy@mikeolaski.com"},
  {"fullName":"Peter Crone","email":"rehabit+peter+crone@mikeolaski.com"},
  {"fullName":"Jillian Turecki","email":"rehabit+jillian+turecki@mikeolaski.com"}
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

    const results = [];
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

    for (let i = 0; i < coaches.length; i++) {
      const coach = coaches[i];
      
      try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: coach.email,
          password: `TempPass123!${i}`,
          email_confirm: true,
          user_metadata: { full_name: coach.fullName }
        });

        if (authError) throw authError;

        const userId = authData.user.id;
        const randomAvatar = avatarUrls[i % avatarUrls.length];

        await supabaseAdmin
          .from("profiles")
          .update({
            full_name: coach.fullName,
            email: coach.email,
            avatar_url: randomAvatar
          })
          .eq("id", userId);

        await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: userId, role: "coach" });

        const randomSpec = specializations[i % specializations.length];
        const randomPersonality = personalities[i % personalities.length];
        const randomExpertise = expertiseSets[i % expertiseSets.length];
        const randomRate = 75 + (i % 9) * 25;
        const randomRating = 4.2 + (i % 9) * 0.1;
        const randomSessions = 10 + (i % 50) * 10;

        const bio = `Experienced ${randomSpec.toLowerCase()} coach dedicated to helping clients achieve meaningful transformation. With a ${randomPersonality.toLowerCase()} approach, ${coach.fullName} specializes in ${randomExpertise.slice(0, 2).join(' and ')}. ${coach.fullName.split(' ')[0]} has helped numerous clients overcome challenges and reach their personal and professional goals.`;

        await supabaseAdmin
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
            is_verified: true,
            is_claimed: false
          });

        results.push({ name: coach.fullName, success: true });
      } catch (error: any) {
        results.push({ name: coach.fullName, success: false, error: error.message });
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
