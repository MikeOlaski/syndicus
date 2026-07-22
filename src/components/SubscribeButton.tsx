import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserMinus, Loader2, Lock, Crown } from "lucide-react";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { supabase } from "@/integrations/supabase/client";

interface SubscribeButtonProps {
  coachId: string;
  coachName?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showStatus?: boolean;
  className?: string;
}

export const SubscribeButton = ({
  coachId,
  coachName = "this coach",
  variant = "default",
  size = "default",
  showStatus = true,
  className = "",
}: SubscribeButtonProps) => {
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const {
    status,
    subscribeToCoach,
    unsubscribeFromCoach,
    isSubscribedToCoach,
  } = useSubscriptionLimits();

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      if (session) {
        const subscribed = await isSubscribedToCoach(coachId);
        setIsSubscribed(subscribed);
      }
      setIsChecking(false);
    };

    checkStatus();
  }, [coachId]);

  const handleClick = async () => {
    if (!isLoggedIn) {
      // Redirect to auth
      window.location.href = "/auth";
      return;
    }

    // If limit reached and not subscribed, redirect to pricing
    if (!canSubscribe && !isSubscribed) {
      navigate("/pricing");
      return;
    }

    setIsProcessing(true);
    if (isSubscribed) {
      const success = await unsubscribeFromCoach(coachId);
      if (success) setIsSubscribed(false);
    } else {
      const success = await subscribeToCoach(coachId);
      if (success) setIsSubscribed(true);
    }
    setIsProcessing(false);
  };

  const canSubscribe = !isSubscribed && (status?.canSubscribeToMore ?? true);
  const isLimitReached = !isSubscribed && !canSubscribe && isLoggedIn;

  if (isChecking) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  // isLimitReached buttons should NOT be disabled - they navigate to pricing
  const isDisabled = isProcessing;

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant={isSubscribed ? "outline" : isLimitReached ? "destructive" : variant}
        size={size}
        onClick={handleClick}
        disabled={isDisabled}
        className={`${className} ${isSubscribed ? "border-primary text-primary" : ""}`}
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : isSubscribed ? (
          <UserMinus className="w-4 h-4 mr-2" />
        ) : !isLoggedIn ? (
          <Lock className="w-4 h-4 mr-2" />
        ) : isLimitReached ? (
          <Crown className="w-4 h-4 mr-2" />
        ) : (
          <UserPlus className="w-4 h-4 mr-2" />
        )}
        {isSubscribed 
          ? "Subscribed" 
          : !isLoggedIn 
          ? "Sign in to Subscribe"
          : isLimitReached 
          ? "Limit Reached - Upgrade" 
          : "Subscribe"}
      </Button>
      
      {showStatus && isLoggedIn && status && (
        <div className="flex items-center gap-2 justify-center">
          <Badge variant="outline" className="text-xs">
            {status.activeSubscriptions}/{status.limits.max_coaches} coaches
          </Badge>
          {status.tier === "free" && (
            <Badge variant="secondary" className="text-xs">
              Free
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
