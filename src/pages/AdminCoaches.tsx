import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Search, Mail, Calendar, Star, Briefcase, Edit, Filter, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CoachImporter } from "@/components/admin/CoachImporter";
import { CoachEditModal } from "@/components/admin/CoachEditModal";
import { CoachAddModal } from "@/components/admin/CoachAddModal";

interface Coach {
  id: string;
  user_id: string;
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
  profiles: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

const AdminCoaches = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [filteredCoaches, setFilteredCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
      const { data, error } = await supabase
        .from("coach_profiles")
        .select(`
          *,
          profiles!coach_profiles_user_id_fkey (
            full_name,
            email,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setCoaches(data as any);
      setFilteredCoaches(data as any);
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
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Coach
            </Button>
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
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCoaches.map((coach) => (
              <Card key={coach.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
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
                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
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
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleEditCoach(coach)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => toggleVerification(coach.id, coach.is_verified)}
                    variant={coach.is_verified ? "outline" : "default"}
                    size="sm"
                  >
                    {coach.is_verified ? "Unverify" : "Verify"}
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
      </div>
    </DashboardLayout>
  );
};

export default AdminCoaches;
