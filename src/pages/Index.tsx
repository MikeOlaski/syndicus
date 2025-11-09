import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import CoachDirectory from "@/components/CoachDirectory";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        const roles = (rolesData ?? []).map((r: any) => r.role);
        const role = roles.includes("admin")
          ? "admin"
          : roles.includes("coach")
          ? "coach"
          : roles.includes("subscriber")
          ? "subscriber"
          : null;

        if (role === "admin") {
          navigate("/admin-dashboard");
        } else if (role === "coach") {
          navigate("/coach-dashboard");
        } else if (role === "subscriber") {
          navigate("/subscriber-dashboard");
        }
      }
    };

    checkUserAndRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Stats />
      <CoachDirectory />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
