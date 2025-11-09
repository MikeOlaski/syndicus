import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const CoachDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
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
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/5 to-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Coach Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 max-w-4xl">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Your Digital Twin</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">
                  {profile?.is_verified ? "Verified ✓" : "Pending Verification"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="font-medium">{profile?.rating || "No ratings yet"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="font-medium">{profile?.total_sessions || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid gap-3">
              <Button className="w-full justify-start" variant="outline">
                Edit Profile
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Configure Digital Twin
              </Button>
              <Button className="w-full justify-start" variant="outline">
                View Subscribers
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Analytics & Insights
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CoachDashboard;
