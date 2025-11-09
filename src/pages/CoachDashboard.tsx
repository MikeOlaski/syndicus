import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Star, Users, DollarSign, TrendingUp, BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";

const CoachDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscriptions: 0,
    totalEarnings: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user is a coach
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isCoach = roles?.some(r => r.role === "coach");
      
      if (!isCoach) {
        toast({
          title: "Access denied",
          description: "You must be a coach to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Load coach profile
      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setProfile(coachProfile);

      // Load subscribers
      const { data: subs } = await supabase
        .from("subscriptions")
        .select(`
          *,
          subscriber:subscriber_id (
            full_name,
            email
          )
        `)
        .eq("coach_id", coachProfile?.id)
        .order("created_at", { ascending: false });

      setSubscribers(subs || []);

      // Calculate stats
      const activeSubs = subs?.filter(s => s.status === "active") || [];
      setStats({
        totalSubscribers: subs?.length || 0,
        activeSubscriptions: activeSubs.length,
        totalEarnings: activeSubs.length * (coachProfile?.hourly_rate || 0),
      });
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-secondary/5 to-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Coach Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your digital twin and track your performance
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Subscribers</p>
                  <p className="text-2xl font-bold">{stats.totalSubscribers}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. Monthly Earnings</p>
                  <p className="text-2xl font-bold">${stats.totalEarnings}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{profile?.total_sessions || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Your Digital Twin</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Verification Status</p>
                      <p className="font-medium">
                        {profile?.is_verified ? "Verified" : "Pending Verification"}
                      </p>
                    </div>
                    <Badge variant={profile?.is_verified ? "default" : "secondary"}>
                      {profile?.is_verified ? "Active" : "Pending"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <p className="text-sm text-muted-foreground">Rating</p>
                      </div>
                      <p className="text-2xl font-bold">{profile?.rating || "N/A"}</p>
                    </div>
                    
                    <div className="p-4 bg-secondary/5 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Hourly Rate</p>
                      <p className="text-2xl font-bold">${profile?.hourly_rate || 0}</p>
                    </div>
                  </div>

                  {profile?.expertise && profile.expertise.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Expertise</p>
                      <div className="flex gap-2 flex-wrap">
                        {profile.expertise.map((exp: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{exp}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Recent Subscribers</h2>
                {subscribers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No subscribers yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {subscribers.slice(0, 5).map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{sub.subscriber?.full_name || "Subscriber"}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sub.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                          {sub.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    Edit Profile
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    Configure Digital Twin
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    View All Subscribers
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    Analytics & Insights
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    Settings
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Performance Tips</h2>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• Keep your profile updated with latest expertise</p>
                  <p>• Respond promptly to subscriber inquiries</p>
                  <p>• Maintain high-quality digital twin interactions</p>
                  <p>• Update your availability regularly</p>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default CoachDashboard;
