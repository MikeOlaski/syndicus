import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          Meet Your{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Digital Twin
          </span>{" "}
          Coach
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect with AI-powered personabots created by world-class coaches. Get personalized
          guidance, 24/7 availability, and transformative insights tailored to your unique journey.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" className="bg-gradient-primary hover:opacity-90">
            Find Your Coach
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
