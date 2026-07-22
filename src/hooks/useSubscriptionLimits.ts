import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionLimits {
  max_coaches: number;
  max_syndic8_groups: number;
  max_coaches_per_group: number;
  daily_messages: number;
  modality: string;
}

interface SubscriptionStatus {
  tier: "free" | "plus" | "prime";
  limits: SubscriptionLimits;
  activeSubscriptions: number;
  syndic8Groups: number;
  canSubscribeToMore: boolean;
  canCreateMoreGroups: boolean;
}

const DEFAULT_LIMITS: SubscriptionLimits = {
  max_coaches: 3,
  max_syndic8_groups: 1,
  max_coaches_per_group: 2,
  daily_messages: 5,
  modality: "text",
};

export const useSubscriptionLimits = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      // Get user's tier
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscriber_tier")
        .eq("id", session.user.id)
        .single();

      const tier = (profile?.subscriber_tier || "free") as "free" | "plus" | "prime";

      // Get limits based on tier (matching database function)
      const limits: SubscriptionLimits = 
        tier === "prime" 
          ? { max_coaches: 17, max_syndic8_groups: 2, max_coaches_per_group: 8, daily_messages: 999, modality: "all" }
          : tier === "plus"
          ? { max_coaches: 5, max_syndic8_groups: 1, max_coaches_per_group: 8, daily_messages: 50, modality: "text" }
          : DEFAULT_LIMITS;

      // Count active subscriptions
      const { count: subscriptionCount } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("subscriber_id", session.user.id)
        .eq("status", "active");

      // Count Syndic8 groups
      const { count: groupCount } = await supabase
        .from("syndic8_groups")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", session.user.id);

      setStatus({
        tier,
        limits,
        activeSubscriptions: subscriptionCount || 0,
        syndic8Groups: groupCount || 0,
        canSubscribeToMore: (subscriptionCount || 0) < limits.max_coaches,
        canCreateMoreGroups: (groupCount || 0) < limits.max_syndic8_groups,
      });
    } catch (error: any) {
      console.error("Error fetching subscription status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDailyMessageLimit = async (coachId: string): Promise<{ canSend: boolean; remaining: number }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { canSend: false, remaining: 0 };

      const today = new Date().toISOString().split("T")[0];

      // Read-only check of current usage
      const { data: usage } = await supabase
        .from("daily_message_usage")
        .select("message_count")
        .eq("user_id", session.user.id)
        .eq("coach_id", coachId)
        .eq("message_date", today)
        .single();

      const currentCount = usage?.message_count || 0;
      const limit = status?.limits.daily_messages || DEFAULT_LIMITS.daily_messages;
      const remaining = Math.max(0, limit - currentCount);

      return { canSend: remaining > 0, remaining };
    } catch (error) {
      // No record means no messages sent today
      return { canSend: true, remaining: status?.limits.daily_messages || DEFAULT_LIMITS.daily_messages };
    }
  };

  const incrementMessageCount = async (coachId: string): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      // Use server-side RPC to atomically increment (prevents client manipulation)
      const { data, error } = await supabase.rpc("increment_daily_message_usage", {
        p_coach_id: coachId,
      });

      if (error) {
        console.error("Error incrementing message count:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error incrementing message count:", error);
      return false;
    }
  };

  const subscribeToCoach = async (coachId: string): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Please sign in",
          description: "You need to be logged in to subscribe to coaches.",
          variant: "destructive",
        });
        return false;
      }

      // Fresh server-side check to prevent race conditions
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscriber_tier")
        .eq("id", session.user.id)
        .single();

      const tier = (profile?.subscriber_tier || "free") as "free" | "plus" | "prime";
      const maxCoaches = tier === "prime" ? 17 : tier === "plus" ? 5 : 3;

      const { count: currentCount } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("subscriber_id", session.user.id)
        .eq("status", "active");

      if ((currentCount || 0) >= maxCoaches) {
        toast({
          title: "Subscription limit reached",
          description: `Your ${tier} plan allows ${maxCoaches} coaches. Upgrade to subscribe to more!`,
          variant: "destructive",
        });
        return false;
      }

      // Check if already subscribed
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("subscriber_id", session.user.id)
        .eq("coach_id", coachId)
        .eq("status", "active")
        .single();

      if (existing) {
        toast({
          title: "Already subscribed",
          description: "You're already subscribed to this coach.",
        });
        return false;
      }

      const { error } = await supabase
        .from("subscriptions")
        .insert({
          subscriber_id: session.user.id,
          coach_id: coachId,
          status: "active",
        });

      if (error) throw error;

      toast({
        title: "Subscribed!",
        description: "You can now chat with this coach's AI twin.",
      });

      await fetchStatus();
      return true;
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const unsubscribeFromCoach = async (coachId: string): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("subscriber_id", session.user.id)
        .eq("coach_id", coachId);

      if (error) throw error;

      toast({
        title: "Unsubscribed",
        description: "You've unsubscribed from this coach.",
      });

      await fetchStatus();
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const isSubscribedToCoach = async (coachId: string): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const { data } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("subscriber_id", session.user.id)
        .eq("coach_id", coachId)
        .eq("status", "active")
        .single();

      return !!data;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return {
    status,
    isLoading,
    subscribeToCoach,
    unsubscribeFromCoach,
    isSubscribedToCoach,
    checkDailyMessageLimit,
    incrementMessageCount,
    refetch: fetchStatus,
  };
};
