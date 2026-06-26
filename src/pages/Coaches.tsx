import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { DollarSign, Users, Clock, TrendingUp, Calendar, Video, Globe, BarChart3, MessageCircle } from "lucide-react";
import VideoPlayerModal from "@/components/VideoPlayerModal";
import CoachDirectory from "@/components/CoachDirectory";
import { useState } from "react";
import { SEO } from "@/components/SEO";

const Coaches = () => {
  const navigate = useNavigate();
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <div className="min-h-screen">
            <SEO title="Coaches — Browse AI Digital Twins | Syndic.us" description="Browse PersonaBots of world-class coaches across leadership, wellness, business, performance, and relationships. Chat 24/7 on Syndic.us." path="/coaches" />
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Scale Your Coaching <span className="bg-gradient-primary bg-clip-text text-transparent">With AI</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 500+ elite coaches who are generating passive income and scaling their reach through 
            AI-powered digital twins. Transform your expertise into a 24/7 coaching business.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Apply to Join
            </Button>
            <Button size="lg" variant="outline">
              Book Demo Call
            </Button>
          </div>
        </div>
      </section>

      {/* Coach Directory */}
      <CoachDirectory />

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-background rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-2">$10K+</div>
              <div className="text-sm text-muted-foreground">Average Monthly Revenue</div>
            </div>

            <div className="text-center p-6 bg-background rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-2">94%</div>
              <div className="text-sm text-muted-foreground">Client Satisfaction Rate</div>
            </div>

            <div className="text-center p-6 bg-background rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-2">25hrs</div>
              <div className="text-sm text-muted-foreground">Time Saved Per Week</div>
            </div>

            <div className="text-center p-6 bg-background rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-2">120+</div>
              <div className="text-sm text-muted-foreground">Global Reach</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Why Top Coaches Choose <span className="bg-gradient-primary bg-clip-text text-transparent">Syndic.us</span>
            </h2>
            <p className="text-muted-foreground">
              Transform your coaching practice with AI technology that amplifies your impact and creates passive income
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">
                NO RESTRICTIONS
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Passive Income</h3>
              <p className="text-sm text-muted-foreground">
                Generate $6K-$20K/month in GUARANTEED monthly recurring revenue
              </p>
            </div>

            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">
                COACHING ON DEMAND
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Time Freedom</h3>
              <p className="text-sm text-muted-foreground">
                Scale to a repeating beyond geographical + time-zone constraints
              </p>
            </div>

            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">
                SIMPLE ANALYTICS
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Global Reach</h3>
              <p className="text-sm text-muted-foreground">
                Stay-up-to-speed on what is working (and what's not) top-to-bottom insights
              </p>
            </div>

            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">
                BRAND AMPLIFICATION
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Brand Amplification</h3>
              <p className="text-sm text-muted-foreground">
                Increase your visibility and establish thought-leadership in your field
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-muted-foreground">
              Hear from coaches who have transformed their practice with AI-powered digital twins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Dr. Sarah Chen",
                role: "Executive Leadership Coach",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
                quote: "Syndic.us transformed my coaching practice. My AI coach now handles over 200 clients while I focus on high-value work.",
              },
              {
                name: "Marcus Rodriguez",
                role: "Life & Wellness Coach",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
                quote: "I was skeptical at first, but my clients love having 24/7 support. The AI captures my coaching style perfectly.",
              },
              {
                name: "Jennifer Park",
                role: "Career Transition Coach",
                image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
                quote: "The passive income and time freedom I've gained has been life-changing. I can now scale my impact globally.",
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-background p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">"{testimonial.quote}"</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">⭐</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground">
              Apply now to join our exclusive network of AI-powered coaches.
            </p>
          </div>

          <div className="bg-muted/30 p-8 rounded-lg">
            <h3 className="text-xl font-bold mb-6">🎯 Coach Application</h3>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" placeholder="John Doe" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" placeholder="john@example.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Coaching Specialization *</Label>
                <Input id="specialization" placeholder="e.g., Leadership, Wellness, Career" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience *</Label>
                <Input id="experience" type="number" placeholder="e.g., 5" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website or LinkedIn URL</Label>
                <Input id="website" type="url" placeholder="https://..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">Coaching Certifications (Optional)</Label>
                <Textarea id="certifications" placeholder="List your coaching certifications..." rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="why">What Inspires You?</Label>
                <Textarea id="why" placeholder="Tell us about your coaching philosophy..." rows={4} />
              </div>

              <Button type="submit" className="w-full" size="lg">
                📨 Submit Application
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary via-primary/90 to-primary/70">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Have Questions?
          </h2>
          <p className="text-lg text-white/90 mb-12 max-w-2xl mx-auto">
            Our team is here to help you understand how AI can transform your coaching practice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto shadow-lg"
              onClick={() => setShowVideoModal(true)}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Demo Call
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm w-full sm:w-auto"
              onClick={() => navigate("/contact")}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      <VideoPlayerModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />

      <Footer />
    </div>
  );
};

export default Coaches;