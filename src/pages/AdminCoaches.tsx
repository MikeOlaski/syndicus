import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Search, Mail, Calendar, Star, Briefcase, Edit, Filter, UserPlus, Trash2, AlertTriangle, Bot, Globe, LayoutGrid, Table, Columns3, ExternalLink, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CoachImporter } from "@/components/admin/CoachImporter";
import { CoachEditModal } from "@/components/admin/CoachEditModal";
import { CoachAddModal } from "@/components/admin/CoachAddModal";
import { CoachManualAddModal } from "@/components/admin/CoachManualAddModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  subscriber_count: number;
  profiles: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

type ViewMode = "grid" | "table" | "kanban";

const AdminCoaches = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [filteredCoaches, setFilteredCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManualAddModalOpen, setIsManualAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [coachToDelete, setCoachToDelete] = useState<Coach | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCoaches();
  }, []);

  useEffect(() => {
    let filtered = coaches;
    
    if (searchQuery) {
      filtered = filtered.filter((coach) => {
        const name = coach.profiles.full_name?.toLowerCase() || "";
        const email = coach.profiles.email.toLowerCase();
        const expertise = coach.expertise?.join(" ").toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        
        return name.includes(query) || email.includes(query) || expertise.includes(query);
      });
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((coach) => coach.status === statusFilter);
    }
    
    setFilteredCoaches(filtered);
  }, [searchQuery, statusFilter, coaches]);

  const fetchCoaches = async () => {
    try {
      // Fetch coach profiles first
      const { data: coachProfiles, error: coachError } = await supabase
        .from("coach_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (coachError) throw coachError;

      if (!coachProfiles || coachProfiles.length === 0) {
        setCoaches([]);
        setFilteredCoaches([]);
        setIsLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = coachProfiles.map(cp => cp.user_id);

      // Fetch profiles for those user IDs
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Fetch subscriber counts for each coach
      const { data: subscriptions, error: subsError } = await supabase
        .from("subscriptions")
        .select("coach_id")
        .eq("status", "active")
        .in("coach_id", userIds);

      if (subsError) throw subsError;

      // Count subscribers per coach
      const subscriberCounts = new Map<string, number>();
      (subscriptions || []).forEach((sub) => {
        const count = subscriberCounts.get(sub.coach_id) || 0;
        subscriberCounts.set(sub.coach_id, count + 1);
      });

      // Create a map for quick lookup
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Combine the data
      const combinedData = coachProfiles.map(cp => ({
        ...cp,
        subscriber_count: subscriberCounts.get(cp.user_id) || 0,
        profiles: profilesMap.get(cp.user_id) || {
          full_name: null,
          email: "Unknown",
          avatar_url: null,
        },
      }));

      setCoaches(combinedData as any);
      setFilteredCoaches(combinedData as any);
    } catch (error) {
      console.error("Error fetching coaches:", error);
      toast({
        title: "Error",
        description: "Failed to fetch coaches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVerification = async (coachId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("coach_profiles")
        .update({ is_verified: !currentStatus })
        .eq("id", coachId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Coach ${!currentStatus ? "verified" : "unverified"} successfully`,
      });

      fetchCoaches();
    } catch (error) {
      console.error("Error updating coach:", error);
      toast({
        title: "Error",
        description: "Failed to update coach verification",
        variant: "destructive",
      });
    }
  };

  const toggleHomepageVisibility = async (coachId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("coach_profiles")
        .update({ show_on_homepage: !currentStatus })
        .eq("id", coachId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Coach ${!currentStatus ? "now visible" : "hidden"} on homepage`,
      });

      fetchCoaches();
    } catch (error) {
      console.error("Error updating coach:", error);
      toast({
        title: "Error",
        description: "Failed to update homepage visibility",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "C";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "destructive";
      case "admin_setup":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleEditCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (coach: Coach) => {
    setCoachToDelete(coach);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!coachToDelete) return;

    setIsDeleting(true);
    try {
      // Delete coach profile
      const { error: coachError } = await supabase
        .from("coach_profiles")
        .delete()
        .eq("id", coachToDelete.id);

      if (coachError) throw coachError;

      toast({
        title: "Coach Deleted",
        description: `${coachToDelete.profiles.full_name || "Coach"} has been permanently deleted.`,
      });

      setIsDeleteDialogOpen(false);
      setCoachToDelete(null);
      fetchCoaches();
    } catch (error) {
      console.error("Error deleting coach:", error);
      toast({
        title: "Error",
        description: "Failed to delete coach. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Coaches Directory</h1>
              <p className="text-muted-foreground">
                Manage and verify all coaches in the system
              </p>
            </div>
          </div>

          {/* Import Section */}
          <CoachImporter onImportComplete={fetchCoaches} />

          {/* Search, Filter Bar, and Add Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, email, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="admin_setup">Admin Setup</SelectItem>
                  <SelectItem value="coach_claimed">Coach Claimed</SelectItem>
                  <SelectItem value="onboarding_started">Onboarding Started</SelectItem>
                  <SelectItem value="onboarding_completed">Onboarding Completed</SelectItem>
                  <SelectItem value="knowledge_base_setup">Knowledge Base Setup</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)} className="border rounded-md">
              <ToggleGroupItem value="grid" aria-label="Grid view" className="px-3">
                <LayoutGrid className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Table view" className="px-3">
                <Table className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="kanban" aria-label="Kanban view" className="px-3">
                <Columns3 className="w-4 h-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="flex gap-2">
              <Button onClick={() => setIsManualAddModalOpen(true)} variant="outline" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add Coach
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                <Bot className="w-4 h-4" />
                Add Coach By Agent
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Coaches</p>
                <p className="text-2xl font-bold">{coaches.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold">
                  {coaches.filter((c) => c.is_verified).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <XCircle className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unverified</p>
                <p className="text-2xl font-bold">
                  {coaches.filter((c) => !c.is_verified).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Claimed</p>
                <p className="text-2xl font-bold">
                  {coaches.filter((c) => c.is_claimed).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Coaches List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading coaches...</p>
          </div>
        ) : filteredCoaches.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No coaches found matching your search"
                : "No coaches registered yet"}
            </p>
          </Card>
        ) : viewMode === "table" ? (
          /* Table View */
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <TableComponent>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coach</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Homepage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoaches.map((coach) => (
                    <TableRow key={coach.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={coach.profiles.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(coach.profiles.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{coach.profiles.full_name || "Unnamed"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{coach.profiles.email}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(coach.status)} className="text-xs">
                          {getStatusLabel(coach.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={coach.is_verified ? "default" : "secondary"} className="text-xs">
                          {coach.is_verified ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {coach.rating.toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell>{coach.total_sessions}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          {coach.subscriber_count}
                        </div>
                      </TableCell>
                      <TableCell>${coach.hourly_rate || "N/A"}</TableCell>
                      <TableCell>
                        <Switch
                          checked={coach.show_on_homepage || false}
                          onCheckedChange={() => toggleHomepageVisibility(coach.id, coach.show_on_homepage || false)}
                          aria-label="Show on homepage"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="sm" title="View public profile">
                            <Link to={`/${coach.slug}`} target="_blank">
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button onClick={() => handleEditCoach(coach)} variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => toggleVerification(coach.id, coach.is_verified)}
                            variant="ghost"
                            size="sm"
                          >
                            {coach.is_verified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>
                          <Button
                            onClick={() => handleDeleteClick(coach)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableComponent>
            </div>
          </Card>
        ) : viewMode === "kanban" ? (
          /* Kanban View */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto">
            {["admin_setup", "onboarding_started", "active", "inactive"].map((status) => {
              const statusCoaches = filteredCoaches.filter((c) => c.status === status);
              return (
                <div key={status} className="min-w-[280px]">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                    <Badge variant={getStatusBadgeVariant(status)}>{getStatusLabel(status)}</Badge>
                    <span className="text-sm text-muted-foreground">({statusCoaches.length})</span>
                  </div>
                  <div className="space-y-3">
                    {statusCoaches.map((coach) => (
                      <Card key={coach.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={coach.profiles.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(coach.profiles.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-sm">{coach.profiles.full_name || "Unnamed"}</p>
                            <p className="text-xs text-muted-foreground truncate">{coach.profiles.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{coach.rating.toFixed(1)}</span>
                          <span className="text-border">•</span>
                          <span>{coach.total_sessions} sessions</span>
                          <span className="text-border">•</span>
                          <Users className="w-3 h-3" />
                          <span>{coach.subscriber_count} subs</span>
                        </div>
                        <div className="flex gap-1">
                          <Button asChild variant="ghost" size="sm" className="h-7 px-2" title="View public profile">
                            <Link to={`/${coach.slug}`} target="_blank">
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </Button>
                          <Button onClick={() => handleEditCoach(coach)} variant="outline" size="sm" className="flex-1 h-7 text-xs">
                            Edit
                          </Button>
                          <Button
                            onClick={() => toggleVerification(coach.id, coach.is_verified)}
                            variant={coach.is_verified ? "outline" : "default"}
                            size="sm"
                            className="flex-1 h-7 text-xs"
                          >
                            {coach.is_verified ? "Unverify" : "Verify"}
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {statusCoaches.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No coaches</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Grid View (default) */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCoaches.map((coach) => (
              <Card key={coach.id} className="p-6 hover:shadow-lg transition-shadow relative">
                {/* Homepage Toggle */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <Globe className={`w-4 h-4 ${coach.show_on_homepage ? 'text-primary' : 'text-muted-foreground'}`} />
                  <Switch
                    checked={coach.show_on_homepage || false}
                    onCheckedChange={() => toggleHomepageVisibility(coach.id, coach.show_on_homepage || false)}
                    aria-label="Show on homepage"
                  />
                </div>
                
                <div className="flex items-start gap-4 mb-4 pr-16">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={coach.profiles.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(coach.profiles.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">
                      {coach.profiles.full_name || "Unnamed Coach"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{coach.profiles.email}</span>
                    </div>
                  </div>
                </div>

                {coach.bio && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {coach.bio}
                  </p>
                )}

                {/* Expertise Tags */}
                {coach.expertise && coach.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {coach.expertise.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {coach.expertise.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{coach.expertise.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 mb-4 pb-4 border-b">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <p className="text-sm font-bold">{coach.rating.toFixed(1)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold">{coach.total_sessions}</p>
                    <p className="text-xs text-muted-foreground">Sessions</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-3 h-3 text-primary" />
                      <p className="text-sm font-bold">{coach.subscriber_count}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Subscribers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold">
                      ${coach.hourly_rate || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">Rate</p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge
                    variant={getStatusBadgeVariant(coach.status)}
                    className="text-xs font-medium"
                  >
                    {getStatusLabel(coach.status)}
                  </Badge>
                  <Badge
                    variant={coach.is_verified ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {coach.is_verified ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        Unverified
                      </>
                    )}
                  </Badge>
                  <Badge
                    variant={coach.is_claimed ? "default" : "outline"}
                    className="text-xs"
                  >
                    {coach.is_claimed ? "Claimed" : "Unclaimed"}
                  </Badge>
                </div>

                {/* Member Since */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Member since {new Date(coach.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button asChild variant="ghost" size="sm" title="View public profile">
                    <Link to={`/${coach.slug}`} target="_blank">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    onClick={() => handleEditCoach(coach)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => toggleVerification(coach.id, coach.is_verified)}
                    variant={coach.is_verified ? "outline" : "default"}
                    size="sm"
                    className="flex-1"
                  >
                    {coach.is_verified ? "Unverify" : "Verify"}
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(coach)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <CoachEditModal
          coach={selectedCoach}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSave={fetchCoaches}
        />

        <CoachAddModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onSuccess={fetchCoaches}
        />

        <CoachManualAddModal
          open={isManualAddModalOpen}
          onOpenChange={setIsManualAddModalOpen}
          onSuccess={fetchCoaches}
        />

        {/* Delete Confirmation Modal */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <AlertDialogTitle className="text-center text-xl">
                Delete Coach?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  {coachToDelete?.profiles.full_name || "this coach"}
                </span>
                ? This action cannot be undone and all associated data will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center gap-3 mt-4">
              <AlertDialogCancel 
                disabled={isDeleting}
                className="flex-1 sm:flex-initial"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 sm:flex-initial bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminCoaches;
