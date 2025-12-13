import { AlertCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface GuestMessageBannerProps {
  messagesRemaining: number;
  isGuest: boolean;
}

export const GuestMessageBanner = ({ messagesRemaining, isGuest }: GuestMessageBannerProps) => {
  const navigate = useNavigate();

  if (!isGuest || messagesRemaining > 2) return null;

  const isExhausted = messagesRemaining === 0;

  return (
    <div className={`px-4 py-2 flex items-center justify-between gap-2 text-sm ${
      isExhausted 
        ? "bg-destructive/10 text-destructive border-t border-destructive/20" 
        : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-t border-yellow-500/20"
    }`}>
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        {isExhausted ? (
          <span>Free messages used. Sign up to continue chatting!</span>
        ) : (
          <span>{messagesRemaining} free message{messagesRemaining !== 1 ? 's' : ''} remaining</span>
        )}
      </div>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => navigate("/auth?tab=signup")} 
        className="h-7 text-xs"
      >
        <UserPlus className="w-3 h-3 mr-1" />
        Sign Up Free
      </Button>
    </div>
  );
};
