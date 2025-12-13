import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Loader2, Mail, User, Shield } from "lucide-react";

const claimSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
});

interface ClaimCoachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId: string;
  coachName: string;
  coachSlug: string;
}

export const ClaimCoachModal = ({
  open,
  onOpenChange,
  coachId,
  coachName,
  coachSlug,
}: ClaimCoachModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = claimSchema.safeParse({ fullName, email });
    
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Add to waitlist with coach claim info
      const { error } = await supabase
        .from("waitlist")
        .insert({
          full_name: fullName,
          email: email,
          coach_type: `claim:${coachSlug}:${coachId}`,
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Submitted",
            description: "This email has already submitted a claim request.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setSubmitted(true);
      toast({
        title: "Claim Request Submitted",
        description: "We'll verify your identity and send a confirmation email within 24-48 hours.",
      });
    } catch (error: any) {
      console.error("Claim submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit claim request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after close animation
    setTimeout(() => {
      setFullName("");
      setEmail("");
      setSubmitted(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Claim This Profile
          </DialogTitle>
          <DialogDescription>
            Are you {coachName}? Claim this PersonaBot profile to take control of your digital twin.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Request Submitted!</h3>
            <p className="text-muted-foreground text-sm">
              We'll verify your identity and send login credentials to your email within 24-48 hours.
            </p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="claim-name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="claim-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="claim-email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="claim-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                maxLength={255}
                required
              />
              <p className="text-xs text-muted-foreground">
                We'll send verification and login details to this email.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">What happens next?</p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-1 text-xs">
                <li>We verify your identity (24-48 hours)</li>
                <li>You receive login credentials via email</li>
                <li>You take full control of your PersonaBot</li>
              </ol>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
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
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Claim"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
