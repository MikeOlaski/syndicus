import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SupportChatBubble from "@/components/SupportChatBubble";
import { SEO } from "@/components/SEO";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Help = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "What is a PersonaBot?",
      answer: "A PersonaBot is an AI-powered digital twin that represents a coach's expertise, philosophy, and coaching style. It provides authentic guidance based on the coach's knowledge and approach, available 24/7 to subscribers."
    },
    {
      question: "How do I create my PersonaBot?",
      answer: "After signing up as a coach partner, you'll go through our onboarding process where you share your coaching content, philosophy, and methods. Our AI then creates a PersonaBot that authentically represents your coaching style."
    },
    {
      question: "Can I update my PersonaBot over time?",
      answer: "Yes! Your PersonaBot can be continuously updated as you develop new content, refine your methods, or expand your expertise. We make it easy to keep your digital twin current."
    },
    {
      question: "How much can I earn as a coach?",
      answer: "Coaches earn revenue share from subscriber fees. Your earnings depend on subscriber engagement with your PersonaBot. Top coaches are earning $5k-$20k+ monthly in passive income."
    },
    {
      question: "What if subscribers need more than the PersonaBot?",
      answer: "PersonaBots can identify when deeper human coaching is needed and facilitate direct bookings with you. This creates a natural funnel from your PersonaBot to high-value 1-on-1 sessions."
    },
    {
      question: "Is my coaching IP protected?",
      answer: "Yes. We have strict IP protection measures in place. Your PersonaBot only operates within our platform and your proprietary methods remain your intellectual property."
    },
    {
      question: "How is this different from recorded courses?",
      answer: "Unlike static courses, PersonaBots provide dynamic, conversational coaching that adapts to each individual's questions and context. It's like having a conversation with you, not watching a pre-recorded video."
    },
    {
      question: "Can I try it before committing?",
      answer: "Yes! We offer a 14-day trial for coach partners. You can create your PersonaBot, test it with beta users, and see results before making a long-term commitment."
    }
  ];

  return (
    <div className="min-h-screen">
      <SEO
        title="Help Center — Syndic.us"
        description="Answers to common questions about Syndic.us PersonaBots, Syndic8 councils, coach onboarding, pricing, and IP protection."
        path="/help"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Help Center</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about Syndic.us
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
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

        <div className="bg-muted/50 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our support team is here to help you get the most out of Syndic.us
          </p>
          <Button size="lg" onClick={() => navigate('/contact')}>
            Contact Support
          </Button>
        </div>
      </main>

      <Footer />
      <SupportChatBubble />
    </div>
  );
};

export default Help;
