import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Brain } from "lucide-react";

interface RoleSelectionProps {
  onSelectRole: (role: "subscriber" | "coach") => void;
}

export const RoleSelection = ({ onSelectRole }: RoleSelectionProps) => {
  return (
    <div className="grid gap-4">
      <Card className="p-6 hover:border-primary transition-colors cursor-pointer group">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">I'm a Subscriber</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Access expert coaches' digital twins and get personalized guidance anytime
            </p>
          </div>
          <Button
            onClick={() => onSelectRole("subscriber")}
            className="w-full"
            size="lg"
          >
            Continue as Subscriber
          </Button>
        </div>
      </Card>

      <Card className="p-6 hover:border-secondary transition-colors cursor-pointer group">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
            <Brain className="w-8 h-8 text-secondary" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">I'm a Coach</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create or claim your digital twin and scale your coaching impact
            </p>
          </div>
          <Button
            onClick={() => onSelectRole("coach")}
            variant="secondary"
            className="w-full"
            size="lg"
          >
            Continue as Coach
          </Button>
        </div>
      </Card>
    </div>
  );
};
