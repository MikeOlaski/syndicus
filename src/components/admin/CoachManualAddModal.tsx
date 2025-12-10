import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, MessageCircle, Save } from "lucide-react";
import { CoachChatModal } from "./CoachChatModal";

interface CoachManualAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CoachManualAddModal = ({ open, onOpenChange, onSuccess }: CoachManualAddModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [personality, setPersonality] = useState("");
  const [status, setStatus] = useState<"admin_setup" | "coach_claimed" | "onboarding_started" | "onboarding_completed" | "knowledge_base_setup" | "active" | "inactive">("admin_setup");
  const [isVerified, setIsVerified] = useState(false);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [createdCoachId, setCreatedCoachId] = useState<string | null>(null);
  const { toast } = useToast();

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setBio("");
    setHourlyRate("");
    setSpecialization("");
    setPersonality("");
    setStatus("admin_setup");
    setIsVerified(false);
    setExpertise([]);
    setExpertiseInput("");
    setWebhookUrl("");
    setCreatedCoachId(null);
  };

  const handleAddExpertise = () => {
    if (expertiseInput.trim() && !expertise.includes(expertiseInput.trim())) {
      setExpertise([...expertise, expertiseInput.trim()]);
      setExpertiseInput("");
    }
  };

  const handleRemoveExpertise = (item: string) => {
    setExpertise(expertise.filter(e => e !== item));
  };

  const handleOpenChat = () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL first",
        variant: "destructive",
      });
      return;
    }
    if (!createdCoachId) {
      toast({
        title: "Error",
        description: "Please save the coach first before testing chat",
        variant: "destructive",
      });
      return;
    }
    setChatModalOpen(true);
  };

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      toast({
        title: "Error",
        description: "Full name and email are required",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Call the create-coach edge function
      const { data, error } = await supabase.functions.invoke('create-coach', {
        body: {
          email: email.trim(),
          fullName: fullName.trim(),
          bio: bio || undefined,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
          expertise: expertise.length > 0 ? expertise : undefined,
        },
      });

      if (error) throw error;

      const coachProfileId = data?.coachProfileId;

      // If we got a coach profile ID, update additional fields
      if (coachProfileId) {
        setCreatedCoachId(coachProfileId);
        
        const { error: updateError } = await supabase
          .from("coach_profiles")
          .update({
            specialization,
            personality,
            status,
            is_verified: isVerified,
            webhook_url: webhookUrl || null,
          })
          .eq("id", coachProfileId);

        if (updateError) {
          console.error("Error updating additional fields:", updateError);
        }
      }

      toast({
        title: "Success",
        description: "Coach created successfully",
      });

      resetForm();
      onSuccess();
      onOpenChange(false);
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

  const statusOptions = [
    { value: "admin_setup", label: "Admin Setup" },
    { value: "coach_claimed", label: "Coach Claimed" },
    { value: "onboarding_started", label: "Onboarding Started" },
    { value: "onboarding_completed", label: "Onboarding Completed" },
    { value: "knowledge_base_setup", label: "Knowledge Base Setup" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={(value) => {
        if (!value) resetForm();
        onOpenChange(value);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Coach</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Coach name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coach@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Account Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isVerified"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="isVerified" className="cursor-pointer">
                Verified Coach
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Coach biography"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="150"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Executive Coaching"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personality">Personality/Approach</Label>
              <Textarea
                id="personality"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="Describe coaching style and personality"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Expertise Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise())}
                  placeholder="Add expertise tag"
                />
                <Button type="button" onClick={handleAddExpertise}>
                  Add
                </Button>
              </div>
              {expertise.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {expertise.map((item, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {item}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => handleRemoveExpertise(item)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Webhook URL Section */}
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg border">
              <Label htmlFor="webhookUrl" className="text-base font-semibold">
                n8n Webhook URL
              </Label>
              <p className="text-sm text-muted-foreground">
                Connect this coach to an n8n chat agent workflow
              </p>
              <div className="flex gap-2">
                <Input
                  id="webhookUrl"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-n8n-instance.com/webhook/..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleOpenChat}
                  disabled={!webhookUrl.trim() || !createdCoachId}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="ml-2">Chat</span>
                </Button>
              </div>
              {!createdCoachId && webhookUrl.trim() && (
                <p className="text-xs text-muted-foreground">
                  Save the coach first to test the chat functionality
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Coach
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {createdCoachId && (
        <CoachChatModal
          open={chatModalOpen}
          onOpenChange={setChatModalOpen}
          coachName={fullName || "Coach"}
          coachBio={bio}
          coachAvatar={null}
          webhookUrl={webhookUrl}
          coachId={createdCoachId}
        />
      )}
    </>
  );
};
