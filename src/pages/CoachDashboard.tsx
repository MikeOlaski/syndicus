import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Users, DollarSign, Star, CheckCircle } from "lucide-react";
import { CoachSyndic8Approvals } from "@/components/CoachSyndic8Approvals";

const CoachDashboard = () => {
  return (
    <DashboardLayout requiredRole="coach">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Coach Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your digital twin and track your performance.
          </p>
        </div>

        {/* Syndic8 Public Visibility Approvals */}
        <CoachSyndic8Approvals />

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-primary" />
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
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Earnings</p>
                <p className="text-2xl font-bold">$0</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold">5.0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Welcome Message */}
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Welcome to Your Coach Dashboard</h2>
          <p className="text-muted-foreground mb-4">
            Use the AI Assistant in the sidebar to help manage your digital twin.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CoachDashboard;
