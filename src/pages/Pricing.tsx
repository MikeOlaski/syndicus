import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const Pricing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [currentTier, setCurrentTier] = useState<string>("free");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        // Check current subscription
        const { data } = await supabase.functions.invoke('check-subscription');
        if (data?.tier) {
          setCurrentTier(data.tier);
        }
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (tier === 'enterprise') {
      navigate('/contact');
      return;
    }

    setLoading(tier);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading('manage');
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to open billing portal');
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "Free",
      tier: "free",
      price: "$0",
      period: "/month",
      description: "Get started with basic access",
      features: [
        "3 coach subscriptions",
        "1 Syndic8 group (2 coaches max)",
        "5 messages per day",
        "Text modality only",
        "Community access"
      ],
      cta: "Current Plan",
      popular: false
    },
    {
      name: "Plus Subscriber",
      tier: "plus",
      price: "$27",
      period: "/month",
      description: "Access to more coaches",
      features: [
        "5 coach subscriptions",
        "1 Syndic8 group (8 coaches max)",
        "50 messages per day",
        "Text modality",
        "Priority support"
      ],
      cta: "Upgrade to Plus",
      popular: false
    },
    {
      name: "Prime Subscriber",
      tier: "prime",
      price: "$97",
      period: "/month",
      description: "Full access to all features",
      features: [
        "17 coach subscriptions",
        "2 Syndic8 groups (8 coaches max)",
        "Unlimited messages",
        "All modalities (text, voice, video)",
        "Priority support",
        "Early access to new features"
      ],
      cta: "Upgrade to Prime",
      popular: true
    },
    {
      name: "Enterprise",
      tier: "enterprise",
      price: "Custom",
      period: "",
      description: "For organizations and coaching networks",
      features: [
        "Unlimited coach access",
        "Unlimited Syndic8 groups",
        "White-label solution",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantees"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that's right for you. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const isCurrentPlan = currentTier === plan.tier;
            const canUpgrade = plan.tier !== 'free' && plan.tier !== 'enterprise' && !isCurrentPlan;
            
            return (
              <div 
                key={index} 
                className={`p-6 border rounded-lg relative ${
                  plan.popular ? 'border-primary shadow-xl scale-105' : ''
                } ${isCurrentPlan ? 'border-green-500 bg-green-500/5' : ''}`}
              >
                {plan.popular && !isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Your Plan
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan && currentTier !== 'free' ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleManageSubscription}
                    disabled={loading === 'manage'}
                  >
                    {loading === 'manage' ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Manage Subscription
                  </Button>
                ) : isCurrentPlan ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.tier)}
                    disabled={loading === plan.tier}
                  >
                    {loading === plan.tier ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {plan.cta}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            All plans include a 14-day money-back guarantee
          </p>
          <p className="text-sm text-muted-foreground">
            Questions? <a href="/contact" className="text-primary hover:underline">Contact our sales team</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
