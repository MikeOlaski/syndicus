import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Users, Calendar, Crown } from "lucide-react";

const SubscriberDashboard = () => {
  return (
    <DashboardLayout requiredRole="subscriber">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscriber Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your subscription overview.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">$0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Welcome Message */}
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Welcome to Your Dashboard</h2>
          <p className="text-muted-foreground mb-4">
            Use the sidebar to navigate and explore your AI assistant chat.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SubscriberDashboard;
