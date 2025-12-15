import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Search, 
  MessageCircle, 
  Star,
  UserMinus,
  Loader2,
  Plus,
  Crown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

interface SubscribedCoach {
  id: string;
  coach_id: string;
  coach_name: string;
  coach_avatar: string | null;
  coach_specialization: string | null;
  coach_slug: string;
  subscribed_at: string;
}

const SubscriberCoaches = () => {
  const [coaches, setCoaches] = useState<SubscribedCoach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [unsubscribing, setUnsubscribing] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { status, unsubscribeFromCoach, refetch } = useSubscriptionLimits();

  useEffect(() => {
    fetchSubscribedCoaches();
  }, []);

  const fetchSubscribedCoaches = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          id,
          coach_id,
          created_at
        `)
        .eq("subscriber_id", session.user.id)
        .eq("status", "active");

      if (error) throw error;

      // Fetch coach details for each subscription
      const coachesWithDetails = await Promise.all(
        (data || []).map(async (sub) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", sub.coach_id)
            .single();

          const { data: coachProfile } = await supabase
            .from("coach_profiles")
            .select("specialization, slug")
            .eq("user_id", sub.coach_id)
            .single();

          return {
            id: sub.id,
            coach_id: sub.coach_id,
            coach_name: profile?.full_name || "Unknown Coach",
            coach_avatar: profile?.avatar_url,
            coach_specialization: coachProfile?.specialization,
            coach_slug: coachProfile?.slug || sub.coach_id,
            subscribed_at: sub.created_at,
          };
        })
      );

      setCoaches(coachesWithDetails);
    } catch (error: any) {
      toast({
        title: "Error loading coaches",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async (coachId: string) => {
    setUnsubscribing(coachId);
    const success = await unsubscribeFromCoach(coachId);
    if (success) {
      setCoaches(prev => prev.filter(c => c.coach_id !== coachId));
    }
    setUnsubscribing(null);
  };

  const filteredCoaches = coaches.filter(coach =>
    coach.coach_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coach.coach_specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout requiredRole="subscriber">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Coaches</h1>
              <p className="text-muted-foreground">
                Manage your coach subscriptions
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/directory")}>
            <Plus className="w-4 h-4 mr-2" />
            Find Coaches
          </Button>
        </div>

        {/* Subscription Status */}
        {status && (
          <Card className="p-4 mb-6 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant={status.tier === "free" ? "secondary" : "default"} className="capitalize">
                  {status.tier === "free" ? "Free" : status.tier} Plan
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {status.activeSubscriptions} of {status.limits.max_coaches} coach subscriptions used
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{status.limits.daily_messages} messages/day</span>
                {status.tier === "free" && (
                  <Button size="sm" variant="outline" onClick={() => navigate("/pricing")}>
                    <Crown className="w-4 h-4 mr-1" />
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search your coaches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Coaches Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredCoaches.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No coaches yet</h3>
            <p className="text-muted-foreground mb-4">
              Subscribe to coaches to start chatting with their AI twins
            </p>
            <Button onClick={() => navigate("/directory")}>
              Browse Coaches
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCoaches.map((coach) => (
              <Card key={coach.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={coach.coach_avatar || undefined} />
                    <AvatarFallback>
                      {coach.coach_name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{coach.coach_name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {coach.coach_specialization || "Coach"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Subscribed {new Date(coach.subscribed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/${coach.coach_slug}`)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnsubscribe(coach.coach_id)}
                    disabled={unsubscribing === coach.coach_id}
                  >
                    {unsubscribing === coach.coach_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserMinus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubscriberCoaches;
