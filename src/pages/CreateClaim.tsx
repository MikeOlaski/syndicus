import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link2, Plus, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import WaitlistModal from "@/components/WaitlistModal";

const claimSchema = z.object({
  botUrl: z.string()
    .trim()
    .min(1, "PersonaBot URL is required")
    .max(500, "URL must be less than 500 characters")
    .url("Invalid URL format")
    .refine((url) => url.includes("syndic.us"), "URL must be a syndic.us domain"),
  fullName: z.string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal(""))
});

const CreateClaim = () => {
  const [activeTab, setActiveTab] = useState<"claim" | "create">("claim");
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const { toast } = useToast();

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      botUrl: formData.get("bot-url") as string,
      fullName: formData.get("full-name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
    };
    
    const result = claimSchema.safeParse(data);
    
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Claim Request Submitted",
      description: "We'll verify your identity and get back to you within 24-48 hours.",
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Create or Claim Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">PersonaBot</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Already have a PersonaBot created for you? Claim it now. Or start the process to create 
            a new AI-powered digital twin for any coach or expert.
          </p>
        </div>
      </section>

      {/* Tab Selection */}
      <section className="px-4 pb-8">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              variant={activeTab === "claim" ? "default" : "outline"}
              onClick={() => setActiveTab("claim")}
              className="flex items-center gap-2"
            >
              <Link2 className="w-5 h-5" />
              Claim Existing Bot
            </Button>
            <Button
              size="lg"
              variant={activeTab === "create" ? "default" : "outline"}
              onClick={() => setActiveTab("create")}
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Bot
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="md:col-span-2">
              {activeTab === "claim" ? (
                <Card className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Link2 className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">Claim Your PersonaBot</h2>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    If we've already created a PersonaBot for you, enter the URL and your contact 
                    details to claim ownership.
                  </p>

                  <form onSubmit={handleSubmitClaim} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="bot-url">PersonaBot URL *</Label>
                      <Input
                        id="bot-url"
                        name="bot-url"
                        placeholder="https://syndic.us/coach/your-name"
                        maxLength={500}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the full URL of your PersonaBot on Syndic.us
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full-name">Full Name *</Label>
                        <Input
                          id="full-name"
                          name="full-name"
                          placeholder="John Doe"
                          maxLength={100}
                          required
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
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        maxLength={20}
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      ✓ Submit Claim Request
                    </Button>
                  </form>
                </Card>
              ) : (
                <Card className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Plus className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">Create New PersonaBot</h2>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Start the process to create a new AI-powered digital twin. Our team will work 
                    with you to build your PersonaBot.
                  </p>

                  <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      The PersonaBot creation wizard is currently in development. Join our waitlist 
                      to be notified when it launches.
                    </p>
                    <Button variant="outline" onClick={() => setShowWaitlistModal(true)}>
                      📧 Join Waitlist
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">How Claiming Works</h3>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Submit Request</div>
                      <div className="text-sm text-muted-foreground">
                        Provide the PersonaBot URL and your contact information
                      </div>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Identity Verification</div>
                      <div className="text-sm text-muted-foreground">
                        We verify your identity and ownership rights (24-48 hours)
                      </div>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Access Granted</div>
                      <div className="text-sm text-muted-foreground">
                        Receive login credentials and full control of your PersonaBot
                      </div>
                    </div>
                  </li>
                </ol>
              </Card>

              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Need Help?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our team is here to assist you through the process.
                </p>
                <Button variant="outline" className="w-full" size="sm">
                  💬 Contact Support
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <WaitlistModal
        isOpen={showWaitlistModal}
        onClose={() => setShowWaitlistModal(false)}
      />

      <Footer />
    </div>
  );
};

export default CreateClaim;