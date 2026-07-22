import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SupportChatBubble from "@/components/SupportChatBubble";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Mail, MessageSquare, FileText, Users, Zap, Shield } from "lucide-react";

const Support = () => {
  const navigate = useNavigate();

  const supportCategories = [
    {
      icon: Users,
      title: "Getting Started",
      description: "New to Syndic.us? Learn the basics of using the platform."
    },
    {
      icon: Zap,
      title: "Coach Setup",
      description: "Help with creating and managing your PersonaBot."
    },
    {
      icon: FileText,
      title: "Billing & Subscriptions",
      description: "Questions about plans, payments, and invoices."
    },
    {
      icon: Shield,
      title: "Account & Security",
      description: "Password resets, account settings, and privacy."
    }
  ];

  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "Click 'Forgot password?' on the login page, enter your email, and follow the link sent to your inbox to create a new password."
    },
    {
      question: "How do I upgrade my subscription?",
      answer: "Go to your dashboard, click on your profile, and select 'Manage Subscription' to upgrade to Plus or Prime tier."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes! You can cancel your subscription at any time from your profile settings. You'll continue to have access until the end of your billing period."
    },
    {
      question: "How do I contact a coach directly?",
      answer: "While chatting with a coach's PersonaBot, it can facilitate direct booking requests when deeper 1-on-1 coaching is needed."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use industry-standard encryption and security practices to protect your data. Read our Privacy Policy for more details."
    },
    {
      question: "How do I create a PersonaBot as a coach?",
      answer: "After signing up as a coach, go to your Dashboard → Profile Setup to configure your expertise, then use My Twin to add your knowledge base."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Support Center</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get the help you need. Browse our resources or chat with our AI support assistant.
          </p>
        </div>

        {/* Support Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {supportCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact Options */}
        <div className="bg-muted/50 rounded-lg p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our team is here to help. Choose how you'd like to reach us.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/contact')}>
              <Mail className="w-4 h-4 mr-2" />
              Send a Message
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/help')}>
              <FileText className="w-4 h-4 mr-2" />
              Browse Help Articles
            </Button>
          </div>
        </div>
      </main>

      <Footer />
      <SupportChatBubble />
    </div>
  );
};

export default Support;
