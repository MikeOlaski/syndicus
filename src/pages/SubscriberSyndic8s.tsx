import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Plus, 
  Users, 
  Trash2, 
  Loader2,
  Sparkles,
  ArrowRight,
  Settings
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

interface Syndic8Group {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count: number;
}

const SubscriberSyndic8s = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Syndic8Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const { status } = useSubscriptionLimits();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: groupsData, error } = await supabase
        .from("syndic8_groups")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get member counts for each group
      const groupsWithCounts = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { count } = await supabase
            .from("syndic8_group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);
          
          return {
            ...group,
            member_count: count || 0
          };
        })
      );

      setGroups(groupsWithCounts);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch groups");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    // Check limits
    const maxGroups = status?.limits.max_syndic8_groups || 1;
    if (groups.length >= maxGroups) {
      toast.error(`You can only create ${maxGroups} Syndic8 group(s) on your current plan`);
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("syndic8_groups")
        .insert({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null,
          owner_id: user.id
        });

      if (error) throw error;

      toast.success("Syndic8 group created!");
      setShowCreateModal(false);
      setNewGroupName("");
      setNewGroupDescription("");
      fetchGroups();
    } catch (error: any) {
      toast.error(error.message || "Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to delete "${groupName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // First delete members
      await supabase
        .from("syndic8_group_members")
        .delete()
        .eq("group_id", groupId);

      // Then delete the group
      const { error } = await supabase
        .from("syndic8_groups")
        .delete()
        .eq("id", groupId);

      if (error) throw error;

      toast.success("Group deleted");
      setGroups(groups.filter(g => g.id !== groupId));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete group");
    }
  };

  const maxGroups = status?.limits.max_syndic8_groups || 1;
  const canCreateMore = groups.length < maxGroups;

  return (
    <DashboardLayout requiredRole="subscriber">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Syndic8s</h1>
            <p className="text-muted-foreground">
              Create and manage your expert cohort groups
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {groups.length}/{maxGroups} Groups
            </Badge>
            {canCreateMore && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Syndic8
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : groups.length === 0 ? (
          /* Empty State */
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Create Your First Syndic8</h2>
              <p className="text-muted-foreground mb-6">
                A Syndic8 is your personal "Council of Minds" — a curated group of AI-powered expert coaches 
                that collaborate to give you balanced perspectives on any challenge.
              </p>
              <div className="space-y-3 text-left bg-muted/50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Blend Multiple Perspectives</p>
                    <p className="text-sm text-muted-foreground">Combine coaches with different expertise</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Up to {status?.limits.max_coaches_per_group || 8} Experts</p>
                    <p className="text-sm text-muted-foreground">Add coaches that complement each other</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Collaborative Intelligence</p>
                    <p className="text-sm text-muted-foreground">Get synthesized recommendations from your council</p>
                  </div>
                </div>
              </div>
              <Button size="lg" onClick={() => setShowCreateModal(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Syndic8
              </Button>
            </div>
          </Card>
        ) : (
          /* Groups List */
          <div className="space-y-4">
            {groups.map((group) => (
              <Card key={group.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {group.description || "No description"}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {group.member_count} / {status?.limits.max_coaches_per_group || 8} Coaches
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Created {new Date(group.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/subscriber-dashboard/syndic8s/${group.id}`)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {/* Upgrade CTA if at limit */}
            {!canCreateMore && status?.tier !== "prime" && (
              <Card className="p-6 border-dashed border-2 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Want more Syndic8 groups?</h3>
                      <p className="text-sm text-muted-foreground">
                        Upgrade to Prime for 2 Syndic8 groups with up to 8 coaches each
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/pricing")}>
                    Upgrade Plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Create Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Syndic8</DialogTitle>
              <DialogDescription>
                Give your expert council a name and optional description.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Business Growth Council"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What will this group help you with?"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGroup} disabled={isCreating}>
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Syndic8
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SubscriberSyndic8s;