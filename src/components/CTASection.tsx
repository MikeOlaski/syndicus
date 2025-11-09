import { Button } from "@/components/ui/button";

const CTASection = () => {
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
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
            Become a Coach Partner
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
