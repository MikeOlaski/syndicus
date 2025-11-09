import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Shield, CheckCircle, XCircle, Search, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/Header";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalCoaches: 0,
    verifiedCoaches: 0,
    totalSubscribers: 0,
    activeSubscriptions: 0,
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

      // Check if user is an admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isAdmin = roles?.some(r => r.role === "admin");
      
      if (!isAdmin) {
        toast({
          title: "Access denied",
          description: "You must be an admin to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      await loadData();
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    // Load all profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    setAllProfiles(profiles || []);

    // Load coaches with profiles
    const { data: coachData } = await supabase
      .from("coach_profiles")
      .select(`
        *,
        user:user_id (
          full_name,
          email,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false });

    setCoaches(coachData || []);

    // Load subscribers (users with subscriber role)
    const { data: subRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "subscriber");

    const subscriberIds = subRoles?.map(r => r.user_id) || [];
    
    const { data: subProfiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", subscriberIds);

    setSubscribers(subProfiles || []);

    // Load subscriptions for stats
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("status");

    // Calculate stats
    setStats({
      totalCoaches: coachData?.length || 0,
      verifiedCoaches: coachData?.filter(c => c.is_verified).length || 0,
      totalSubscribers: subProfiles?.length || 0,
      activeSubscriptions: subs?.filter(s => s.status === "active").length || 0,
    });
  };

  const handleVerifyCoach = async (coachId: string, verify: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("coach_profiles")
        .update({ is_verified: verify })
        .eq("id", coachId);

      if (error) throw error;

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user!.id,
        action_type: verify ? "verify_coach" : "unverify_coach",
        target_user_id: coaches.find(c => c.id === coachId)?.user_id,
        details: { coach_id: coachId },
      });

      toast({
        title: verify ? "Coach verified" : "Coach unverified",
        description: `Coach has been ${verify ? "verified" : "unverified"} successfully.`,
      });

      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update coach status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCoach = async (coachId: string, userId: string) => {
    if (!confirm("Are you sure you want to delete this coach? This action cannot be undone.")) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("coach_profiles")
        .delete()
        .eq("id", coachId);

      if (error) throw error;

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user!.id,
        action_type: "delete_coach",
        target_user_id: userId,
        details: { coach_id: coachId },
      });

      toast({
        title: "Coach deleted",
        description: "Coach profile has been deleted successfully.",
      });

      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete coach.",
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

  const filteredCoaches = coaches.filter(c =>
    c.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubscribers = subscribers.filter(s =>
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-accent/5 to-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage coaches, subscribers, and platform settings</p>
            </div>
            <Badge variant="default" className="px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              Administrator
            </Badge>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Coaches</p>
                  <p className="text-2xl font-bold">{stats.totalCoaches}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verified Coaches</p>
                  <p className="text-2xl font-bold">{stats.verifiedCoaches}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Subscribers</p>
                  <p className="text-2xl font-bold">{stats.totalSubscribers}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="p-6">
            <Tabs defaultValue="coaches">
              <TabsList className="mb-4">
                <TabsTrigger value="coaches">Coaches</TabsTrigger>
                <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
                <TabsTrigger value="all-users">All Users</TabsTrigger>
              </TabsList>

              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Coaches Tab */}
              <TabsContent value="coaches">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Sessions</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCoaches.map((coach) => (
                        <TableRow key={coach.id}>
                          <TableCell className="font-medium">
                            {coach.user?.full_name || "N/A"}
                          </TableCell>
                          <TableCell>{coach.user?.email || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={coach.is_verified ? "default" : "secondary"}>
                              {coach.is_verified ? "Verified" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>{coach.rating || "N/A"}</TableCell>
                          <TableCell>{coach.total_sessions || 0}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {!coach.is_verified ? (
                                <Button
                                  onClick={() => handleVerifyCoach(coach.id, true)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Verify
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleVerifyCoach(coach.id, false)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Unverify
                                </Button>
                              )}
                              <Button
                                onClick={() => handleDeleteCoach(coach.id, coach.user_id)}
                                size="sm"
                                variant="destructive"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Subscribers Tab */}
              <TabsContent value="subscribers">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscribers.map((subscriber) => (
                        <TableRow key={subscriber.id}>
                          <TableCell className="font-medium">
                            {subscriber.full_name || "N/A"}
                          </TableCell>
                          <TableCell>{subscriber.email}</TableCell>
                          <TableCell>
                            {new Date(subscriber.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => navigate(`/subscriber/${subscriber.id}`)}
                              size="sm"
                              variant="outline"
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* All Users Tab */}
              <TabsContent value="all-users">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allProfiles
                        .filter(p =>
                          p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.email?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">
                              {profile.full_name || "N/A"}
                            </TableCell>
                            <TableCell>{profile.email}</TableCell>
                            <TableCell>
                              {new Date(profile.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;