import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Bot, User } from "lucide-react";
import { FormattedMessage } from "@/components/ui/formatted-message";

// Use edge function for secure webhook calls
const COACH_WEBHOOK_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-webhook`;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface CoachChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachName: string;
  coachBio: string | null;
  coachAvatar: string | null;
  coachProfileId: string; // coach_profiles.id - used for secure webhook proxy
  coachId: string; // user_id - used for session storage key
}

export const CoachChatModal = ({
  open,
  onOpenChange,
  coachName,
  coachBio,
  coachAvatar,
  coachProfileId,
  coachId,
}: CoachChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Generate or retrieve session ID from localStorage
  const getOrCreateSessionId = () => {
    const storageKey = `chat_session_${coachId}`;
    let storedSessionId = localStorage.getItem(storageKey);
    
    if (!storedSessionId) {
      // Generate a new session ID (hex format like in the screenshot)
      storedSessionId = Array.from({ length: 32 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      localStorage.setItem(storageKey, storedSessionId);
    }
    
    return storedSessionId;
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (open) {
      const sid = getOrCreateSessionId();
      setSessionId(sid);
      setMessages([]);
      setInput("");
    }
  }, [open, coachId]);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Use secure edge function to proxy webhook calls
      const response = await fetch(COACH_WEBHOOK_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coachProfileId: coachProfileId,
          sessionId: sessionId,
          action: "sendMessage",
          chatInput: userMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from webhook');
      }
      
      // Extract response content with validation - never use JSON.stringify as fallback
      let responseContent: string;
      if (typeof data.response === 'string') {
        responseContent = data.response;
      } else if (typeof data.output === 'string') {
        responseContent = data.output;
      } else if (typeof data.message === 'string') {
        responseContent = data.message;
      } else {
        throw new Error('Invalid response content from webhook');
      }
      
      // Sanitize and limit content length
      const sanitizedContent = responseContent
        .slice(0, 50000) // Enforce length limit
        .trim();
      
      if (!sanitizedContent) {
        throw new Error('Empty response from webhook');
      }
      
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: sanitizedContent,
      };

      setMessages((prev) => [...prev, assistantMessage]);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={coachAvatar || undefined} alt={coachName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(coachName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold truncate">
                Chat with {coachName}
              </DialogTitle>
              {coachBio && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {coachBio}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                <Bot className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="text-sm">Send a message to chat with {coachName}</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  {message.role === "assistant" ? (
                    <>
                      <AvatarImage src={coachAvatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(coachName)}
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <FormattedMessage 
                      content={message.content} 
                      className="text-sm [&_a]:text-primary [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary/80 [&_p]:my-1 [&_ul]:my-2 [&_li]:my-0.5"
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={coachAvatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(coachName)}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${coachName}...`}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
