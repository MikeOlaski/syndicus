import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, MessageCircle } from "lucide-react";
import { CoachChatModal } from "@/components/CoachChatModal";

interface CoachManualAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CoachManualAddModal = ({ open, onOpenChange, onSuccess }: CoachManualAddModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
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
  const [addCoachWebhookUrl, setAddCoachWebhookUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch the "Add Coach by Human" webhook URL on mount
  useEffect(() => {
    const fetchWebhook = async () => {
      const { data, error } = await supabase
        .from('webhook_endpoints')
        .select('url')
        .eq('name', 'add_coach_by_human')
        .single();
      
      if (data?.url) {
        setAddCoachWebhookUrl(data.url);
      }
    };
    if (open) {
      fetchWebhook();
    }
  }, [open]);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhoneNumber("");
    setLocation("");
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
    // Validate full name
    if (!fullName.trim()) {
      toast({
        title: "Error",
        description: "Full name is required",
        variant: "destructive",
      });
      return;
    }

    // Validate email OR phone required
    if (!email.trim() && !phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Either email or phone number is required",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation only if email is provided
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({
          title: "Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }
    }

    // Basic phone validation if provided
    if (phoneNumber.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
      if (!phoneRegex.test(phoneNumber)) {
        toast({
          title: "Error",
          description: "Please enter a valid phone number",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsLoading(true);
    
    const formData = {
      fullName: fullName.trim(),
      email: email.trim() || null,
      phoneNumber: phoneNumber.trim() || null,
      location: location.trim() || null,
      bio: bio.trim() || null,
      specialization: specialization.trim() || null,
      personality: personality.trim() || null,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      expertise: expertise.length > 0 ? expertise : null,
      status: status,
      isVerified: isVerified,
      webhookUrl: webhookUrl.trim() || null,
    };

    try {
      // First, call the "Add Coach by Human" webhook if configured
      if (addCoachWebhookUrl) {
        try {
          const webhookResponse = await fetch(addCoachWebhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            mode: "cors",
            body: JSON.stringify({
              ...formData,
              timestamp: new Date().toISOString(),
              triggered_from: window.location.origin,
            }),
          });

          // Check if webhook returned an error
          if (!webhookResponse.ok) {
            const errorText = await webhookResponse.text();
            throw new Error(`Webhook failed: ${errorText || webhookResponse.statusText}`);
          }

          // Try to parse the response
          const webhookResult = await webhookResponse.json().catch(() => ({}));
          
          // Check for explicit failure in response
          if (webhookResult.success === false || webhookResult.error) {
            throw new Error(webhookResult.error || webhookResult.message || "Webhook returned an error");
          }
        } catch (webhookError: any) {
          console.error("Webhook error:", webhookError);
          toast({
            title: "Webhook Error",
            description: webhookError.message || "Failed to process with external webhook. Coach was not created.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // If webhook succeeded (or no webhook configured), create the coach
      const { data, error } = await supabase.functions.invoke('create-coach', {
        body: formData,
      });

      // Check for error in response data (edge function returns error in body)
      if (error) {
        throw new Error(error.message || 'Failed to create coach');
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }

      const coachProfileId = data?.coachProfileId;
      setCreatedCoachId(coachProfileId || null);

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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coach@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">* Email or Phone Number is required</p>

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