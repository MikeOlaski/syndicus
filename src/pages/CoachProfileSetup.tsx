import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("coach_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          bio: data.bio || "",
          specialization: data.specialization || "",
          personality: data.personality || "",
          expertise: data.expertise || [],
          hourly_rate: data.hourly_rate || null,
          status: data.status || "admin_setup"
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  return (
    <DashboardLayout requiredRole="coach">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Coach Profile & Onboarding</h1>
          <p className="text-muted-foreground">
            Complete your profile to set up your digital twin and start coaching.
          </p>
        </div>

        {/* Onboarding Progress */}
        <Card className="p-6 mb-8">
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
                <div>
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell potential subscribers about your background, experience, and coaching philosophy..."
                    value={profile.bio || ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="min-h-[150px] mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This will be displayed on your public profile.
                  </p>
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
                  <p className="text-sm text-muted-foreground mt-1">
                    These instructions will guide how your AI digital twin interacts with subscribers.
                  </p>
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
    </DashboardLayout>
  );
};

export default CoachProfileSetup;
