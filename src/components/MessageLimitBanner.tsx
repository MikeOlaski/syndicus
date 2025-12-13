import { useState, useEffect } from "react";
import { AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

interface MessageLimitBannerProps {
  coachId: string;
  onUpgrade?: () => void;
}

export const MessageLimitBanner = ({ coachId, onUpgrade }: MessageLimitBannerProps) => {
  const [remaining, setRemaining] = useState<number | null>(null);
  const { checkDailyMessageLimit, status } = useSubscriptionLimits();

  useEffect(() => {
    const checkLimit = async () => {
      const { remaining } = await checkDailyMessageLimit(coachId);
      setRemaining(remaining);
    };
    checkLimit();
  }, [coachId]);

  if (remaining === null || status?.tier !== "free") return null;

  const isLow = remaining <= 2;
  const isExhausted = remaining === 0;

  if (remaining > 2) return null;

  return (
    <div className={`px-4 py-2 flex items-center justify-between gap-2 text-sm ${
      isExhausted 
        ? "bg-destructive/10 text-destructive border-t border-destructive/20" 
        : isLow 
        ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-t border-yellow-500/20"
        : ""
    }`}>
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        {isExhausted ? (
          <span>Daily message limit reached. Upgrade for more messages!</span>
        ) : (
          <span>{remaining} message{remaining !== 1 ? 's' : ''} remaining today</span>
        )}
      </div>
      {onUpgrade && (
        <Button size="sm" variant="outline" onClick={onUpgrade} className="h-7 text-xs">
          <Zap className="w-3 h-3 mr-1" />
          Upgrade
        </Button>
      )}
    </div>
  );
};
