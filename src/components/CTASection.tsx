import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 px-4 bg-gradient-cta">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Coaching Practice?
        </h2>
        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          Join hundreds of coaches who are already using AI-powered personabots to scale their
          impact and reach more clients.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" onClick={() => navigate('/auth')}>
            Become a Coach Partner
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent" onClick={scrollToTop}>
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
