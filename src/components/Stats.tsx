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
        // Fetch active (verified) coaches count
        const { count: coachCount, error: coachError } = await supabase
          .from("coach_profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_verified", true);

        if (coachError) throw coachError;

        // Fetch total sessions from coach_sessions table (real-time accurate)
        const { count: sessionCount, error: sessionError } = await supabase
          .from("coach_sessions")
          .select("*", { count: "exact", head: true });

        if (sessionError) throw sessionError;

        // Fetch Syndic8 groups count
        const { count: syndic8Count, error: syndic8Error } = await supabase
          .from("syndic8_groups")
          .select("*", { count: "exact", head: true });

        if (syndic8Error) throw syndic8Error;

        setStats({
          activeCoaches: coachCount || 0,
          totalSessions: sessionCount || 0,
          activeSyndic8s: syndic8Count || 0,
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
