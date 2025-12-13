import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Circle, Camera, Upload, Sparkles, PanelRightClose, PanelRightOpen, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIProfileAssistant } from "@/components/AIProfileAssistant";

interface CoachProfile {
  bio: string | null;
  specialization: string | null;
  personality: string | null;
  expertise: string[] | null;
  hourly_rate: number | null;
  status: "admin_setup" | "coach_claimed" | "onboarding_started" | "onboarding_completed" | "knowledge_base_setup" | "active" | "inactive";
}

const CoachProfileSetup = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<CoachProfile>({
    bio: "",
    specialization: "",
    personality: "",
    expertise: [],
    hourly_rate: null,
    status: "admin_setup"
  });
  const [expertiseInput, setExpertiseInput] = useState("");
  const [currentTab, setCurrentTab] = useState("overview");
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // Fetch user profile for name and avatar
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (userProfile) {
        setFullName(userProfile.full_name || "");
        setAvatarUrl(userProfile.avatar_url);
      }

      const { data, error } = await supabase
        .from("coach_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching coach profile:", error);
        throw error;
      }

      if (data) {
        setProfile({
          bio: data.bio || "",
          specialization: data.specialization || "",
          personality: data.personality || "",
          expertise: data.expertise || [],
          hourly_rate: data.hourly_rate || null,
          status: data.status || "admin_setup"
        });
      } else {
        // No coach profile found - user might not have coach setup yet
        console.log("No coach profile found for user");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Only show error if it's not a "no rows" error
      if ((error as any)?.code !== 'PGRST116') {
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
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
    if (!file || !userId) return;

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
      const fileName = `${userId}/avatar.${fileExt}`;

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
        .eq('id', userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Determine new status based on completion
      let newStatus = profile.status;
      if (profile.status === "admin_setup" || profile.status === "coach_claimed") {
        newStatus = "onboarding_started";
      }
      if (profile.bio && profile.specialization && profile.personality && 
          profile.expertise && profile.expertise.length > 0 && profile.hourly_rate) {
        newStatus = "onboarding_completed";
      }

      const { error } = await supabase
        .from("coach_profiles")
        .update({
          bio: profile.bio,
          specialization: profile.specialization,
          personality: profile.personality,
          expertise: profile.expertise,
          hourly_rate: profile.hourly_rate,
          status: newStatus,
          last_activity_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile({ ...profile, status: newStatus });

      toast({
        title: "Success",
        description: "Profile saved successfully"
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addExpertise = () => {
    if (expertiseInput.trim() && profile.expertise) {
      setProfile({
        ...profile,
        expertise: [...profile.expertise, expertiseInput.trim()]
      });
      setExpertiseInput("");
    }
  };

  const removeExpertise = (index: number) => {
    if (profile.expertise) {
      setProfile({
        ...profile,
        expertise: profile.expertise.filter((_, i) => i !== index)
      });
    }
  };

  const getOnboardingSteps = () => {
    const steps = [
      { id: "admin_setup", label: "Admin Setup", completed: true },
      { id: "coach_claimed", label: "Account Claimed", completed: profile.status !== "admin_setup" },
      { id: "onboarding_started", label: "Onboarding Started", completed: ["onboarding_started", "onboarding_completed", "knowledge_base_setup", "active"].includes(profile.status) },
      { id: "onboarding_completed", label: "Onboarding Complete", completed: ["onboarding_completed", "knowledge_base_setup", "active"].includes(profile.status) },
      { id: "knowledge_base_setup", label: "Digital Twin Setup", completed: ["knowledge_base_setup", "active"].includes(profile.status) },
      { id: "active", label: "Active", completed: profile.status === "active" }
    ];
    return steps;
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="coach">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const handleApplyAIContent = (type: "bio" | "specialization" | "expertise" | "personality", content: string | string[]) => {
    if (type === "expertise" && Array.isArray(content)) {
      setProfile(prev => ({
        ...prev,
        expertise: [...(prev.expertise || []), ...content.filter(t => !prev.expertise?.includes(t))]
      }));
    } else if (typeof content === "string") {
      setProfile(prev => ({ ...prev, [type]: content }));
    }
  };

  const generateField = async (fieldType: "bio" | "specialization" | "expertise" | "personality") => {
    setGeneratingField(fieldType);
    
    const prompts = {
      bio: "Generate a professional bio for my coaching profile based on my current profile information.",
      specialization: "Suggest a primary specialization for my coaching profile based on my expertise and background.",
      expertise: "Generate relevant expertise tags for my coaching profile.",
      personality: "Generate a personality and coaching style description for my digital twin."
    };

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-coach-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompts[fieldType] }],
          currentProfile: profile,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate content");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullContent += content;
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Parse the generated content
      const patterns: Record<string, RegExp> = {
        bio: /\[GENERATED_BIO\]([\s\S]*?)\[\/GENERATED_BIO\]/,
        specialization: /\[GENERATED_SPECIALIZATION\]([\s\S]*?)\[\/GENERATED_SPECIALIZATION\]/,
        expertise: /\[GENERATED_EXPERTISE\]([\s\S]*?)\[\/GENERATED_EXPERTISE\]/,
        personality: /\[GENERATED_PERSONALITY\]([\s\S]*?)\[\/GENERATED_PERSONALITY\]/,
      };

      const match = patterns[fieldType].exec(fullContent);
      if (match) {
        const content = match[1].trim();
        if (fieldType === "expertise") {
          const tags = content.split(",").map(t => t.trim()).filter(Boolean);
          setProfile(prev => ({
            ...prev,
            expertise: [...(prev.expertise || []), ...tags.filter(t => !prev.expertise?.includes(t))]
          }));
        } else {
          setProfile(prev => ({ ...prev, [fieldType]: content }));
        }
        toast({ title: "Generated!", description: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} has been updated.` });
      } else {
        toast({ title: "No content generated", description: "Try opening the AI assistant for more guidance.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error generating field:", error);
      toast({ title: "Error", description: "Failed to generate content", variant: "destructive" });
    } finally {
      setGeneratingField(null);
    }
  };

  return (
    <DashboardLayout requiredRole="coach">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Coach Profile & Onboarding</h1>
            <p className="text-muted-foreground">
              Complete your profile to set up your digital twin and start coaching.
            </p>
          </div>
          <Button 
            variant={showAIAssistant ? "default" : "outline"} 
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {showAIAssistant ? "Hide AI Assistant" : "AI Profile Assistant"}
            {showAIAssistant ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </Button>
        </div>

        <div className={`grid gap-6 ${showAIAssistant ? "lg:grid-cols-[1fr,400px]" : ""}`}>
          <div className="space-y-6">
            {/* Onboarding Progress */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Onboarding Progress</h2>
              <div className="flex items-center gap-2 flex-wrap">
                {getOnboardingSteps().map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex items-center gap-2">
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span className={step.completed ? "text-foreground" : "text-muted-foreground"}>
                        {step.label}
                      </span>
                    </div>
                    {index < getOnboardingSteps().length - 1 && (
                      <div className="w-8 h-0.5 bg-border mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="expertise">Expertise</TabsTrigger>
                <TabsTrigger value="personality">Personality & Style</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
              </TabsList>

          <TabsContent value="overview">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Profile Overview</h2>
              
              <div className="space-y-6">
                {/* Avatar Upload Section */}
                <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg border">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-2 border-background shadow-md">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {getInitials(fullName)}
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

                <div>
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell potential subscribers about your background, experience, and coaching philosophy..."
                    value={profile.bio || ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="min-h-[150px] mt-2"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-muted-foreground">
                      This will be displayed on your public profile.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generateField("bio")}
                      disabled={generatingField !== null}
                      className="gap-2"
                    >
                      {generatingField === "bio" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      Generate
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialization">Primary Specialization</Label>
                  <Input
                    id="specialization"
                    placeholder="e.g., Executive Leadership, Career Transition, Life Coach"
                    value={profile.specialization || ""}
                    onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                    className="mt-2"
                  />
                  <div className="flex justify-end mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generateField("specialization")}
                      disabled={generatingField !== null}
                      className="gap-2"
                    >
                      {generatingField === "specialization" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="expertise">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Areas of Expertise</h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Add Expertise Tags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="e.g., Leadership, Communication, Strategy"
                      value={expertiseInput}
                      onChange={(e) => setExpertiseInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addExpertise()}
                    />
                    <Button onClick={addExpertise} variant="secondary">Add</Button>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generateField("expertise")}
                      disabled={generatingField !== null}
                      className="gap-2"
                    >
                      {generatingField === "expertise" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      Generate Tags
                    </Button>
                  </div>
                </div>

                {profile.expertise && profile.expertise.length > 0 && (
                  <div>
                    <Label>Your Expertise</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.expertise.map((exp, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {exp}
                          <button
                            onClick={() => removeExpertise(index)}
                            className="ml-2 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="personality">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Coaching Personality & Style</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="personality">Digital Twin Personality Instructions</Label>
                  <Textarea
                    id="personality"
                    placeholder="Describe your coaching style, communication approach, and how your digital twin should interact with subscribers. For example: 'I use a direct, action-oriented approach with empathy. I ask probing questions and provide concrete frameworks.'"
                    value={profile.personality || ""}
                    onChange={(e) => setProfile({ ...profile, personality: e.target.value })}
                    className="min-h-[200px] mt-2"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-muted-foreground">
                      These instructions will guide how your AI digital twin interacts with subscribers.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generateField("personality")}
                      disabled={generatingField !== null}
                      className="gap-2"
                    >
                      {generatingField === "personality" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Pricing</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate (USD)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    placeholder="150"
                    value={profile.hourly_rate || ""}
                    onChange={(e) => setProfile({ ...profile, hourly_rate: parseFloat(e.target.value) || null })}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This is your standard hourly coaching rate.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

            <div className="flex justify-end gap-4 mt-6">
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Profile
              </Button>
            </div>
          </div>

          {/* AI Assistant Panel */}
          {showAIAssistant && (
            <div className="lg:sticky lg:top-6 lg:self-start">
              <AIProfileAssistant 
                currentProfile={profile}
                onApplyContent={handleApplyAIContent}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoachProfileSetup;
