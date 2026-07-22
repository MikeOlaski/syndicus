import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Globe, 
  Check, 
  X, 
  Loader2, 
  Users,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface PendingApproval {
  membershipId: string;
  groupId: string;
  groupName: string;
  groupDescription: string | null;
  ownerName: string;
  ownerAvatarUrl: string | null;
  memberCount: number;
  createdAt: string;
}

export const CoachSyndic8Approvals = () => {
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get coach profile
      const { data: coachProfile, error: coachError } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (coachError || !coachProfile) {
        setIsLoading(false);
        return;
      }

      // Get memberships where this coach hasn't approved public yet
      const { data: memberships, error: memberError } = await supabase
        .from("syndic8_group_members")
        .select(`
          id,
          group_id,
          has_approved_public,
          syndic8_groups!inner (
            id,
            name,
            description,
            owner_id,
            is_public,
            created_at
          )
        `)
        .eq("coach_id", coachProfile.id)
        .eq("has_approved_public", false);

      if (memberError) throw memberError;

      if (!memberships || memberships.length === 0) {
        setPendingApprovals([]);
        setIsLoading(false);
        return;
      }

      // Get owner profiles
      const ownerIds = memberships.map((m: any) => m.syndic8_groups.owner_id);
      const { data: ownerProfiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", ownerIds);

      const ownerMap = new Map(
        ownerProfiles?.map((p) => [p.id, { name: p.full_name, avatar: p.avatar_url }]) || []
      );

      // Get member counts
      const groupIds = memberships.map((m: any) => m.group_id);
      const memberCounts = await Promise.all(
        groupIds.map(async (gId: string) => {
          const { count } = await supabase
            .from("syndic8_group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", gId);
          return { groupId: gId, count: count || 0 };
        })
      );
      const countMap = new Map(memberCounts.map(c => [c.groupId, c.count]));

      const formatted: PendingApproval[] = memberships.map((m: any) => {
        const owner = ownerMap.get(m.syndic8_groups.owner_id);
        return {
          membershipId: m.id,
          groupId: m.group_id,
          groupName: m.syndic8_groups.name,
          groupDescription: m.syndic8_groups.description,
          ownerName: owner?.name || "User",
          ownerAvatarUrl: owner?.avatar,
          memberCount: countMap.get(m.group_id) || 0,
          createdAt: m.syndic8_groups.created_at,
        };
      });

      setPendingApprovals(formatted);
    } catch (error: any) {
      console.error("Error fetching approvals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (approval: PendingApproval) => {
    setProcessingIds(prev => new Set([...prev, approval.membershipId]));
    try {
      const { error } = await supabase
        .from("syndic8_group_members")
        .update({
          has_approved_public: true,
          approved_at: new Date().toISOString(),
        })
        .eq("id", approval.membershipId);

      if (error) throw error;

      toast.success(`Approved public visibility for "${approval.groupName}"`);
      setPendingApprovals(prev => prev.filter(a => a.membershipId !== approval.membershipId));
    } catch (error: any) {
      toast.error(error.message || "Failed to approve");
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(approval.membershipId);
        return next;
      });
    }
  };

  const handleDecline = async (approval: PendingApproval) => {
    if (!confirm(`This will remove you from the "${approval.groupName}" council. Continue?`)) {
      return;
    }

    setProcessingIds(prev => new Set([...prev, approval.membershipId]));
    try {
      const { error } = await supabase
        .from("syndic8_group_members")
        .delete()
        .eq("id", approval.membershipId);

      if (error) throw error;

      toast.success(`Removed from "${approval.groupName}"`);
      setPendingApprovals(prev => prev.filter(a => a.membershipId !== approval.membershipId));
    } catch (error: any) {
      toast.error(error.message || "Failed to decline");
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(approval.membershipId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (pendingApprovals.length === 0) {
    return null; // Don't show anything if no pending approvals
  }

  return (
    <Card className="p-6 mb-6 border-amber-500/30 bg-amber-500/5">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-amber-600" />
        <h2 className="text-lg font-semibold">Public Visibility Requests</h2>
        <Badge variant="secondary">{pendingApprovals.length}</Badge>
      </div>

      <Alert className="mb-4">
        <Globe className="h-4 w-4" />
        <AlertTitle>What does approval mean?</AlertTitle>
        <AlertDescription>
          When you approve, the Syndic8 council you're part of can be made public in the directory. 
          Your profile will be visible as a council member.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        {pendingApprovals.map((approval) => {
          const isProcessing = processingIds.has(approval.membershipId);
          return (
            <div
              key={approval.membershipId}
              className="flex items-center gap-4 p-4 rounded-lg border bg-card"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={approval.ownerAvatarUrl || undefined} />
                <AvatarFallback>
                  {approval.ownerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{approval.groupName}</p>
                <p className="text-sm text-muted-foreground">
                  Created by {approval.ownerName}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>{approval.memberCount} members</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(approval)}
                  disabled={isProcessing}
                  className="text-destructive hover:text-destructive"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <><X className="w-4 h-4 mr-1" /> Decline</>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(approval)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <><Check className="w-4 h-4 mr-1" /> Approve</>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
