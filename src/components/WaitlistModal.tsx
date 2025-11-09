import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Mail, Sparkles } from "lucide-react";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const waitlistSchema = z.object({
  fullName: z.string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  coachType: z.string()
    .trim()
    .max(100, "Coach type must be less than 100 characters")
    .optional()
    .or(z.literal(""))
});

const WaitlistModal = ({ isOpen, onClose }: WaitlistModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      fullName: formData.get("full-name") as string,
      email: formData.get("email") as string,
      coachType: formData.get("coach-type") as string,
    };

    // Validate input
    const result = waitlistSchema.safeParse(data);

    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("waitlist")
        .insert({
          full_name: result.data.fullName,
          email: result.data.email,
          coach_type: result.data.coachType || null,
        });

      if (error) throw error;

      toast({
        title: "Success! 🎉",
        description: "You've been added to the waitlist. We'll notify you when PersonaBot creation launches.",
      });

      onClose();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Waitlist submission error:", error);
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
            Join the Waitlist
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-muted-foreground mb-6">
            Be the first to know when our PersonaBot creation wizard launches. We'll send you an email notification as soon as it's ready.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name *</Label>
              <Input
                id="full-name"
                name="full-name"
                placeholder="John Doe"
                maxLength={100}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                maxLength={255}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coach-type">Type of Coach/Expert (Optional)</Label>
              <Input
                id="coach-type"
                name="coach-type"
                placeholder="e.g., Leadership Coach, Business Consultant"
                maxLength={100}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Help us understand what kind of PersonaBot you're interested in creating
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Joining...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Join Waitlist
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistModal;
