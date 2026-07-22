import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, MessageSquare, Calendar, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface Subscriber {
  id: string;
  subscriber_id: string;
  started_at: string;
  expires_at: string | null;
  status: string;
  profile: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  conversations_count: number;
  last_conversation: string | null;
}

const CoachSubscribers = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalConversations: 0,
    avgConversations: 0
  });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch subscriptions first
      const { data: subscriptionsData, error: subsError } = await supabase
        .from("subscriptions")
        .select("id, subscriber_id, started_at, expires_at, status")
        .eq("coach_id", user.id)
        .order("started_at", { ascending: false });

      if (subsError) throw subsError;

      if (!subscriptionsData || subscriptionsData.length === 0) {
        setSubscribers([]);
        setStats({ total: 0, active: 0, totalConversations: 0, avgConversations: 0 });
        return;
      }

      // Fetch profiles for all subscribers
      const subscriberIds = subscriptionsData.map(s => s.subscriber_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", subscriberIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles by id
      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p])
      );

      // Fetch conversation counts for each subscriber
      const conversationCounts = await Promise.all(
        subscriberIds.map(async (subscriberId) => {
          const { data: convData } = await supabase
            .from("conversations")
            .select("id, last_message_at")
            .eq("coach_id", user.id)
            .order("last_message_at", { ascending: false })
            .limit(1);

          return {
            subscriber_id: subscriberId,
            count: convData?.length || 0,
            last_conversation: convData?.[0]?.last_message_at || null
          };
        })
      );

      // Combine data
      const enrichedSubscribers: Subscriber[] = subscriptionsData.map(sub => {
        const profile = profilesMap.get(sub.subscriber_id);
        const convData = conversationCounts.find(c => c.subscriber_id === sub.subscriber_id);
        return {
          id: sub.id,
          subscriber_id: sub.subscriber_id,
          started_at: sub.started_at,
          expires_at: sub.expires_at,
          status: sub.status,
          profile: profile || { full_name: null, email: "Unknown", avatar_url: null },
          conversations_count: convData?.count || 0,
          last_conversation: convData?.last_conversation || null
        };
      });

      setSubscribers(enrichedSubscribers);

      // Calculate stats
      const activeCount = enrichedSubscribers.filter(s => s.status === "active").length;
      const totalConvs = enrichedSubscribers.reduce((sum, s) => sum + s.conversations_count, 0);
      
      setStats({
        total: enrichedSubscribers.length,
        active: activeCount,
        totalConversations: totalConvs,
        avgConversations: enrichedSubscribers.length > 0 ? totalConvs / enrichedSubscribers.length : 0
      });

    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast({
        title: "Error",
        description: "Failed to load subscribers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const query = searchQuery.toLowerCase();
    return (
      sub.profile.full_name?.toLowerCase().includes(query) ||
      sub.profile.email.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <DashboardLayout requiredRole="coach">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="coach">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Subscribers</h1>
          <p className="text-muted-foreground">
            Manage and track your subscriber relationships.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Conversations</p>
                <p className="text-2xl font-bold">{stats.totalConversations}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Conversations</p>
                <p className="text-2xl font-bold">{stats.avgConversations.toFixed(1)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Subscribers Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subscriber</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-center">Conversations</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No subscribers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {subscriber.profile.full_name?.[0] || subscriber.profile.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{subscriber.profile.full_name || "Unnamed"}</p>
                          <p className="text-sm text-muted-foreground">{subscriber.profile.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subscriber.status === "active" ? "default" : "secondary"}>
                        {subscriber.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(subscriber.started_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {subscriber.expires_at 
                        ? format(new Date(subscriber.expires_at), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{subscriber.conversations_count}</Badge>
                    </TableCell>
                    <TableCell>
                      {subscriber.last_conversation
                        ? format(new Date(subscriber.last_conversation), "MMM d, yyyy")
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CoachSubscribers;
