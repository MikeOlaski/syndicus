import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Crown, Zap, ArrowRight, Sparkles } from "lucide-react";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

const SubscriberDashboard = () => {
  const navigate = useNavigate();
  const { status, isLoading } = useSubscriptionLimits();

  return (
    <DashboardLayout requiredRole="subscriber">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscriber Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your subscription overview.
          </p>
        </div>

        {/* Plan Banner */}
        {status?.tier === "free" && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">You're on the Free plan</p>
                  <p className="text-sm text-muted-foreground">
                    {status.limits.max_coaches} coaches • {status.limits.daily_messages} messages/day • Text only
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => navigate("/pricing")}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coach Subscriptions</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : `${status?.activeSubscriptions || 0}/${status?.limits.max_coaches || 3}`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily Messages</p>
                <p className="text-2xl font-bold">{status?.limits.daily_messages || 5}/day</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Syndic8 Groups</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : `${status?.syndic8Groups || 0}/${status?.limits.max_syndic8_groups || 1}`}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/subscriber-dashboard/coaches")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">My Coaches</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your coach subscriptions
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/directory")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">Discover Coaches</h3>
                  <p className="text-sm text-muted-foreground">
                    Find new coaches to subscribe to
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Tier Comparison */}
        {status?.tier === "free" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upgrade Your Plan</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <Badge variant="secondary" className="mb-2">Free</Badge>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 3 coach subscriptions</li>
                  <li>• 5 messages/day per coach</li>
                  <li>• 1 Syndic8 group (2 coaches)</li>
                  <li>• Text only</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg border-primary/50 bg-primary/5">
                <Badge className="mb-2">Plus</Badge>
                <ul className="space-y-2 text-sm">
                  <li>• 10 coach subscriptions</li>
                  <li>• 50 messages/day per coach</li>
                  <li>• 3 Syndic8 groups (8 coaches)</li>
                  <li>• Text only</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg border-yellow-500/50 bg-yellow-500/5">
                <Badge variant="outline" className="mb-2 border-yellow-500 text-yellow-600">Prime</Badge>
                <ul className="space-y-2 text-sm">
                  <li>• Unlimited coaches</li>
                  <li>• Unlimited messages</li>
                  <li>• 10 Syndic8 groups (8 coaches)</li>
                  <li>• All modalities</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubscriberDashboard;
