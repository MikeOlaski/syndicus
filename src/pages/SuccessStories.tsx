import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Quote } from "lucide-react";

const SuccessStories = () => {
  const navigate = useNavigate();

  const stories = [
    {
      name: "Sarah Mitchell",
      role: "Life Coach",
      image: "SM",
      quote: "Syndic.us has transformed my coaching practice. My PersonaBot handles initial consultations, allowing me to focus on deep transformation work with committed clients. I've 5x'd my reach without burning out.",
      metrics: "500% increase in client interactions"
    },
    {
      name: "Marcus Thompson",
      role: "Business Coach",
      image: "MT",
      quote: "As a business coach, scalability was always my challenge. Now my PersonaBot provides 24/7 strategic guidance to entrepreneurs worldwide while I focus on executive coaching. Game changer.",
      metrics: "150+ active subscribers in 3 months"
    },
    {
      name: "Dr. Elena Rodriguez",
      role: "Wellness Coach",
      image: "ER",
      quote: "The AI authentically captures my coaching philosophy and approach. Clients love having access to guidance anytime they need it, and I love the recurring revenue model.",
      metrics: "$15k+ monthly recurring revenue"
    },
    {
      name: "James Chen",
      role: "Career Coach",
      image: "JC",
      quote: "I was skeptical at first, but the PersonaBot truly represents my coaching style. It's like having 100 of me helping people simultaneously. The analytics also help me understand what topics resonate most.",
      metrics: "200+ hours saved monthly"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Success Stories</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real coaches achieving extraordinary results with Syndic.us PersonaBots
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {stories.map((story, index) => (
            <div key={index} className="p-8 border rounded-lg hover:shadow-lg transition-shadow">
              <Quote className="w-10 h-10 text-primary/20 mb-4" />
              
              <p className="text-lg mb-6 italic">"{story.quote}"</p>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                  {story.image}
                </div>
                <div>
                  <p className="font-bold">{story.name}</p>
                  <p className="text-sm text-muted-foreground">{story.role}</p>
                </div>
              </div>
              
              <div className="bg-primary/10 rounded-lg p-4">
                <p className="text-sm font-medium text-primary">{story.metrics}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-cta rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Write Your Success Story?</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of coaches who are transforming their practices with AI-powered PersonaBots
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" onClick={() => navigate('/auth')}>
            Get Started Today
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SuccessStories;
