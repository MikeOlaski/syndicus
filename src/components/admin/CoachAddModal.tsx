import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, UserPlus } from "lucide-react";

interface CoachAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CoachAddModal = ({
  open,
  onOpenChange,
  onSuccess,
}: CoachAddModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    bio: "",
    specialization: "",
    hourlyRate: "",
    expertise: "",
    status: "admin_setup",
    isVerified: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.fullName) {
      toast({
        title: "Validation Error",
        description: "Email and Full Name are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const expertiseArray = formData.expertise
        ? formData.expertise.split(",").map((e) => e.trim()).filter(Boolean)
        : [];

      const response = await supabase.functions.invoke("create-coach", {
        body: {
          email: formData.email.trim(),
          fullName: formData.fullName.trim(),
          password: formData.password || undefined,
          bio: formData.bio || undefined,
          specialization: formData.specialization || undefined,
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
          expertise: expertiseArray.length > 0 ? expertiseArray : undefined,
          status: formData.status,
          isVerified: formData.isVerified,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to create coach");
      }

      toast({
        title: "Coach Created",
        description: `Successfully created coach account for ${formData.fullName}`,
      });

      // Reset form
      setFormData({
        email: "",
        fullName: "",
        password: "",
        bio: "",
        specialization: "",
        hourlyRate: "",
        expertise: "",
        status: "admin_setup",
        isVerified: false,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error creating coach:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create coach",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add New Coach
          </DialogTitle>
          <DialogDescription>
            Create a new coach account. An email will be sent with login credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Required Fields */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="coach@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">
                Temporary Password
                <span className="text-xs text-muted-foreground ml-2">
                  (auto-generated if empty)
                </span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave empty to auto-generate"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm">Profile Information</h4>

            <div className="grid gap-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                placeholder="e.g., Business Strategy, Life Coaching"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Brief description about the coach..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expertise">
                Expertise Tags
                <span className="text-xs text-muted-foreground ml-2">
                  (comma-separated)
                </span>
              </Label>
              <Input
                id="expertise"
                placeholder="Leadership, Strategy, Communication"
                value={formData.expertise}
                onChange={(e) =>
                  setFormData({ ...formData, expertise: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                placeholder="150"
                value={formData.hourlyRate}
                onChange={(e) =>
                  setFormData({ ...formData, hourlyRate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Status & Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm">Status & Settings</h4>

            <div className="grid gap-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin_setup">Admin Setup</SelectItem>
                  <SelectItem value="coach_claimed">Coach Claimed</SelectItem>
                  <SelectItem value="onboarding_started">Onboarding Started</SelectItem>
                  <SelectItem value="onboarding_completed">Onboarding Completed</SelectItem>
                  <SelectItem value="knowledge_base_setup">Knowledge Base Setup</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isVerified" className="cursor-pointer">
                Verified Coach
              </Label>
              <Switch
                id="isVerified"
                checked={formData.isVerified}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isVerified: checked })
                }
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Coach
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
