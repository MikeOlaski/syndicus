import { Users, MessageSquare, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StatsData {
  activeCoaches: number;
  totalSessions: number;
  activeSyndic8s: number;
}

const Stats = () => {
  const [stats, setStats] = useState<StatsData>({
    activeCoaches: 0,
    totalSessions: 0,
    activeSyndic8s: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch active (verified) coaches count - uses existing RLS policy
        const { count: coachCount, error: coachError } = await supabase
          .from("coach_profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_verified", true)
          .eq("show_on_homepage", true);

        if (coachError) {
          console.error("Coach count error:", coachError);
        }

        // Use security definer function to count sessions
        const { data: sessionData, error: sessionError } = await supabase
          .rpc("count_coach_sessions");

        if (sessionError) {
          console.error("Session count error:", sessionError);
        }

        // Use security definer function to count syndic8 groups
        const { data: syndic8Data, error: syndic8Error } = await supabase
          .rpc("count_syndic8_groups");

        if (syndic8Error) {
          console.error("Syndic8 count error:", syndic8Error);
        }

        setStats({
          activeCoaches: coachCount || 0,
          totalSessions: Number(sessionData) || 0,
          activeSyndic8s: Number(syndic8Data) || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K+";
    }
    return num.toString();
  };

  const statsConfig = [
    {
      icon: Users,
      value: formatNumber(stats.activeCoaches),
      label: "Active Coaches",
    },
    {
      icon: MessageSquare,
      value: formatNumber(stats.totalSessions),
      label: "Client Sessions",
    },
    {
      icon: Layers,
      value: formatNumber(stats.activeSyndic8s),
      label: "Active Syndic8s",
    },
  ];

  return (
    <section className="py-24 px-4 bg-secondary/30 border-y border-border/50 relative overflow-hidden">
      {/* Subtle background pattern/glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.05),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(var(--primary-rgb),0.03),transparent_40%)] pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-center items-center">
          {statsConfig.map((stat, index) => (
            <div key={index} className="flex flex-col items-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-primary mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/20 transform group-hover:scale-110 transition-transform duration-500">
                <stat.icon className="w-10 h-10 text-white" />
              </div>
              <div className="text-5xl md:text-6xl font-extrabold tracking-tight mb-3 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
