import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Subscriber",
      price: "$29",
      period: "/month",
      description: "Access to all coach PersonaBots",
      features: [
        "Unlimited conversations with PersonaBots",
        "Access to entire coach directory",
        "24/7 AI coaching support",
        "Monthly webinars and resources",
        "Community forum access"
      ],
      cta: "Start Subscribing",
      popular: false
    },
    {
      name: "Coach Partner",
      price: "$99",
      period: "/month",
      description: "Create and syndicate your PersonaBot",
      features: [
        "Custom PersonaBot creation",
        "Unlimited bot interactions",
        "Revenue sharing program",
        "Analytics dashboard",
        "Priority support",
        "Marketing tools",
        "Coach community access"
      ],
      cta: "Become a Coach",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For organizations and coaching networks",
      features: [
        "Multiple coach PersonaBots",
        "White-label solution",
        "Custom integrations",
        "Dedicated account manager",
        "Advanced analytics",
        "Custom training programs",
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

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`p-8 border rounded-lg relative ${
                plan.popular ? 'border-primary shadow-xl scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant={plan.popular ? "default" : "outline"}
                onClick={() => navigate('/auth')}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
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
