import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, X, Save, Camera, Upload, ArrowLeft, User, Settings, Bot, 
  MessageSquare, FileText, Users, Globe, Shield, BarChart3, Link2,
  CheckCircle, XCircle, Eye, EyeOff, Clock
} from "lucide-react";
import { CoachChatModal } from "@/components/CoachChatModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow, format } from "date-fns";

interface Coach {
  id: string;
  user_id: string;
  slug: string;
  bio: string | null;
  hourly_rate: number | null;
  is_verified: boolean;
  is_claimed: boolean;
  rating: number;
  total_sessions: number;
  expertise: string[] | null;
  specialization: string | null;
  personality: string | null;
  status: string;
  created_at: string;
  last_activity_at: string;
  webhook_url: string | null;
  show_on_homepage: boolean;
  website_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  profiles: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  subscriber_count?: number;
}

type MenuSection = "profile" | "settings" | "integrations" | "knowledge" | "conversations" | "analytics" | "security";

const STATUS_OPTIONS = [
  { value: "admin_setup", label: "Admin Setup" },
  { value: "coach_claimed", label: "Coach Claimed" },
  { value: "onboarding_started", label: "Onboarding Started" },
  { value: "onboarding_completed", label: "Onboarding Completed" },
  { value: "knowledge_base_setup", label: "Knowledge Base Setup" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const MENU_ITEMS = [
  { id: "profile" as MenuSection, label: "Profile", icon: User, description: "Basic info, avatar, bio" },
  { id: "settings" as MenuSection, label: "Settings", icon: Settings, description: "Status, rates, verification" },
  { id: "integrations" as MenuSection, label: "Integrations", icon: Bot, description: "Webhooks, n8n, external tools" },
  { id: "knowledge" as MenuSection, label: "Knowledge Base", icon: FileText, description: "Digital twin assets" },
  { id: "conversations" as MenuSection, label: "Conversations", icon: MessageSquare, description: "Chat sessions, history" },
  { id: "analytics" as MenuSection, label: "Analytics", icon: BarChart3, description: "Stats, subscribers, sessions" },
  { id: "security" as MenuSection, label: "Security", icon: Shield, description: "Access, permissions, audit" },
];

// Missing features to implement
const MISSING_FEATURES = [
  { section: "Profile", features: ["Phone number", "Location/Timezone", "Languages spoken", "Profile completion percentage"] },
  { section: "Settings", features: ["Custom slug editing", "Auto-response settings", "Availability schedule", "Vacation mode"] },
  { section: "Integrations", features: ["Stripe connect for payments", "Calendar sync (Google/Outlook)", "Zapier integration", "Email notifications config"] },
  { section: "Knowledge Base", features: ["View/manage assets from admin", "RAG status indicator", "Embedding progress", "Content moderation"] },
  { section: "Analytics", features: ["Message analytics", "Response time metrics", "Subscriber growth chart", "Revenue tracking"] },
  { section: "Security", features: ["Password reset for coach", "Session management", "API key management", "Audit log viewer"] },
];

// Conversations Section Component
interface ConversationSession {
  id: string;
  subscriber_id: string | null;
  guest_session_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  message_count: number;
  session_type: string;
  subscriber?: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

const CoachConversationsSection = ({ coachId, coachName }: { coachId: string; coachName: string }) => {
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ConversationSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, messages: 0, avgDuration: 0 });

  useEffect(() => {
    fetchSessions();
  }, [coachId]);

  const fetchSessions = async () => {
    try {
      const { data: sessionsData, error } = await supabase
        .from("coach_sessions")
        .select("*")
        .eq("coach_id", coachId)
        .order("started_at", { ascending: false });

      if (error) throw error;

      const subscriberIds = sessionsData?.filter(s => s.subscriber_id).map(s => s.subscriber_id) || [];
      let subscriberMap: Record<string, any> = {};
      
      if (subscriberIds.length > 0) {
        const { data: subscribers } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", subscriberIds);
        if (subscribers) {
          subscriberMap = subscribers.reduce((acc, sub) => ({ ...acc, [sub.id]: sub }), {});
        }
      }

      const enriched = (sessionsData || []).map(s => ({
        ...s,
        subscriber: s.subscriber_id ? subscriberMap[s.subscriber_id] : null
      }));

      setSessions(enriched);

      const total = enriched.length;
      const active = enriched.filter(s => !s.ended_at).length;
      const messages = enriched.reduce((sum, s) => sum + (s.message_count || 0), 0);
      const completed = enriched.filter(s => s.duration_seconds);
      const avgDuration = completed.length > 0
        ? Math.round(completed.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / completed.length)
        : 0;

      setStats({ total, active, messages, avgDuration });
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "In progress";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins === 0 ? `${secs}s` : `${mins}m ${secs}s`;
  };

  const getSessionTitle = (session: ConversationSession) => {
    if (session.subscriber?.full_name) return session.subscriber.full_name;
    if (session.subscriber?.email) return session.subscriber.email;
    if (session.guest_session_id) return `Guest (${session.guest_session_id.slice(0, 8)}...)`;
    return "Anonymous Session";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversations</CardTitle>
        <CardDescription>Chat sessions with {coachName}'s Digital Twin</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-xl font-bold text-green-500">{stats.active}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-xl font-bold">{stats.messages}</div>
            <div className="text-xs text-muted-foreground">Messages</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-xl font-bold">{formatDuration(stats.avgDuration)}</div>
            <div className="text-xs text-muted-foreground">Avg Duration</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sessions List */}
          <div className="border rounded-lg">
            <div className="p-3 border-b">
              <h4 className="font-medium text-sm">Sessions ({sessions.length})</h4>
            </div>
            <ScrollArea className="h-[300px]">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
              ) : sessions.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No sessions yet</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedSession?.id === session.id ? "bg-accent" : "hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {session.subscriber_id ? (
                            <User className="w-4 h-4 text-primary shrink-0" />
                          ) : (
                            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                          <span className="font-medium text-sm truncate">{getSessionTitle(session)}</span>
                        </div>
                        {!session.ended_at && <Badge variant="secondary" className="text-xs">Active</Badge>}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(session.started_at), { addSuffix: true })}
                        <span>•</span>
                        <span>{session.message_count} msgs</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Session Details */}
          <div className="border rounded-lg">
            <div className="p-3 border-b">
              <h4 className="font-medium text-sm">Session Details</h4>
            </div>
            <div className="p-4">
              {selectedSession ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Started</p>
                      <p className="text-sm font-medium">{format(new Date(selectedSession.started_at), "MMM d, h:mm a")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant={selectedSession.ended_at ? "secondary" : "default"} className="text-xs">
                        {selectedSession.ended_at ? "Completed" : "Active"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-medium">{formatDuration(selectedSession.duration_seconds)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Messages</p>
                      <p className="text-sm font-medium">{selectedSession.message_count}</p>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground mb-2">User</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{getSessionTitle(selectedSession)}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedSession.subscriber_id ? "Registered" : "Guest"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a session</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminCoachDetail = () => {
  const { coachId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [coach, setCoach] = useState<Coach | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeSection, setActiveSection] = useState<MenuSection>("profile");
  const [chatModalOpen, setChatModalOpen] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [personality, setPersonality] = useState("");
  const [status, setStatus] = useState("admin_setup");
  const [isVerified, setIsVerified] = useState(false);
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  useEffect(() => {
    if (coachId) {
      fetchCoach();
    }
  }, [coachId]);

  const fetchCoach = async () => {
    try {
      const { data: coachProfile, error: coachError } = await supabase
        .from("coach_profiles")
        .select("*")
        .eq("id", coachId)
        .single();

      if (coachError) throw coachError;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("id", coachProfile.user_id)
        .single();

      if (profileError) throw profileError;

      // Get subscriber count
      const { count } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", coachProfile.user_id)
        .eq("status", "active");

      const fullCoach: Coach = {
        ...coachProfile,
        profiles: profile,
        subscriber_count: count || 0,
      };

      setCoach(fullCoach);
      populateForm(fullCoach);
    } catch (error) {
      console.error("Error fetching coach:", error);
      toast({
        title: "Error",
        description: "Failed to load coach details",
        variant: "destructive",
      });
      navigate("/admin-dashboard/coaches");
    } finally {
      setIsLoading(false);
    }
  };

  const populateForm = (coach: Coach) => {
    setFullName(coach.profiles.full_name || "");
    setAvatarUrl(coach.profiles.avatar_url);
    setBio(coach.bio || "");
    setHourlyRate(coach.hourly_rate?.toString() || "");
    setSpecialization(coach.specialization || "");
    setPersonality(coach.personality || "");
    setStatus(coach.status || "admin_setup");
    setIsVerified(coach.is_verified);
    setShowOnHomepage(coach.show_on_homepage);
    setExpertise(coach.expertise || []);
    setWebhookUrl(coach.webhook_url || "");
    setWebsiteUrl(coach.website_url || "");
    setTwitterUrl(coach.twitter_url || "");
    setLinkedinUrl(coach.linkedin_url || "");
    setInstagramUrl(coach.instagram_url || "");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "C";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !coach) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image smaller than 5MB", variant: "destructive" });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${coach.user_id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);

      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", coach.user_id);

      setAvatarUrl(publicUrl);
      toast({ title: "Success", description: "Avatar updated successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to upload avatar", variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAddExpertise = () => {
    if (expertiseInput.trim() && !expertise.includes(expertiseInput.trim())) {
      setExpertise([...expertise, expertiseInput.trim()]);
      setExpertiseInput("");
    }
  };

  const handleRemoveExpertise = (item: string) => {
    setExpertise(expertise.filter((e) => e !== item));
  };

  const handleSave = async () => {
    if (!coach) return;

    setIsSaving(true);
    try {
      // Update profile
      await supabase.from("profiles").update({ full_name: fullName }).eq("id", coach.user_id);

      // Update coach profile
      const updateData: Record<string, any> = {
        bio,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        specialization,
        personality,
        status: status as "active" | "admin_setup" | "coach_claimed" | "inactive" | "knowledge_base_setup" | "onboarding_completed" | "onboarding_started",
        is_verified: isVerified,
        show_on_homepage: isVerified ? showOnHomepage : false,
        expertise,
        webhook_url: webhookUrl || null,
        website_url: websiteUrl || null,
        twitter_url: twitterUrl || null,
        linkedin_url: linkedinUrl || null,
        instagram_url: instagramUrl || null,
        last_activity_at: new Date().toISOString(),
      };

      await supabase
        .from("coach_profiles")
        .update(updateData)
        .eq("id", coach.id);
      toast({ title: "Success", description: "Coach profile saved successfully" });
      fetchCoach();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!coach) return null;

  return (
    <DashboardLayout requiredRole="admin">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin-dashboard/coaches")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {getInitials(fullName || coach.profiles.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{fullName || coach.profiles.full_name || "Unnamed Coach"}</h1>
                <p className="text-muted-foreground">{coach.profiles.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isVerified ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="w-3 h-3" /> Verified
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <XCircle className="w-3 h-3" /> Unverified
              </Badge>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Menu */}
          <div className="col-span-12 lg:col-span-3">
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {MENU_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className={`text-xs ${activeSection === item.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {item.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subscribers</span>
                  <span className="font-medium">{coach.subscriber_count || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sessions</span>
                  <span className="font-medium">{coach.total_sessions || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium">{coach.rating || 0}/5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-xs">{status.replace(/_/g, " ")}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage the coach's public profile details</CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.open(`/${coach.slug}`, '_blank')}
                    >
                      <Globe className="w-4 h-4" />
                      View Public Profile
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      https://syndic.us/{coach.slug}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg border">
                    <div className="relative">
                      <Avatar className="h-20 w-20 border-2 border-background shadow-md">
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                          {getInitials(fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                      >
                        {isUploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      </Button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-base font-semibold">Profile Photo</Label>
                      <p className="text-sm text-muted-foreground mt-1">Click the camera icon or button to upload. Max 5MB.</p>
                      <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={() => fileInputRef.current?.click()} disabled={isUploadingAvatar}>
                        <Upload className="h-4 w-4" /> Upload Photo
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Coach name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email (Read-only)</Label>
                      <Input value={coach.profiles.email} disabled className="bg-muted" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Specialization</Label>
                    <Input value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g., Executive Coaching" />
                  </div>

                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Coach biography" rows={4} />
                  </div>

                  <div className="space-y-2">
                    <Label>Personality/Approach</Label>
                    <Textarea value={personality} onChange={(e) => setPersonality(e.target.value)} placeholder="Describe coaching style" rows={3} />
                  </div>

                  <div className="space-y-2">
                    <Label>Expertise Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={expertiseInput}
                        onChange={(e) => setExpertiseInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddExpertise())}
                        placeholder="Add expertise tag"
                      />
                      <Button type="button" onClick={handleAddExpertise}>Add</Button>
                    </div>
                    {expertise.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {expertise.map((item, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {item}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveExpertise(item)} />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4 pt-4 border-t">
                    <Label className="text-base font-semibold">Website & Social Links</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Website</Label>
                        <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Twitter/X</Label>
                        <Input value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://twitter.com/..." />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">LinkedIn</Label>
                        <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Instagram</Label>
                        <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Settings Section */}
            {activeSection === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage status, verification, and pricing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Account Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Hourly Rate ($)</Label>
                      <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="150" />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Verified Coach</Label>
                        <p className="text-sm text-muted-foreground">Verified coaches can appear on the homepage</p>
                      </div>
                      <Switch checked={isVerified} onCheckedChange={setIsVerified} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Show on Homepage</Label>
                        <p className="text-sm text-muted-foreground">Display in public coach directory (requires verification)</p>
                      </div>
                      <Switch checked={showOnHomepage} onCheckedChange={setShowOnHomepage} disabled={!isVerified} />
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border space-y-2">
                    <Label className="text-sm font-medium">Coach Slug</Label>
                    <div className="flex items-center gap-2">
                      <Input value={coach.slug} disabled className="bg-muted font-mono text-sm" />
                      <Button variant="outline" size="sm" onClick={() => navigate(`/${coach.slug}`)}>
                        <Eye className="w-4 h-4 mr-1" /> Preview
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Public URL: syndic.us/{coach.slug}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Integrations Section */}
            {activeSection === "integrations" && (
              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>Connect external tools and webhooks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <Label className="text-base font-semibold">n8n Webhook URL</Label>
                        <p className="text-sm text-muted-foreground">Connect to an n8n chat agent workflow</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://your-n8n-instance.com/webhook/..."
                        className="flex-1"
                      />
                      <Button variant="secondary" onClick={() => setChatModalOpen(true)} disabled={!webhookUrl.trim()}>
                        <MessageSquare className="w-4 h-4 mr-2" /> Test Chat
                      </Button>
                    </div>
                  </div>

                  {/* Placeholder for future integrations */}
                  <div className="grid grid-cols-2 gap-4">
                    {["Stripe Connect", "Google Calendar", "Zapier", "Email Notifications"].map((integration) => (
                      <div key={integration} className="p-4 border rounded-lg opacity-50">
                        <div className="flex items-center gap-2">
                          <Link2 className="w-4 h-4" />
                          <span className="font-medium">{integration}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Knowledge Base Section */}
            {activeSection === "knowledge" && (
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Base</CardTitle>
                  <CardDescription>View and manage digital twin assets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">Knowledge Base Management</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      View assets uploaded by the coach to their Digital Twin
                    </p>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Conversations Section */}
            {activeSection === "conversations" && (
              <CoachConversationsSection coachId={coach.id} coachName={fullName || coach.profiles.full_name || "Coach"} />
            )}

            {/* Analytics Section */}
            {activeSection === "analytics" && (
              <Card>
                <CardHeader>
                  <CardTitle>Analytics & Metrics</CardTitle>
                  <CardDescription>Performance data and subscriber insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{coach.subscriber_count || 0}</div>
                      <div className="text-sm text-muted-foreground">Subscribers</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <MessageSquare className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{coach.total_sessions || 0}</div>
                      <div className="text-sm text-muted-foreground">Sessions</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <BarChart3 className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{coach.rating || 0}</div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                    </div>
                  </div>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">Detailed analytics coming soon</p>
                    <Badge variant="outline" className="mt-2">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Section */}
            {activeSection === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>Security & Access</CardTitle>
                  <CardDescription>Manage permissions and audit trail</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Account Created</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(coach.created_at).toLocaleDateString()} at {new Date(coach.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Last Activity</h4>
                          <p className="text-sm text-muted-foreground">
                            {coach.last_activity_at ? new Date(coach.last_activity_at).toLocaleString() : "Never"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Profile Claimed</h4>
                          <p className="text-sm text-muted-foreground">
                            {coach.is_claimed ? "Yes" : "No - coach has not claimed this profile"}
                          </p>
                        </div>
                        <Badge variant={coach.is_claimed ? "default" : "secondary"}>
                          {coach.is_claimed ? "Claimed" : "Unclaimed"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center py-4">
                    <p className="text-muted-foreground text-sm">Audit log and session management coming soon</p>
                    <Badge variant="outline" className="mt-2">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Missing Features Reference */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Missing Features (Roadmap)</CardTitle>
                <CardDescription>Features to be implemented</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {MISSING_FEATURES.map((section) => (
                    <div key={section.section} className="space-y-2">
                      <h4 className="font-medium text-sm">{section.section}</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {section.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CoachChatModal
        open={chatModalOpen}
        onOpenChange={setChatModalOpen}
        coachName={fullName || coach.profiles.full_name || "Coach"}
        coachBio={bio}
        coachAvatar={avatarUrl}
        webhookUrl={webhookUrl}
        coachId={coach.id}
      />
    </DashboardLayout>
  );
};

export default AdminCoachDetail;
