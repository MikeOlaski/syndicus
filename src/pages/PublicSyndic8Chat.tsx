import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Loader2, 
  ArrowLeft, 
  Zap,
  Users,
  LogIn
} from "lucide-react";
import { usePublicSyndic8Chat } from "@/hooks/usePublicSyndic8Chat";
import { CouncilMessage } from "@/components/CouncilMessage";
import Header from "@/components/Header";

const TEMPLATE_INFO = {
  balanced: {
    label: "Balanced Council",
    color: "text-blue-500",
  },
  complimentary: {
    label: "Complimentary Council",
    color: "text-green-500",
  },
  adversarial: {
    label: "Adversarial Council",
    color: "text-orange-500",
  },
};

const PublicSyndic8Chat = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const {
    messages,
    message,
    setMessage,
    isLoading,
    currentStage,
    group,
    members,
    settings,
    isGroupLoading,
    isAuthenticated,
    messagesEndRef,
    sendMessage,
  } = usePublicSyndic8Chat(groupId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const templateInfo = settings?.councilTemplate 
    ? TEMPLATE_INFO[settings.councilTemplate] 
    : TEMPLATE_INFO.balanced;

  if (isGroupLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Council Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This council doesn't exist or isn't available publicly.
            </p>
            <Button onClick={() => navigate("/syndic8")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Councils
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/syndic8")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">{group.name}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${templateInfo.color}`}>
                    {templateInfo.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {members.length} experts
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Member Avatars */}
          <div className="flex -space-x-2">
            {members.slice(0, 5).map((member) => (
              <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                <AvatarImage src={member.avatarUrl} alt={member.name} />
                <AvatarFallback className="text-xs">
                  {member.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
            {members.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                +{members.length - 5}
              </div>
            )}
          </div>
        </div>
        
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <CouncilMessage 
                key={msg.id} 
                message={msg} 
                showExpertReasoning={settings?.showExpertReasoning || false}
              />
            ))}
            
            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-start">
                <Card className="p-4 max-w-[80%]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Council Deliberating</p>
                      <p className="text-xs text-muted-foreground">
                        {currentStage || "Processing..."}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input Area */}
        <div className="border-t px-6 py-4 shrink-0">
          {!isAuthenticated ? (
            <div className="max-w-3xl mx-auto text-center">
              <Card className="p-6">
                <LogIn className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Sign in to Chat</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Create a free account to ask questions and get responses from this expert council.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate("/auth?mode=signup")}>
                    Create Free Account
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="flex gap-3">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask this council a question..."
                  className="min-h-[60px] resize-none"
                  disabled={isLoading || members.length === 0}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  className="shrink-0 h-[60px] w-[60px]"
                  disabled={isLoading || !message.trim() || members.length === 0}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {members.length} experts will deliberate and synthesize a unified response
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicSyndic8Chat;
