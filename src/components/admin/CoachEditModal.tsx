import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, MessageCircle, Save, Camera, Upload } from "lucide-react";
import { CoachChatModal } from "@/components/CoachChatModal";

interface Coach {
  id: string;
  user_id: string;
  bio: string | null;
  hourly_rate: number | null;
  is_verified: boolean;
  is_claimed: boolean;
  rating: number;
  total_sessions: number;
  expertise: string[] | null;
  specialization: string | null;
  personality: string | null;
  status: string;
  webhook_url?: string | null;
  profiles: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

interface CoachEditModalProps {
  coach: Coach | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export const CoachEditModal = ({ coach, open, onOpenChange, onSave }: CoachEditModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (coach) {
      setFullName(coach.profiles.full_name || "");
      setAvatarUrl(coach.profiles.avatar_url);
      setBio(coach.bio || "");
      setHourlyRate(coach.hourly_rate?.toString() || "");
      setSpecialization(coach.specialization || "");
      setPersonality(coach.personality || "");
      setStatus(coach.status as any || "admin_setup");
      setIsVerified(coach.is_verified);
      setExpertise(coach.expertise || []);
      setWebhookUrl(coach.webhook_url || "");
    }
  }, [coach]);

  const getInitials = (name: string | null) => {
    if (!name) return "C";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !coach) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${coach.user_id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', coach.user_id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
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

  const handleSaveWebhook = async () => {
    if (!coach) return;
    
    setIsSavingWebhook(true);
    try {
      const { error } = await supabase
        .from("coach_profiles")
        .update({ webhook_url: webhookUrl || null })
        .eq("id", coach.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Webhook URL saved successfully",
      });
    } catch (error: any) {
      console.error("Error saving webhook:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save webhook URL",
        variant: "destructive",
      });
    } finally {
      setIsSavingWebhook(false);
    }
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
    setChatModalOpen(true);
  };

  const handleSave = async () => {
    if (!coach) return;
    
    setIsLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", coach.user_id);

      if (profileError) throw profileError;

      // Update coach profile
      const { error: coachError } = await supabase
        .from("coach_profiles")
        .update({
          bio,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
          specialization,
          personality,
          status,
          is_verified: isVerified,
          expertise,
          webhook_url: webhookUrl || null,
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", coach.id);

      if (coachError) throw coachError;

      toast({
        title: "Success",
        description: "Coach profile updated successfully",
      });

      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating coach:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update coach profile",
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

  if (!coach) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
          <DialogTitle>Edit Coach Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Avatar Upload Section */}
          <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg border">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-background shadow-md">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {getInitials(fullName || coach.profiles.full_name)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <Label className="text-base font-semibold">Profile Photo</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Click the camera icon to upload a new photo. Max 5MB.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
              >
                <Upload className="h-4 w-4" />
                Upload Photo
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Coach name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Read-only)</Label>
            <Input
              id="email"
              value={coach.profiles.email}
              disabled
              className="bg-muted"
            />
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
                variant="outline"
                onClick={handleSaveWebhook}
                disabled={isSavingWebhook}
              >
                {isSavingWebhook ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="ml-2">Save</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleOpenChat}
                disabled={!webhookUrl.trim()}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="ml-2">Chat</span>
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <CoachChatModal
      open={chatModalOpen}
      onOpenChange={setChatModalOpen}
      coachName={fullName || coach.profiles.full_name || "Coach"}
      coachBio={bio}
      coachAvatar={avatarUrl}
      webhookUrl={webhookUrl}
      coachId={coach.id}
    />
  </>
  );
};