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
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {statsConfig.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold mb-2">
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
