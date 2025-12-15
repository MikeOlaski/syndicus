import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Send, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FormattedMessage } from "@/components/ui/formatted-message";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ExpertAdvisorChatProps {
  initialQuery: string;
  onClose: () => void;
}

const ExpertAdvisorChat = ({ initialQuery, onClose }: ExpertAdvisorChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "user", content: initialQuery }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Send initial query
    if (initialQuery) {
      handleSendMessage(initialQuery, true);
    }
  }, []);

  const handleSendMessage = async (messageText?: string, isInitial = false) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    if (!isInitial) {
      const userMessage: Message = { role: "user", content: textToSend };
      setMessages(prev => [...prev, userMessage]);
      setInput("");
    }

    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke("expert-advisor", {
        body: { 
          messages: isInitial ? [{ role: "user", content: textToSend }] : 
                   [...messages, { role: "user", content: textToSend }]
        }
      });

      if (response.error) throw response.error;

      // Handle streaming response
      if (response.data) {
        const reader = response.data.getReader?.();
        if (reader) {
          let assistantContent = "";
          const decoder = new TextDecoder();
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const text = decoder.decode(value, { stream: true });
            const lines = text.split("\n");
            
            for (const line of lines) {
              if (line.startsWith("data: ") && line !== "data: [DONE]") {
                try {
                  const json = JSON.parse(line.slice(6));
                  const content = json.choices?.[0]?.delta?.content;
                  if (content) {
                    assistantContent += content;
                    setMessages(prev => {
                      const last = prev[prev.length - 1];
                      if (last?.role === "assistant" && prev.length > 1) {
                        return prev.map((m, i) => 
                          i === prev.length - 1 ? { ...m, content: assistantContent } : m
                        );
                      }
                      return [...prev, { role: "assistant", content: assistantContent }];
                    });
                  }
                } catch {}
              }
            }
          }
        } else if (typeof response.data === "string") {
          setMessages(prev => [...prev, { role: "assistant", content: response.data }]);
        } else if (response.data.content) {
          setMessages(prev => [...prev, { role: "assistant", content: response.data.content }]);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <Card className="fixed inset-x-4 bottom-4 md:inset-x-auto md:right-8 md:bottom-8 md:w-[600px] md:max-h-[700px] z-50 flex flex-col bg-background border-2 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-primary/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold">Syndic8 Expert Advisor</h3>
            <p className="text-xs text-muted-foreground">
              Building your personalized expert team
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.role === "user" ? (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              ) : (
                <FormattedMessage content={message.content} className="text-sm" />
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask follow-up questions..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ExpertAdvisorChat;
