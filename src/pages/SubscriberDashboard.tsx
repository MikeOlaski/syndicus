import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Star, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";

const SubscriberDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

      // Check if user is a subscriber
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isSubscriber = roles?.some(r => r.role === "subscriber");
      
      if (!isSubscriber) {
        toast({
          title: "Access denied",
          description: "You must be a subscriber to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Load profile
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(userProfile);

      // Load subscriptions with coach details
      const { data: subs } = await supabase
        .from("subscriptions")
        .select(`
          *,
          coach:coach_id (
            id,
            user_id,
            hourly_rate,
            rating,
            total_sessions,
            expertise,
            user:user_id (
              full_name,
              avatar_url
            )
          )
        `)
        .eq("subscriber_id", user.id)
        .order("created_at", { ascending: false });

      setSubscriptions(subs || []);
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", subscriptionId);

      if (error) throw error;

      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled successfully.",
      });

      checkAuth(); // Reload data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeSubscriptions = subscriptions.filter(s => s.status === "active");
  const totalSpent = subscriptions.reduce((acc, sub) => acc + (sub.coach?.hourly_rate || 0), 0);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Subscriber Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || "Subscriber"}
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                  <p className="text-2xl font-bold">{subscriptions.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-2xl font-bold">${totalSpent.toFixed(0)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold">
                    {activeSubscriptions.length > 0
                      ? (activeSubscriptions.reduce((acc, s) => acc + (s.coach?.rating || 0), 0) / activeSubscriptions.length).toFixed(1)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Active Subscriptions */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Active Subscriptions</h2>
                {activeSubscriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No active subscriptions</p>
                    <Button onClick={() => navigate("/coaches")}>
                      Browse Coaches
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeSubscriptions.map((sub) => (
                      <Card key={sub.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {sub.coach?.user?.full_name?.[0] || "C"}
                            </div>
                            <div>
                              <h3 className="font-semibold">{sub.coach?.user?.full_name || "Coach"}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{sub.coach?.rating || "N/A"}</span>
                                <span>•</span>
                                <span>{sub.coach?.total_sessions || 0} sessions</span>
                              </div>
                              {sub.coach?.expertise && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {sub.coach.expertise.slice(0, 3).map((exp: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {exp}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => navigate(`/coach/${sub.coach?.user_id}/chat`)}
                              size="sm"
                            >
                              Chat
                            </Button>
                            <Button
                              onClick={() => handleCancelSubscription(sub.id)}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>

              {/* Subscription History */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Subscription History</h2>
                <div className="space-y-3">
                  {subscriptions.slice(0, 5).map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{sub.coach?.user?.full_name || "Coach"}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sub.started_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                        {sub.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar - Profile & Quick Actions */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Your Profile</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                      {profile?.full_name?.[0] || "S"}
                    </div>
                    <div>
                      <p className="font-semibold">{profile?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    Edit Profile
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate("/coaches")}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Browse Coaches
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate("/how-it-works")}
                  >
                    How It Works
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate("/pricing")}
                  >
                    View Pricing
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate("/help")}
                  >
                    Get Help
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default SubscriberDashboard;