import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  User, 
  Target, 
  Sparkles,
  Loader2,
  Brain,
  Briefcase,
  Heart,
  Lightbulb,
  TrendingUp,
  Users
} from "lucide-react";

const INTEREST_OPTIONS = [
  { id: "business", label: "Business Growth", icon: TrendingUp },
  { id: "leadership", label: "Leadership", icon: Users },
  { id: "mindset", label: "Mindset & Motivation", icon: Brain },
  { id: "career", label: "Career Development", icon: Briefcase },
  { id: "wellness", label: "Health & Wellness", icon: Heart },
  { id: "creativity", label: "Creativity & Innovation", icon: Lightbulb },
  { id: "relationships", label: "Relationships", icon: Users },
  { id: "productivity", label: "Productivity", icon: Target },
];

const GOAL_OPTIONS = [
  "Get personalized coaching advice",
  "Learn from expert digital twins",
  "Improve specific skills",
  "Get accountability support",
  "Explore new perspectives",
  "Build better habits",
];

const SubscriberOnboarding = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      
      // Pre-fill display name from profile if available
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();
      
      if (profile?.full_name) {
        setDisplayName(profile.full_name);
      }
      
      setCheckingSession(false);
    };
    checkSession();
  }, [navigate]);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(i => i !== interestId)
        : [...prev, interestId]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleNext = () => {
    if (step === 1 && !displayName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your display name to continue.",
        variant: "destructive",
      });
      return;
    }
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Update profile with onboarding data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: displayName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Store onboarding preferences in localStorage for now
      // Future: could create a subscriber_preferences table
      localStorage.setItem(`subscriber_preferences_${userId}`, JSON.stringify({
        bio,
        interests: selectedInterests,
        goals: selectedGoals,
        onboardingCompleted: true,
        completedAt: new Date().toISOString(),
      }));

      toast({
        title: "Welcome aboard! 🎉",
        description: "Your profile is all set. Let's explore some coaches!",
      });

      navigate("/subscriber-dashboard");
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Syndic.us</h1>
                <p className="text-xs text-muted-foreground">Complete your profile</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Main content */}
      <div className="flex-1 container mx-auto px-6 py-12 max-w-2xl">
        {/* Step 1: Profile basics */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Let's get to know you</h2>
              <p className="text-muted-foreground">
                Tell us a bit about yourself so we can personalize your experience
              </p>
            </div>

            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  placeholder="How should we call you?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Short Bio (optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell coaches a bit about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  This helps coaches understand your background
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">What interests you?</h2>
              <p className="text-muted-foreground">
                Select topics you'd like to explore with our coaches
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {INTEREST_OPTIONS.map((interest) => {
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <interest.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{interest.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedInterests.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedInterests.map(id => {
                  const interest = INTEREST_OPTIONS.find(i => i.id === id);
                  return interest && (
                    <Badge key={id} variant="secondary">
                      {interest.label}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">What are your goals?</h2>
              <p className="text-muted-foreground">
                Help us understand what you want to achieve
              </p>
            </div>

            <div className="space-y-3">
              {GOAL_OPTIONS.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <span className="font-medium">{goal}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground/30"
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Summary */}
            <Card className="p-6 bg-muted/50">
              <h3 className="font-semibold mb-3">Your Profile Summary</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Name:</span> {displayName}</p>
                {bio && <p><span className="text-muted-foreground">Bio:</span> {bio}</p>}
                {selectedInterests.length > 0 && (
                  <p>
                    <span className="text-muted-foreground">Interests:</span>{" "}
                    {selectedInterests.map(id => INTEREST_OPTIONS.find(i => i.id === id)?.label).join(", ")}
                  </p>
                )}
                {selectedGoals.length > 0 && (
                  <p>
                    <span className="text-muted-foreground">Goals:</span>{" "}
                    {selectedGoals.join(", ")}
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className={step === 1 ? "invisible" : ""}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button onClick={handleNext}>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Complete Setup
            </Button>
          )}
        </div>

        {/* Skip option */}
        {step < totalSteps && (
          <div className="text-center mt-4">
            <button 
              onClick={() => setStep(totalSteps)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriberOnboarding;
