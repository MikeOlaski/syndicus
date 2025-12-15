import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Users, MessageCircle, Zap, Globe, Network, Bot, TrendingUp, Search, X } from "lucide-react";
import { Syndic8SearchResults } from "@/components/Syndic8SearchResults";

const Syndic8 = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = ["Leadership", "Wellness", "Career", "Business", "Relationships", "Performance"];

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(prev => prev === category ? null : category);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is triggered automatically via the query
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  return <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">Council of Minds</span>
          </h1>
          <p className="text-xl text-foreground font-medium mb-4">Combine Syndicated Experts for Balanced Perspectives</p>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get varied, balanced insights on your toughest challenges. Multiple expert perspectives 
            working together to deliver comprehensive recommendations you can trust.
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

      {/* Network Exploration Section */}
      <section className="py-16 px-4 bg-gradient-cta">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Explore the Syndic8 Network
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto">
              Search and connect with AI-powered coaching bots across our global network of expertise.
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
            <form onSubmit={handleSearch} className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search coaching specializations, topics, or expertise..." 
                className="pl-12 pr-24 h-14 bg-background border-border text-foreground placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {(searchQuery || selectedCategory) && (
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={clearSearch}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </form>

            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map(category => (
                <Badge 
                  key={category} 
                  variant="outline" 
                  className={`cursor-pointer transition-colors px-4 py-2 ${
                    selectedCategory === category 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-white text-foreground hover:bg-white/90 border-white/50"
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>

            {/* Search Results */}
            <Syndic8SearchResults 
              searchQuery={searchQuery} 
              selectedCategory={selectedCategory} 
            />
          </div>
        </div>
      </section>

      {/* Cohort of Experts Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">
              <Network className="w-3 h-3 mr-2" />
              Mixture of Experts
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Create Your Own <span className="bg-gradient-primary bg-clip-text text-transparent">Expert Cohort</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Don't limit yourself to a single perspective. Build a custom team of AI coaches who collaborate, 
              debate, and deliver comprehensive insights tailored to your unique challenges.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-6">The Power of Collaborative Intelligence</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Multiple Perspectives</h4>
                    <p className="text-muted-foreground">
                      Combine specialists from different domains - leadership, wellness, strategy - to see 
                      your challenge from every angle.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Collaborative Dialogue</h4>
                    <p className="text-muted-foreground">
                      Watch as your expert cohort engages in dynamic discussions, building on each other's 
                      insights to uncover breakthrough solutions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Adversarial Thinking</h4>
                    <p className="text-muted-foreground">
                      Benefit from constructive debate where coaches challenge assumptions and stress-test 
                      ideas, ensuring robust, well-rounded advice.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Blended Expertise</h4>
                    <p className="text-muted-foreground">
                      Get recommendations that blend methodologies from different coaching philosophies, 
                      creating a unique approach perfectly suited to your needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background border rounded-2xl p-8 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                    LC
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">Leadership Coach</div>
                    <p className="text-sm text-muted-foreground">
                      "I recommend focusing on team alignment first. Build trust before pushing for performance."
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-sm flex-shrink-0">
                    SC
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">Strategy Coach</div>
                    <p className="text-sm text-muted-foreground">
                      "I see the merit in that, but we should also establish clear KPIs to measure progress quickly."
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                    WC
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">Wellness Coach</div>
                    <p className="text-sm text-muted-foreground">
                      "Both valid points. Let's not forget sustainable pace - burnout will derail any strategy."
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Synthesized Recommendation</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Create a 3-phase approach: Start with team alignment workshops, implement measurable KPIs 
                    in phase 2, and build in wellness checkpoints throughout to ensure sustainable growth."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Why Settle for One Opinion?
            </h3>
            <p className="text-lg opacity-90 mb-8 max-w-3xl mx-auto">
              Traditional coaching gives you one perspective. Syndic8 gives you a council of experts who work 
              together to solve your toughest challenges. It's like having a board of advisors, available 24/7, 
              at a fraction of the cost.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-background/10 backdrop-blur rounded-lg p-6">
                <div className="text-3xl font-bold mb-2">10x</div>
                <div className="text-sm opacity-90">More Comprehensive</div>
              </div>
              <div className="bg-background/10 backdrop-blur rounded-lg p-6">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-sm opacity-90">Always Available</div>
              </div>
              <div className="bg-background/10 backdrop-blur rounded-lg p-6">
                <div className="text-3xl font-bold mb-2">1/10</div>
                <div className="text-sm opacity-90">The Cost</div>
              </div>
            </div>
            <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>
              Start Building Your Cohort
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Join the Future of Coaching?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of the revolutionary Syndic8 network and transform how coaching expertise is 
            shared and scaled globally.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/auth')}>
              🚀 Join as Partner
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
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
    </div>;
};
export default Syndic8;