import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { MessageSquare, Clock, User, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Session {
  id: string;
  coach_id: string;
  subscriber_id: string | null;
  guest_session_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  message_count: number;
  session_type: string;
  created_at: string;
  subscriber?: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

const Conversations = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    totalMessages: 0,
    avgDuration: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the coach's profile ID
      const { data: coachProfile, error: profileError } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!coachProfile) {
        setIsLoading(false);
        return;
      }

      // Fetch sessions for this coach
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("coach_sessions")
        .select("*")
        .eq("coach_id", coachProfile.id)
        .order("started_at", { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get subscriber details for sessions with subscriber_id
      const subscriberIds = sessionsData
        ?.filter(s => s.subscriber_id)
        .map(s => s.subscriber_id) || [];

      let subscriberMap: Record<string, any> = {};
      if (subscriberIds.length > 0) {
        const { data: subscribers } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", subscriberIds);

        if (subscribers) {
          subscriberMap = subscribers.reduce((acc, sub) => {
            acc[sub.id] = sub;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      // Enrich sessions with subscriber data
      const enrichedSessions = (sessionsData || []).map(session => ({
        ...session,
        subscriber: session.subscriber_id ? subscriberMap[session.subscriber_id] : null,
      }));

      setSessions(enrichedSessions);

      // Calculate stats
      const totalSessions = enrichedSessions.length;
      const activeSessions = enrichedSessions.filter(s => !s.ended_at).length;
      const totalMessages = enrichedSessions.reduce((sum, s) => sum + (s.message_count || 0), 0);
      const completedSessions = enrichedSessions.filter(s => s.duration_seconds);
      const avgDuration = completedSessions.length > 0
        ? Math.round(completedSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / completedSessions.length)
        : 0;

      setStats({
        totalSessions,
        activeSessions,
        totalMessages,
        avgDuration,
      });
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "In progress";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const getSessionTitle = (session: Session): string => {
    if (session.subscriber?.full_name) {
      return session.subscriber.full_name;
    }
    if (session.subscriber?.email) {
      return session.subscriber.email;
    }
    if (session.guest_session_id) {
      return `Guest (${session.guest_session_id.slice(0, 8)}...)`;
    }
    return "Anonymous Session";
  };

  return (
    <DashboardLayout requiredRole="coach">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Sessions</h1>
          <p className="text-muted-foreground">
            View your digital twin's session history with subscribers and guests
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">{stats.activeSessions}</div>
              <p className="text-xs text-muted-foreground">Active Now</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
              <p className="text-xs text-muted-foreground">Total Messages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</div>
              <p className="text-xs text-muted-foreground">Avg Duration</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sessions List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                All Sessions
              </CardTitle>
              <CardDescription>
                {sessions.length} session{sessions.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-28rem)]">
                {isLoading ? (
                  <div className="p-6 text-center text-muted-foreground">
                    Loading sessions...
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No sessions yet</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Sessions will appear here when users chat with your Digital Twin
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                          selectedSession?.id === session.id
                            ? "bg-accent border-primary"
                            : "hover:bg-accent/50 border-transparent"
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {session.subscriber_id ? (
                                <User className="w-4 h-4 text-primary" />
                              ) : (
                                <Users className="w-4 h-4 text-muted-foreground" />
                              )}
                              <h3 className="font-medium truncate">
                                {getSessionTitle(session)}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(session.started_at), {
                                  addSuffix: true,
                                })}
                              </p>
                              {!session.ended_at && (
                                <Badge variant="secondary" className="text-xs">Active</Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">
                              {session.message_count} msgs
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Session Details View */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>
                {selectedSession
                  ? `Session with ${getSessionTitle(selectedSession)}`
                  : "Select a session to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSession ? (
                <div className="space-y-6">
                  {/* Session Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Started</p>
                      <p className="font-medium">
                        {format(new Date(selectedSession.started_at), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant={selectedSession.ended_at ? "secondary" : "default"}>
                        {selectedSession.ended_at ? "Completed" : "Active"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium">{formatDuration(selectedSession.duration_seconds)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Messages</p>
                      <p className="font-medium">{selectedSession.message_count}</p>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">User Information</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        {selectedSession.subscriber?.avatar_url ? (
                          <img
                            src={selectedSession.subscriber.avatar_url}
                            alt="User"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{getSessionTitle(selectedSession)}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedSession.subscriber_id ? "Registered User" : "Guest User"}
                        </p>
                        {selectedSession.subscriber?.email && (
                          <p className="text-xs text-muted-foreground">
                            {selectedSession.subscriber.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Session Type */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Session Type</h4>
                    <Badge>{selectedSession.session_type}</Badge>
                  </div>

                  {selectedSession.ended_at && (
                    <div className="border-t pt-4">
                      <p className="text-xs text-muted-foreground">Ended</p>
                      <p className="font-medium">
                        {format(new Date(selectedSession.ended_at), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a session to view details</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Conversations;
