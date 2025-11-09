import { Button } from "@/components/ui/button";
import { MessageSquare, User } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Syndic.us</h1>
              <p className="text-xs text-muted-foreground">Syndicated Digital Twin PersonaBots</p>
            </div>
          </a>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </a>
            <a href="#coaches" className="text-sm font-medium hover:text-primary transition-colors">
              Coaches
            </a>
            <a href="#syndicai" className="text-sm font-medium hover:text-primary transition-colors">
              SyndicAI
            </a>
            <a href="#create" className="text-sm font-medium hover:text-primary transition-colors">
              Create or Claim
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex">
            Join as Subscriber
          </Button>
          <Button>
            Join as Coach
          </Button>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
