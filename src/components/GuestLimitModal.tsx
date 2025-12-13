import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, UserPlus, LogIn, Sparkles } from "lucide-react";

interface GuestLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachName?: string;
}

export const GuestLimitModal = ({ open, onOpenChange, coachName }: GuestLimitModalProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Free Messages Used</DialogTitle>
          <DialogDescription className="text-center pt-2">
            You've used all 5 free guest messages{coachName ? ` with ${coachName}` : ""}. 
            Create a free account to continue chatting and unlock more features!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Free Account Benefits
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 5 messages per day with up to 3 coaches</li>
              <li>• Save your conversation history</li>
              <li>• Access to coach directory</li>
              <li>• Create Syndic8 groups</li>
            </ul>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={() => navigate("/auth?tab=signup")}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create Free Account
          </Button>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/auth?tab=login")}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Already have an account? Log in
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-2">
            Want unlimited messages?{" "}
            <button 
              className="text-primary hover:underline"
              onClick={() => navigate("/pricing")}
            >
              View pricing plans
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
