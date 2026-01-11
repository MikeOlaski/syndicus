import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Loader2, 
  Globe, 
  Lock,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

interface GroupMember {
  id: string;
  coachId: string;
  name: string;
  specialization: string | null;
  avatarUrl: string | null;
  hasApprovedPublic: boolean;
  approvedAt: string | null;
}

interface GroupDetails {
  id: string;
  name: string;
  description: string | null;
  publicDescription: string | null;
  coverImageUrl: string | null;
  isPublic: boolean;
  isFeatured: boolean;
  popularityScore: number;
  createdAt: string;
}

interface AvailableCoach {
  id: string;
  userId: string;
  name: string;
  specialization: string | null;
  avatarUrl: string | null;
}

const SubscriberSyndic8Manage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { status } = useSubscriptionLimits();
  
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Add member modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableCoaches, setAvailableCoaches] = useState<AvailableCoach[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingCoaches, setIsLoadingCoaches] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  
  // Edit fields
  const [publicDescription, setPublicDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch group details
      const { data: groupData, error: groupError } = await supabase
        .from("syndic8_groups")
        .select("*")
        .eq("id", groupId)
        .eq("owner_id", user.id)
        .single();

      if (groupError) throw groupError;

      setGroup({
        id: groupData.id,
        name: groupData.name,
        description: groupData.description,
        publicDescription: groupData.public_description,
        coverImageUrl: groupData.cover_image_url,
        isPublic: groupData.is_public || false,
        isFeatured: groupData.is_featured || false,
        popularityScore: groupData.popularity_score || 0,
        createdAt: groupData.created_at,
      });
      setPublicDescription(groupData.public_description || "");
      setIsPublic(groupData.is_public || false);

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from("syndic8_group_members")
        .select("id, coach_id, has_approved_public, approved_at")
        .eq("group_id", groupId);

      if (membersError) throw membersError;

      if (membersData && membersData.length > 0) {
        // Fetch coach profiles separately
        const coachIds = membersData.map(m => m.coach_id);
        const { data: coachProfiles } = await supabase
          .from("coach_profiles")
          .select("id, user_id, specialization")
          .in("id", coachIds);

        const coachMap = new Map(
          coachProfiles?.map(cp => [cp.id, { userId: cp.user_id, specialization: cp.specialization }]) || []
        );

        // Fetch user profiles using RPC function (avoids RLS issues)
        const userIds = coachProfiles?.map(cp => cp.user_id) || [];
        const { data: profiles } = await supabase
          .rpc("get_public_coach_profiles", { coach_ids: userIds });

        const profileMap = new Map(
          profiles?.map((p: { id: string; full_name: string | null; avatar_url: string | null }) => 
            [p.id, { name: p.full_name, avatar: p.avatar_url }]
          ) || []
        );

        const formattedMembers: GroupMember[] = membersData.map((m) => {
          const coach = coachMap.get(m.coach_id);
          const profile = coach ? profileMap.get(coach.userId) : null;
          return {
            id: m.id,
            coachId: m.coach_id,
            name: profile?.name || "Expert",
            specialization: coach?.specialization || null,
            avatarUrl: profile?.avatar || null,
            hasApprovedPublic: m.has_approved_public || false,
            approvedAt: m.approved_at,
          };
        });

        setMembers(formattedMembers);
      } else {
        setMembers([]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load group");
      navigate("/subscriber-dashboard/syndic8s");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableCoaches = async () => {
    setIsLoadingCoaches(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get coaches the user is subscribed to
      const { data: subscriptions, error: subError } = await supabase
        .from("subscriptions")
        .select("coach_id")
        .eq("subscriber_id", user.id)
        .eq("status", "active");

      if (subError) throw subError;

      if (!subscriptions || subscriptions.length === 0) {
        setAvailableCoaches([]);
        return;
      }

      // Get coach profile details separately to avoid join issues
      const coachIds = subscriptions.map(s => s.coach_id);
      const { data: coachProfiles } = await supabase
        .from("coach_profiles")
        .select("id, user_id, specialization")
        .in("user_id", coachIds);

      if (!coachProfiles || coachProfiles.length === 0) {
        setAvailableCoaches([]);
        return;
      }

      // Get existing member coach IDs
      const existingCoachIds = members.map(m => m.coachId);

      // Filter out already added coaches
      const available = coachProfiles.filter(
        (cp) => !existingCoachIds.includes(cp.id)
      );

      // Get profile info using RPC function
      const userIds = available.map((cp) => cp.user_id);
      const { data: profiles } = await supabase
        .rpc("get_public_coach_profiles", { coach_ids: userIds });

      const profileMap = new Map(
        profiles?.map((p: { id: string; full_name: string | null; avatar_url: string | null }) => 
          [p.id, { name: p.full_name, avatar: p.avatar_url }]
        ) || []
      );

      const formattedCoaches: AvailableCoach[] = available.map((cp) => {
        const profile = profileMap.get(cp.user_id);
        return {
          id: cp.id,
          userId: cp.user_id,
          name: profile?.name || "Coach",
          specialization: cp.specialization,
          avatarUrl: profile?.avatar,
        };
      });

      setAvailableCoaches(formattedCoaches);
    } catch (error: any) {
      toast.error("Failed to load available coaches");
    } finally {
      setIsLoadingCoaches(false);
    }
  };

  const handleAddMember = async (coach: AvailableCoach) => {
    const maxMembers = status?.limits.max_coaches_per_group || 8;
    if (members.length >= maxMembers) {
      toast.error(`Maximum ${maxMembers} members allowed per group`);
      return;
    }

    setIsAddingMember(true);
    try {
      const { error } = await supabase
        .from("syndic8_group_members")
        .insert({
          group_id: groupId,
          coach_id: coach.id,
          has_approved_public: false,
        });

      if (error) throw error;

      toast.success(`${coach.name} added to council`);
      setShowAddModal(false);
      fetchGroupData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add member");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (member: GroupMember) => {
    if (!confirm(`Remove ${member.name} from this council?`)) return;

    try {
      const { error } = await supabase
        .from("syndic8_group_members")
        .delete()
        .eq("id", member.id);

      if (error) throw error;

      toast.success(`${member.name} removed`);
      setMembers(members.filter(m => m.id !== member.id));
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member");
    }
  };

  const handleSavePublicSettings = async () => {
    if (!group) return;

    // Check if all members have approved for making public
    if (isPublic && members.some(m => !m.hasApprovedPublic)) {
      toast.error("All council members must approve public visibility first");
      return;
    }

    if (isPublic && members.length === 0) {
      toast.error("Add at least one council member before making public");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("syndic8_groups")
        .update({
          is_public: isPublic,
          public_description: publicDescription.trim() || null,
        })
        .eq("id", groupId);

      if (error) throw error;

      setGroup({ ...group, isPublic, publicDescription: publicDescription.trim() || null });
      toast.success(isPublic ? "Council is now public!" : "Council is now private");
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setSearchQuery("");
    fetchAvailableCoaches();
  };

  const filteredCoaches = availableCoaches.filter(
    c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (c.specialization?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const allMembersApproved = members.length > 0 && members.every(m => m.hasApprovedPublic);
  const pendingApprovals = members.filter(m => !m.hasApprovedPublic);
  const maxMembers = status?.limits.max_coaches_per_group || 8;
  const canAddMore = members.length < maxMembers;

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="subscriber">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!group) {
    return (
      <DashboardLayout requiredRole="subscriber">
        <div className="container mx-auto px-6 py-8 text-center">
          <p className="text-muted-foreground">Group not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="subscriber">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/subscriber-dashboard/syndic8s")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-muted-foreground text-sm">
              {group.description || "Manage your council members and settings"}
            </p>
          </div>
          <Badge variant={group.isPublic ? "default" : "secondary"}>
            {group.isPublic ? (
              <><Globe className="w-3 h-3 mr-1" /> Public</>
            ) : (
              <><Lock className="w-3 h-3 mr-1" /> Private</>
            )}
          </Badge>
        </div>

        {/* Public Visibility Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Public Visibility
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Make your council discoverable in the public directory
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={!allMembersApproved && isPublic === false && members.length > 0}
            />
          </div>

          {/* Requirements Alert */}
          {members.length === 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No Members Yet</AlertTitle>
              <AlertDescription>
                Add at least one coach to your council before making it public.
              </AlertDescription>
            </Alert>
          )}

          {members.length > 0 && !allMembersApproved && (
            <Alert className="mb-4">
              <Clock className="h-4 w-4" />
              <AlertTitle>Pending Approvals</AlertTitle>
              <AlertDescription>
                {pendingApprovals.length} member{pendingApprovals.length > 1 ? 's' : ''} haven't approved public visibility yet. 
                They'll be notified when you toggle public on.
              </AlertDescription>
            </Alert>
          )}

          {allMembersApproved && (
            <Alert className="mb-4 border-green-500/50 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">All Members Approved</AlertTitle>
              <AlertDescription>
                All council members have approved public visibility. You can now make your council public.
              </AlertDescription>
            </Alert>
          )}

          {/* Public Description */}
          <div className="space-y-2 mt-4">
            <Label htmlFor="publicDescription">Public Description</Label>
            <Textarea
              id="publicDescription"
              placeholder="Describe what makes this council unique and how it can help others..."
              value={publicDescription}
              onChange={(e) => setPublicDescription(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This description will be shown in the public directory
            </p>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSavePublicSettings} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </Card>

        {/* Council Members Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Council Members
              </h2>
              <p className="text-sm text-muted-foreground">
                {members.length} / {maxMembers} experts
              </p>
            </div>
            {canAddMore && (
              <Button size="sm" onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-2" />
                Add Expert
              </Button>
            )}
          </div>

          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No members yet</p>
              <p className="text-sm">Add coaches you're subscribed to</p>
              <Button className="mt-4" onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Expert
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatarUrl || undefined} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{member.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {member.specialization || "Expert"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.hasApprovedPublic ? (
                      <Badge variant="outline" className="text-green-600 border-green-500/50">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-500/50">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveMember(member)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Add Member Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Expert to Council</DialogTitle>
              <DialogDescription>
                Select from coaches you're subscribed to
              </DialogDescription>
            </DialogHeader>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search coaches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 py-2">
              {isLoadingCoaches ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredCoaches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="font-medium">No available coaches</p>
                  <p className="text-sm">
                    {searchQuery 
                      ? "Try a different search" 
                      : "Subscribe to coaches to add them here"}
                  </p>
                </div>
              ) : (
                filteredCoaches.map((coach) => (
                  <button
                    key={coach.id}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                    onClick={() => handleAddMember(coach)}
                    disabled={isAddingMember}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={coach.avatarUrl || undefined} />
                      <AvatarFallback>
                        {coach.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{coach.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {coach.specialization || "Expert"}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SubscriberSyndic8Manage;
