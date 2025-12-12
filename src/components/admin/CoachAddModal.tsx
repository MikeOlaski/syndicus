import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Bot, User, RotateCcw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { FormattedMessage } from "@/components/ui/formatted-message";

const STORAGE_KEY = "coach-chat-messages";
const SESSION_KEY = "coach-chat-session-id";

const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CoachAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CoachAddModal = ({
  open,
  onOpenChange,
  onSuccess,
}: CoachAddModalProps) => {
  const { toast } = useToast();
  const [sessionId] = useState(() => getOrCreateSessionId());
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load messages from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentMessageIdRef = useRef<string | null>(null);

  // Subscribe to realtime broadcast for additional agent responses
  useEffect(() => {
    const channel = supabase.channel(`agent-responses-${sessionId}`);
    
    channel
      .on("broadcast", { event: "agent-response" }, (payload) => {
        console.log("Received broadcast:", payload);
        const { message_id, response } = payload.payload;
        
        // Only process if it matches our current message or is a follow-up
        if (response) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: response },
          ]);
        }
      })
      .subscribe((status) => {
        console.log("Broadcast channel status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Auto scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Focus textarea when modal opens and scroll to bottom
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        textareaRef.current?.focus();
        scrollToBottom();
      }, 100);
    }
  }, [open, scrollToBottom]);

  const handleNewChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
    setMessages([]);
    setInput("");
    toast({
      title: "New conversation started",
      description: "Previous chat has been cleared.",
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    currentMessageIdRef.current = messageId;

    try {
      // Only send message and session_id - history is stored locally
      const { data: response, error } = await supabase.functions.invoke('persona-chat', {
        body: {
          message: userMessage,
          message_id: messageId,
          session_id: sessionId,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Handle response - supports single message or array of messages
      let responses: string[] = [];
      
      if (Array.isArray(response)) {
        // Array of responses from multiple webhook nodes
        responses = response.map((r: any) => 
          typeof r === "string" ? r : r?.message || r?.response || r?.output || JSON.stringify(r)
        );
      } else if (response?.responses && Array.isArray(response.responses)) {
        // Object with responses array
        responses = response.responses.map((r: any) => 
          typeof r === "string" ? r : r?.message || r?.response || r?.output || JSON.stringify(r)
        );
      } else {
        // Single response
        const msg = typeof response === "string" 
          ? response 
          : response?.message || response?.response || response?.output || JSON.stringify(response);
        responses = [msg];
      }

      // Add all responses as separate messages
      setMessages((prev) => [
        ...prev,
        ...responses.map((content) => ({ role: "assistant" as const, content })),
      ]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      // Remove the user message if failed
      setMessages((prev) => prev.slice(0, -1));
      setInput(userMessage); // Restore input
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[1000px] h-[85vh] max-h-[800px] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Create Coach via Chat
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              className="gap-2 mr-6"
            >
              <RotateCcw className="w-4 h-4" />
              New Chat
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Chat with the AI assistant to create a new coach profile
          </p>
        </DialogHeader>

        {/* Chat Messages Area */}
        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                <Bot className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="text-sm">
                  Tell me about the coach you want to create
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <FormattedMessage content={message.content} className="text-sm" />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t px-6 py-4">
          <div className="flex gap-3 items-end">
            <Textarea
              ref={textareaRef}
              placeholder="Describe the coach you want to create..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px] flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
