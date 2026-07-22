import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, Check, X, Bot, User } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface GeneratedContent {
  type: "bio" | "specialization" | "expertise" | "personality";
  content: string;
}

interface AIProfileAssistantProps {
  currentProfile: {
    bio: string | null;
    specialization: string | null;
    personality: string | null;
    expertise: string[] | null;
  };
  onApplyContent: (type: GeneratedContent["type"], content: string | string[]) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-coach-profile`;

export const AIProfileAssistant = ({ currentProfile, onApplyContent }: AIProfileAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm here to help you create a compelling coaching profile. I can help generate your professional bio, specialization, expertise tags, and personality description. What would you like to start with? Or tell me about your coaching background and I'll help craft your profile content."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingContent, setPendingContent] = useState<GeneratedContent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const parseGeneratedContent = (text: string): GeneratedContent[] => {
    const patterns = [
      { type: "bio" as const, regex: /\[GENERATED_BIO\]([\s\S]*?)\[\/GENERATED_BIO\]/g },
      { type: "specialization" as const, regex: /\[GENERATED_SPECIALIZATION\]([\s\S]*?)\[\/GENERATED_SPECIALIZATION\]/g },
      { type: "expertise" as const, regex: /\[GENERATED_EXPERTISE\]([\s\S]*?)\[\/GENERATED_EXPERTISE\]/g },
      { type: "personality" as const, regex: /\[GENERATED_PERSONALITY\]([\s\S]*?)\[\/GENERATED_PERSONALITY\]/g },
    ];

    const results: GeneratedContent[] = [];
    for (const { type, regex } of patterns) {
      let match;
      while ((match = regex.exec(text)) !== null) {
        results.push({ type, content: match[1].trim() });
      }
    }
    return results;
  };

  const cleanMessageContent = (text: string): string => {
    return text
      .replace(/\[GENERATED_BIO\][\s\S]*?\[\/GENERATED_BIO\]/g, "")
      .replace(/\[GENERATED_SPECIALIZATION\][\s\S]*?\[\/GENERATED_SPECIALIZATION\]/g, "")
      .replace(/\[GENERATED_EXPERTISE\][\s\S]*?\[\/GENERATED_EXPERTISE\]/g, "")
      .replace(/\[GENERATED_PERSONALITY\][\s\S]*?\[\/GENERATED_PERSONALITY\]/g, "")
      .trim();
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const session = await (await import("@/integrations/supabase/client")).supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          currentProfile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI response");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const updateAssistant = (content: string) => {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
          }
          return [...prev, { role: "assistant", content }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              updateAssistant(assistantContent);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Parse for generated content
      const generated = parseGeneratedContent(assistantContent);
      if (generated.length > 0) {
        setPendingContent(generated);
      }

    } catch (error: any) {
      console.error("AI chat error:", error);
      toast.error(error.message || "Failed to get AI response");
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyContent = (item: GeneratedContent) => {
    if (item.type === "expertise") {
      const tags = item.content.split(",").map(t => t.trim()).filter(Boolean);
      onApplyContent(item.type, tags);
    } else {
      onApplyContent(item.type, item.content);
    }
    setPendingContent(prev => prev.filter(p => p !== item));
    toast.success(`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} applied to your profile!`);
  };

  const handleDismissContent = (item: GeneratedContent) => {
    setPendingContent(prev => prev.filter(p => p !== item));
  };

  const getTypeLabel = (type: GeneratedContent["type"]) => {
    const labels = {
      bio: "Professional Bio",
      specialization: "Specialization",
      expertise: "Expertise Tags",
      personality: "Personality & Style"
    };
    return labels[type];
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">AI Profile Assistant</h3>
        <Badge variant="secondary" className="ml-auto">Beta</Badge>
      </div>

      {/* Pending content to apply */}
      {pendingContent.length > 0 && (
        <div className="p-3 border-b bg-green-500/10 space-y-2">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">Generated content ready to apply:</p>
          {pendingContent.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-background rounded border">
              <div className="flex-1 min-w-0">
                <Badge variant="outline" className="mb-1">{getTypeLabel(item.type)}</Badge>
                <p className="text-xs text-muted-foreground truncate">
                  {item.type === "expertise" 
                    ? item.content.split(",").slice(0, 3).join(", ") + (item.content.split(",").length > 3 ? "..." : "")
                    : item.content.slice(0, 60) + (item.content.length > 60 ? "..." : "")}
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleApplyContent(item)}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => handleDismissContent(item)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted"
              }`}>
                <p className="text-sm whitespace-pre-wrap">{cleanMessageContent(msg.content)}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="Tell me about your coaching experience, or ask me to generate specific profile sections..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="min-h-[60px] max-h-[120px] resize-none"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()} className="self-end">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Try: "Generate a professional bio based on my expertise" or "What expertise tags would you suggest?"
        </p>
      </div>
    </Card>
  );
};
