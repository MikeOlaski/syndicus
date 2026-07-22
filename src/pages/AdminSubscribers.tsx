import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  LayoutGrid,
  Table as TableIcon,
  UserCheck,
  MessageSquare,
  Calendar,
  Eye,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Subscriber {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  subscriptions_count: number;
  active_subscriptions: number;
  last_activity: string | null;
}

const AdminSubscribers = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalSubscriptions: 0,
    newThisMonth: 0,
  });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      // Get all users with subscriber role
      const { data: subscriberRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "subscriber");

      if (rolesError) throw rolesError;

      const subscriberIds = subscriberRoles?.map((r) => r.user_id) || [];

      if (subscriberIds.length === 0) {
        setSubscribers([]);
        setLoading(false);
        return;
      }

      // Get profiles for these subscribers
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", subscriberIds);

      if (profilesError) throw profilesError;

      // Get subscription counts for each subscriber
      const { data: subscriptions, error: subsError } = await supabase
        .from("subscriptions")
        .select("subscriber_id, status");

      if (subsError) throw subsError;

      // Calculate stats per subscriber
      const subscriberData: Subscriber[] = (profiles || []).map((profile) => {
        const userSubs =
          subscriptions?.filter((s) => s.subscriber_id === profile.id) || [];
        const activeSubs = userSubs.filter((s) => s.status === "active");

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          subscriptions_count: userSubs.length,
          active_subscriptions: activeSubs.length,
          last_activity: profile.updated_at,
        };
      });

      setSubscribers(subscriberData);

      // Calculate overall stats
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      setStats({
        totalSubscribers: subscriberData.length,
        activeSubscribers: subscriberData.filter(
          (s) => s.active_subscriptions > 0
        ).length,
        totalSubscriptions: subscriptions?.length || 0,
        newThisMonth: subscriberData.filter(
          (s) => new Date(s.created_at) >= monthStart
        ).length,
      });
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(
    (subscriber) =>
      subscriber.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscriber.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Manage Subscribers</h1>
              <p className="text-muted-foreground">
                View and manage all platform subscribers
              </p>
            </div>
          </div>

          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) =>
                value && setViewMode(value as "grid" | "table")
              }
              className="border rounded-md"
            >
              <ToggleGroupItem value="grid" aria-label="Grid view" className="px-3">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Table view" className="px-3">
                <TableIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold">{stats.totalSubscribers}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Subscribers</p>
                <p className="text-2xl font-bold">{stats.activeSubscribers}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold">{stats.newThisMonth}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Subscribers List */}
        {filteredSubscribers.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery
                ? "No subscribers found matching your search"
                : "No subscribers registered yet"}
            </p>
          </Card>
        ) : viewMode === "table" ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subscriber</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscriptions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={subscriber.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(subscriber.full_name, subscriber.email)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {subscriber.full_name || "No name"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {subscriber.email}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {subscriber.active_subscriptions}
                        </span>
                        <span className="text-muted-foreground">
                          /{subscriber.subscriptions_count}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            subscriber.active_subscriptions > 0
                              ? "default"
                              : "secondary"
                          }
                        >
                          {subscriber.active_subscriptions > 0 ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(subscriber.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubscribers.map((subscriber) => (
              <Card key={subscriber.id} className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={subscriber.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(subscriber.full_name, subscriber.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">
                        {subscriber.full_name || "No name"}
                      </h3>
                      <Badge
                        variant={
                          subscriber.active_subscriptions > 0
                            ? "default"
                            : "secondary"
                        }
                        className="shrink-0"
                      >
                        {subscriber.active_subscriptions > 0 ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {subscriber.email}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div>
                        <span className="font-medium">
                          {subscriber.active_subscriptions}
                        </span>
                        <span className="text-muted-foreground"> active</span>
                      </div>
                      <div className="text-muted-foreground">
                        Joined {format(new Date(subscriber.created_at), "MMM yyyy")}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-end">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
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

export default AdminSubscribers;