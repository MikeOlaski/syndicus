import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Send, Sparkles, Users, Target, Zap, Scale } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FormattedMessage } from "@/components/ui/formatted-message";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ExpertRecruiterChatProps {
  initialQuery: string;
  onClose: () => void;
}

const ExpertRecruiterChat = ({ initialQuery, onClose }: ExpertRecruiterChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "user", content: initialQuery }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Animate to expanded state
    const timer = setTimeout(() => setIsExpanded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Send initial query
    if (initialQuery) {
      handleSendMessage(initialQuery, true);
    }
  }, []);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

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

  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {/* Full-screen backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isExpanded ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ 
          opacity: isExpanded ? 1 : 0, 
          scale: isExpanded ? 1 : 0.9, 
          y: isExpanded ? 0 : 20 
        }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed inset-4 md:inset-8 lg:inset-12 z-50 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 rounded-t-2xl border border-b-0"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Expert Recruiter
              </h2>
              <p className="text-sm text-muted-foreground">
                Assembling your perfect Council of Experts
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Syndic8 Structure Indicators */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-background/50 rounded-lg border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Scale className="w-4 h-4 text-blue-500" />
                <span>Balanced</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-4 h-4 text-green-500" />
                <span>Complimentary</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Adversarial</span>
              </div>
            </div>
            
            <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Messages Area */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/80 backdrop-blur-sm border-x"
        >
          {/* Welcome Message */}
          {messages.length === 1 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary mb-4">
                <Target className="w-4 h-4" />
                Analyzing your challenge...
              </div>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 ${
                  message.role === "user"
                    ? "bg-gradient-primary text-primary-foreground"
                    : "bg-card border shadow-sm"
                }`}
              >
                {message.role === "user" ? (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <FormattedMessage content={message.content} className="text-sm" />
                )}
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-card border rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    Recruiting experts...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </motion.div>

        {/* Input Area */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          onSubmit={handleSubmit} 
          className="p-6 bg-card rounded-b-2xl border border-t-0"
        >
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe more about your challenge or ask follow-up questions..."
              className="flex-1 px-5 py-3 text-base border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-all"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="lg"
              className="rounded-xl bg-gradient-primary px-6"
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-3">
            Our Expert Recruiter matches you with individual experts and suggests optimal Syndic8 group compositions
          </p>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExpertRecruiterChat;
