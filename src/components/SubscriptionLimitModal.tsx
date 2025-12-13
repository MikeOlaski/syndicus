import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Zap, Crown } from "lucide-react";

interface SubscriptionLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier?: string;
}

export const SubscriptionLimitModal = ({ open, onOpenChange, tier = "free" }: SubscriptionLimitModalProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <DialogTitle className="text-xl">Daily Limit Reached</DialogTitle>
          <DialogDescription className="text-center pt-2">
            You've used all your daily messages for today. 
            Upgrade your plan to continue chatting!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              Upgrade Benefits
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Plus: 50 messages per day ($7/month)</li>
              <li>• Prime: Unlimited messages ($27/month)</li>
              <li>• Access to more coaches</li>
              <li>• Priority support</li>
            </ul>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={() => {
              onOpenChange(false);
              navigate("/pricing");
            }}
          >
            <Zap className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-2">
            Your messages will reset at midnight.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};