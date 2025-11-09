import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, MessageSquare, Users, Zap } from "lucide-react";

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Users,
      title: "Sign Up as a Coach",
      description: "Create your coach profile and tell us about your expertise, coaching style, and the transformations you help clients achieve."
    },
    {
      icon: Bot,
      title: "Create Your PersonaBot",
      description: "Our AI learns from your content, coaching methods, and philosophy to create a digital twin that authentically represents your approach."
    },
    {
      icon: MessageSquare,
      title: "Syndicate Your Expertise",
      description: "Your PersonaBot becomes available to subscribers who can interact with your coaching insights 24/7, expanding your reach exponentially."
    },
    {
      icon: Zap,
      title: "Scale Your Impact",
      description: "While your PersonaBot handles initial consultations and routine guidance, you focus on high-value coaching sessions and strategic growth."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">How It Works</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your coaching practice with AI-powered PersonaBots in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="p-8 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="flex items-start gap-4">
                <span className="text-4xl font-bold text-primary/20">{index + 1}</span>
                <div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-muted/50 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the future of coaching and start scaling your impact today
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Become a Coach Partner
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
