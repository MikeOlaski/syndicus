import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

interface MessageLimitBannerProps {
  coachId: string;
  onUpgrade?: () => void;
}

export const MessageLimitBanner = ({ coachId, onUpgrade }: MessageLimitBannerProps) => {
  const navigate = useNavigate();
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

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate("/pricing");
    }
  };

  // Prominent CTA when limit is exhausted
  if (isExhausted) {
    return (
      <div className="px-4 py-4 bg-destructive/10 border-t border-destructive/20">
        <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/20 rounded-full">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-destructive">Daily Message Limit Reached</p>
              <p className="text-sm text-muted-foreground">Upgrade to continue chatting with unlimited access</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUpgrade} className="bg-gradient-primary">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Plus - $7/mo
            </Button>
            <Button variant="outline" onClick={handleUpgrade}>
              View All Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Low messages warning
  return (
    <div className="px-4 py-2 flex items-center justify-between gap-2 text-sm bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-t border-yellow-500/20">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        <span>{remaining} message{remaining !== 1 ? 's' : ''} remaining today</span>
      </div>
      <Button size="sm" variant="outline" onClick={handleUpgrade} className="h-7 text-xs">
        <Zap className="w-3 h-3 mr-1" />
        Upgrade
      </Button>
    </div>
  );
};
