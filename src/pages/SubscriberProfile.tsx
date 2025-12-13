import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Camera, 
  Save, 
  Loader2, 
  Crown, 
  Zap, 
  Sparkles,
  Settings,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

const SubscriberProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    avatar_url: "",
    created_at: "",
  });
  const { status } = useSubscriptionLimits();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, avatar_url, created_at")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile({
        full_name: data.full_name || "",
        email: data.email || user.email || "",
        avatar_url: data.avatar_url || "",
        created_at: data.created_at || "",
      });
    } catch (error: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setProfile({ ...profile, avatar_url: urlData.publicUrl });
      
      // Auto-save after upload
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast.success("Avatar uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTierIcon = () => {
    if (status?.tier === "prime") return <Crown className="w-4 h-4 text-yellow-500" />;
    if (status?.tier === "plus") return <Zap className="w-4 h-4 text-primary" />;
    return <Sparkles className="w-4 h-4 text-muted-foreground" />;
  };

  const getTierLabel = () => {
    if (status?.tier === "prime") return "Prime";
    if (status?.tier === "plus") return "Plus";
    return "Free";
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to open billing portal');
    }
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="subscriber">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="subscriber">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Avatar & Basic Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 ring-4 ring-primary/10">
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getInitials(profile.full_name || "U")}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </div>
              <div>
                <p className="font-medium">{profile.full_name || "Your Name"}</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  {getTierIcon()}
                  <Badge variant={status?.tier === "free" ? "secondary" : "default"}>
                    {getTierLabel()} Plan
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Account Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Account Details</h2>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Member Since</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Unknown"}
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="mt-4">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Subscription Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Subscription</h2>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {getTierIcon()}
                <div>
                  <p className="font-medium">{getTierLabel()} Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {status?.limits.max_coaches} coaches • {status?.limits.daily_messages === 999 ? 'Unlimited' : status?.limits.daily_messages} messages/day
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {status?.tier !== "free" && (
                  <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Billing
                  </Button>
                )}
                {status?.tier === "free" && (
                  <Button size="sm" onClick={() => window.location.href = "/pricing"}>
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubscriberProfile;
