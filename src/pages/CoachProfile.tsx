import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Calendar, Phone, Mail, MessageCircle, Maximize2 } from "lucide-react";

const CoachProfile = () => {
  const { coachId } = useParams();
  const navigate = useNavigate();

  // Sample coach data - in production this would come from an API/database
  const coach = {
    id: "1",
    name: "Dr. Sarah Chen",
    specialization: "Executive Leadership",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    rating: 4.9,
    clients: 280,
    personality: "Strategic, analytical, and empowering",
    about: "Dr. Sarah Chen is a renowned executive leadership coach with over 15 years of experience working with Fortune 500 CEOs and senior executives. She holds a PhD in Organizational Psychology from Stanford and has authored three bestselling books on leadership transformation. Her AI-powered coaching approach combines behavioral science with data-driven insights to help leaders achieve unprecedented results.",
    specializations: ["Leadership", "Strategy", "C-Suite"],
    achievements: [
      "Coached 50+ C-Suite executives",
      "Author of 3 bestselling leadership books",
      "Featured in Harvard Business Review",
      "Stanford PhD in Organizational Psychology"
    ],
    hourlyRate: 200
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Syndic.us</h1>
              <p className="text-xs text-muted-foreground">Syndicated Digital Twin PersonaBots</p>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/" className="hover:text-primary">About</a>
            <a href="/coaches" className="hover:text-primary">Coaches</a>
            <a href="/syndic8" className="hover:text-primary">Syndic8</a>
            <a href="/create-claim" className="hover:text-primary">Create or Claim</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Join as Subscriber</Button>
            <Button size="sm" className="bg-gradient-primary">Join as Coach</Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Users className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[380px_1fr] gap-6 max-w-7xl mx-auto">
          {/* Left Sidebar - Coach Details */}
          <div className="bg-card border rounded-lg p-6 h-fit">
            <div className="text-center mb-6">
              <img
                src={coach.image}
                alt={coach.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/coach/${coach.id}`)}
              />
              <h2 
                className="text-2xl font-bold mb-1 cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate(`/coach/${coach.id}`)}
              >
                {coach.name}
              </h2>
              <p className="text-primary font-medium mb-3">{coach.specialization}</p>
              <div className="flex items-center justify-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{coach.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{coach.clients} clients</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-3">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{coach.about}</p>
              </div>

              <div>
                <h3 className="font-bold mb-3">Bot Personality</h3>
                <p className="text-sm text-muted-foreground italic">{coach.personality}</p>
              </div>

              <div>
                <h3 className="font-bold mb-3">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {coach.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3">Achievements</h3>
                <ul className="space-y-2">
                  {coach.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-muted-foreground">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Live Sessions</span>
                  <span className="text-lg font-bold text-primary">${coach.hourlyRate}/hour</span>
                </div>
                <Button className="w-full mb-3 bg-gradient-primary">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Session
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
                <Button 
                  className="w-full mt-3 bg-gradient-primary"
                  onClick={() => navigate(`/coach/${coach.id}/chat`)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Try Full-Screen Chat
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="bg-card border rounded-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
            {/* Chat Header */}
            <div className="border-b p-4 flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{coach.name}'s AI Coaching Assistant</h3>
                  <p className="text-xs text-muted-foreground">
                    Experience strategic and analytical coaching powered by AI
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-green-600 font-medium">Online</span>
                  </span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(`/coach/${coach.id}/chat`)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex gap-3 mb-4">
                <img src={coach.image} alt={coach.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3 mb-1">
                    <p className="text-sm">
                      Hello! I'm Dr. Sarah Chen's AI coaching assistant. I'm here to help you develop 
                      your leadership potential. What specific leadership challenge are you facing today?
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">04:30 PM</span>
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Dr.'s AI assistant anything..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button size="icon" className="bg-gradient-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                This is an AI simulation. For actual coaching, book a live session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachProfile;
