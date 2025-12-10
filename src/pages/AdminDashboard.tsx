import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Users, Briefcase, CheckCircle, LayoutDashboard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCoaches: 0,
    verifiedCoaches: 0,
    totalSubscribers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch coaches count
      const { data: coaches } = await supabase
        .from("coach_profiles")
        .select("is_verified");

      // Fetch subscribers count
      const { data: subscribers } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "subscriber");

      setStats({
        totalCoaches: coaches?.length || 0,
        verifiedCoaches: coaches?.filter((c) => c.is_verified).length || 0,
        totalSubscribers: subscribers?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage coaches and subscribers across the platform
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Coaches</p>
                <p className="text-2xl font-bold">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalCoaches}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verified Coaches</p>
                <p className="text-2xl font-bold">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.verifiedCoaches}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalSubscribers}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Welcome Message */}
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Welcome to Admin Dashboard</h2>
          <p className="text-muted-foreground mb-4">
            Use the sidebar to navigate and access the system chat for administration tasks.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;