import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import CoachDirectory from "@/components/CoachDirectory";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Stats />
      <CoachDirectory />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
