import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Maximize2 } from "lucide-react";

const ChatActive = () => {
  const { coachId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  // Sample coach data
  const coach = {
    id: "1",
    name: "Dr. Sarah Chen",
    specialization: "Executive Leadership",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // In production, this would send the message to the AI
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Syndic.us</h1>
              <p className="text-xs text-muted-foreground">Syndicated Digital Twin PersonaBots</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(`/coach/${coachId}`)}
            >
              <img src={coach.image} alt={coach.name} className="w-8 h-8 rounded-full" />
              <div className="text-right">
                <div className="font-bold text-sm">{coach.name}</div>
                <div className="text-xs text-primary">{coach.specialization}</div>
              </div>
            </div>
            <span className="flex items-center gap-1 ml-4">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-green-600 font-medium">Online</span>
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(`/coach/${coachId}`)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button className="ml-2 bg-gradient-primary">Book Live Session</Button>
          </div>
        </div>
      </header>

      {/* Chat Messages Area */}
      <div className="flex-1 container mx-auto max-w-4xl px-4 py-6 overflow-y-auto">
        <div className="flex gap-3 mb-4">
          <img src={coach.image} alt={coach.name} className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <div className="bg-muted rounded-lg p-4 mb-1">
              <p className="text-sm">
                Hello! I'm Dr. Sarah Chen's AI coaching assistant. I'm here to help you develop 
                your leadership potential. What specific leadership challenge are you facing today?
              </p>
            </div>
            <span className="text-xs text-muted-foreground">04:30 PM</span>
          </div>
        </div>
      </div>

      {/* Chat Input - Fixed at Bottom */}
      <div className="border-t bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message Dr...."
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
            <Button type="submit" size="icon" className="h-12 w-12 bg-gradient-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This is an AI simulation of Dr. Sarah Chen's coaching style. For live sessions, book a consultation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatActive;
