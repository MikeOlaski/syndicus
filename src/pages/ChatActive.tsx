import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Maximize2, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CoachData {
  id: string;
  name: string;
  specialization: string;
  image: string;
  webhookUrl: string | null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const ChatActive = () => {
  const { coachId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [coach, setCoach] = useState<CoachData | null>(null);
  const [isCoachLoading, setIsCoachLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const fetchCoach = async () => {
      if (!coachId) return;
      
      try {
        const { data: coachProfile, error: coachError } = await supabase
          .from("coach_profiles")
          .select("*")
          .eq("user_id", coachId)
          .maybeSingle();

        if (coachError) throw coachError;

        if (coachProfile) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", coachId)
            .maybeSingle();

          if (profileError) throw profileError;

          setCoach({
            id: coachId,
            name: profile?.full_name || "Coach",
            specialization: coachProfile.specialization || "General Coaching",
            image: profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || 'Coach'}`,
            webhookUrl: coachProfile.webhook_url,
          });

          // Generate session ID
          const storageKey = `chat_session_${coachId}`;
          let storedSessionId = localStorage.getItem(storageKey);
          if (!storedSessionId) {
            storedSessionId = Array.from({ length: 32 }, () => 
              Math.floor(Math.random() * 16).toString(16)
            ).join('');
            localStorage.setItem(storageKey, storedSessionId);
          }
          setSessionId(storedSessionId);

          // Add welcome message
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: `Hello! I'm ${profile?.full_name || "your coach"}'s AI coaching assistant. I'm here to help you. What can I assist you with today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      } catch (error) {
        console.error("Error fetching coach:", error);
      } finally {
        setIsCoachLoading(false);
      }
    };

    fetchCoach();
  }, [coachId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !coach?.webhookUrl) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(coach.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionId,
          action: "sendMessage",
          chatInput: userMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.output || data.message || JSON.stringify(data),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCoachLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Coach not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 mb-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "assistant" && (
              <img src={coach.image} alt={coach.name} className="w-10 h-10 rounded-full flex-shrink-0" />
            )}
            <div className={`flex-1 ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
              <div className={`rounded-lg p-4 mb-1 max-w-[80%] ${
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
            <img src={coach.image} alt={coach.name} className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input - Fixed at Bottom */}
      <div className="border-t bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          {coach.webhookUrl ? (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Message ${coach.name}...`}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-12 w-12 bg-gradient-primary"
                disabled={!message.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Chat is not available for this coach yet.</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This is an AI simulation of {coach.name}'s coaching style. For live sessions, book a consultation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatActive;