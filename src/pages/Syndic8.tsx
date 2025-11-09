import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Users, MessageCircle, Zap, Globe, Network, Bot, TrendingUp, Search } from "lucide-react";

const Syndic8 = () => {
  const navigate = useNavigate();

  const categories = [
    "Leadership",
    "Wellness",
    "Career",
    "Business",
    "Relationships",
    "Performance",
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to <span className="bg-gradient-primary bg-clip-text text-transparent">Syndic8</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            The next evolution of AI-powered coaching networks. Connect, collaborate, and scale your 
            coaching practice through our advanced syndication platform that brings together the world's 
            best coaching minds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/auth')}>
              🚀 Join the Network
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-background rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Network Partners</div>
            </div>

            <div className="text-center p-6 bg-background rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-2">1M+</div>
              <div className="text-sm text-muted-foreground">AI Interactions</div>
            </div>

            <div className="text-center p-6 bg-background rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-2">96%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>

            <div className="text-center p-6 bg-background rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-2">120+</div>
              <div className="text-sm text-muted-foreground">Global Reach</div>
            </div>
          </div>
        </div>
      </section>

      {/* Powered by AI Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Powered by Advanced <span className="bg-gradient-primary bg-clip-text text-transparent">AI Technology</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Syndic8 leverages cutting-edge artificial intelligence to create a seamless coaching 
              ecosystem that scales expertise and delivers personalized experiences at unprecedented levels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-muted/30 p-6 rounded-lg text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Network className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-3">Syndicated Network</h3>
              <p className="text-sm text-muted-foreground">
                Connect with a vast network of AI-powered coaching bots across multiple platforms and specializations.
              </p>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-3">Advanced AI Technology</h3>
              <p className="text-sm text-muted-foreground">
                Experience cutting-edge AI that learns and adapts to provide personalized coaching experiences.
              </p>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-3">Global Reach</h3>
              <p className="text-sm text-muted-foreground">
                Access coaching expertise from around the world, available 24/7 in multiple languages.
              </p>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-3">Performance Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track your progress with detailed analytics and insights powered by machine learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Network Exploration Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Explore the Syndic8 Network
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Search and connect with AI-powered coaching bots across our global network of expertise.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <Input
                placeholder="Search coaching specializations, topics, or expertise..."
                className="pl-12 h-14 bg-white/20 border-white/30 text-white placeholder:text-white/60"
              />
              <Button 
                className="absolute right-2 top-1/2 -translate-y-1/2"
                variant="secondary"
              >
                🔍 Advanced Search
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-white transition-colors px-4 py-2"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-cta">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Join the Future of Coaching?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Be part of the revolutionary Syndic8 network and transform how coaching expertise is 
            shared and scaled globally.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => navigate('/auth')}
            >
              🚀 Join as Partner
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
            >
              📺 Request Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer with Platform Info */}
      <section className="py-16 px-4 bg-card border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Network Overview</li>
                <li>AI Technology</li>
                <li>Integration</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Partners</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Join Network</li>
                <li>API Access</li>
                <li>Developer Tools</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Documentation</li>
                <li>Contact</li>
                <li>Privacy</li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">Syndic8</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The future of AI-powered coaching networks and syndicated expertise.
              </p>
            </div>
          </div>
          <div className="text-center mt-12 pt-8 border-t text-sm text-muted-foreground">
            © 2025 Syndic8. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  );
};

export default Syndic8;