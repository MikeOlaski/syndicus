import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, MessageCircle, Zap, Target, Heart, Lightbulb, Shield } from "lucide-react";
import { SEO } from "@/components/SEO";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
            <SEO title="About Syndic.us — Mission &amp; Council of Minds" description="The story behind Syndic.us — why we built AI digital twins of world-class coaches and a Council of Minds for personalized 24/7 guidance." path="/about" />
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="bg-gradient-primary bg-clip-text text-transparent">Syndic.us</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We're revolutionizing personal development by creating AI-powered digital twins of the
            world's most effective coaches, making expert guidance accessible to everyone, everywhere.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                At Syndic.us, we believe that everyone deserves access to world-class coaching. 
                Our platform bridges the gap between expert coaches and those seeking guidance by 
                creating sophisticated AI-powered digital twins that capture the essence, wisdom, 
                and coaching style of leading experts.
              </p>
              <p className="text-muted-foreground">
                Through advanced AI technology, we're democratizing personal development and making 
                transformative coaching experiences available 24/7, regardless of geographic location 
                or economic barriers.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-background rounded-lg">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Expert Coaches</div>
              </div>
              
              <div className="text-center p-6 bg-background rounded-lg">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-2">100K+</div>
                <div className="text-sm text-muted-foreground">AI Conversations</div>
              </div>
              
              <div className="col-span-2 text-center p-6 bg-background rounded-lg">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-2">94%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground">
              These core principles guide everything we do at Syndic.us
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-muted/30 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Precision</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered coaching that adapts to your unique needs and goals
              </p>
            </div>

            <div className="text-center p-6 bg-muted/30 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Empathy</h3>
              <p className="text-sm text-muted-foreground">
                Human-centered design that prioritizes emotional intelligence
              </p>
            </div>

            <div className="text-center p-6 bg-muted/30 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Innovation</h3>
              <p className="text-sm text-muted-foreground">
                Cutting-edge technology meets proven coaching methodologies
              </p>
            </div>

            <div className="text-center p-6 bg-muted/30 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Trust</h3>
              <p className="text-sm text-muted-foreground">
                Secure, confidential, and ethical AI coaching experiences
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Our advanced AI technology creates authentic digital coaching experiences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-8 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-4">Coach Analysis</h3>
              <p className="text-muted-foreground">
                We analyze coaching sessions, methodologies, and communication patterns to understand 
                each coach's unique approach and expertise.
              </p>
            </div>

            <div className="bg-background p-8 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-4">AI Training</h3>
              <p className="text-muted-foreground">
                Our AI models are trained to replicate the coach's personality, response style, 
                and coaching techniques with remarkable accuracy.
              </p>
            </div>

            <div className="bg-background p-8 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-4">Personalized Coaching</h3>
              <p className="text-muted-foreground">
                Users receive personalized coaching experiences that adapt to their needs, 
                goals, and progress over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-cta">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Experience AI-Powered Coaching?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already transforming their lives with our digital twin coaches.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" onClick={() => navigate('/')}>
              Explore Coaches
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;