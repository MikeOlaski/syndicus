import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Calendar, Phone, Mail, MessageCircle, Maximize2, Send, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { useCoachChat } from "@/hooks/useCoachChat";
import { useEffect, useRef, useState } from "react";

const CoachProfile = () => {
  const { coachSlug } = useParams();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    coach,
    isCoachLoading,
    sendMessage,
    messagesEndRef,
  } = useCoachChat(coachSlug);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  // Fallback static data for display when coach data isn't loaded
  const displayCoach = coach || {
    id: coachSlug || "1",
    slug: coachSlug || "coach",
    name: "Coach",
    specialization: "General Coaching",
    image: `https://api.dicebear.com/7.x/initials/svg?seed=Coach`,
  };

  // Static profile data for the sidebar
  const profileData = {
    rating: 4.9,
    clients: 280,
    personality: "Strategic, analytical, and empowering",
    about: `${displayCoach.name} is a renowned coach with extensive experience helping clients achieve their goals. Their AI-powered coaching approach combines expertise with personalized insights to help you succeed.`,
    specializations: ["Leadership", "Strategy", "Growth"],
    achievements: [
      "Helped 50+ clients achieve their goals",
      "Expert in their field",
      "Featured in industry publications",
      "Dedicated to continuous improvement"
    ],
    hourlyRate: 200
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[380px_1fr] gap-6 max-w-7xl mx-auto">
          {/* Left Sidebar - Coach Details */}
          <div className="bg-card border rounded-lg p-6 h-fit">
            <div className="text-center mb-6">
              <img
                src={displayCoach.image}
                alt={displayCoach.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/${coachSlug}`)}
              />
              <h2 
                className="text-2xl font-bold mb-1 cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate(`/${coachSlug}`)}
              >
                {displayCoach.name}
              </h2>
              <p className="text-primary font-medium mb-3">{displayCoach.specialization}</p>
              <div className="flex items-center justify-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{profileData.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{profileData.clients} clients</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-3">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{profileData.about}</p>
              </div>

              <div>
                <h3 className="font-bold mb-3">Bot Personality</h3>
                <p className="text-sm text-muted-foreground italic">{profileData.personality}</p>
              </div>

              <div>
                <h3 className="font-bold mb-3">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3">Achievements</h3>
                <ul className="space-y-2">
                  {profileData.achievements.map((achievement, index) => (
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
                  <span className="text-lg font-bold text-primary">${profileData.hourlyRate}/hour</span>
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
                  onClick={() => navigate(`/${coachSlug}/chat`)}
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
                  <h3 className="font-bold text-sm">{displayCoach.name}'s AI Coaching Assistant</h3>
                  <p className="text-xs text-muted-foreground">
                    Experience coaching powered by AI
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
                onClick={() => navigate(`/${coachSlug}/chat/active`)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Messages */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 p-6 overflow-y-auto"
            >
              {isCoachLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 mb-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      {msg.role === "assistant" && (
                        <img 
                          src={displayCoach.image} 
                          alt={displayCoach.name} 
                          className="w-8 h-8 rounded-full flex-shrink-0" 
                        />
                      )}
                      <div className={`flex-1 ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
                        <div className={`rounded-lg p-3 mb-1 max-w-[80%] ${
                          msg.role === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3 mb-4">
                      <img 
                        src={displayCoach.image} 
                        alt={displayCoach.name} 
                        className="w-8 h-8 rounded-full flex-shrink-0" 
                      />
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t p-4">
              {coach?.webhookUrl ? (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Ask ${displayCoach.name}'s AI assistant anything...`}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                  <Button 
                    type="submit"
                    size="icon" 
                    className="bg-gradient-primary"
                    disabled={!inputValue.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </form>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Chat not available yet..."
                    disabled
                    className="flex-1 px-4 py-2 border rounded-lg bg-muted cursor-not-allowed"
                  />
                  <Button size="icon" disabled className="bg-muted">
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              )}
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
