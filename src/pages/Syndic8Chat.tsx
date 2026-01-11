import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Send, 
  Loader2, 
  ArrowLeft, 
  Settings, 
  Users,
  Zap,
  Plus,
  AlertCircle
} from "lucide-react";
import { useSyndic8Chat, CouncilTemplate } from "@/hooks/useSyndic8Chat";
import { CouncilMessage } from "@/components/CouncilMessage";

const TEMPLATE_INFO = {
  balanced: {
    label: "Balanced Council",
    description: "Equal representation across complementary domains",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  complimentary: {
    label: "Complimentary Council",
    description: "Experts whose skills amplify each other",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  adversarial: {
    label: "Adversarial Council",
    description: "Constructive challenge and stress-testing",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
};

const Syndic8Chat = () => {
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
    messagesEndRef,
    sendMessage,
    updateSettings,
    startNewSession,
  } = useSyndic8Chat(groupId);

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

  if (isGroupLoading) {
    return (
      <DashboardLayout requiredRole="subscriber">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!group) {
    return (
      <DashboardLayout requiredRole="subscriber">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Council Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This Syndic8 group doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate("/subscriber-dashboard/syndic8s")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Syndic8s
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const templateInfo = TEMPLATE_INFO[settings.councilTemplate];

  return (
    <DashboardLayout requiredRole="subscriber">
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/subscriber-dashboard/syndic8s")}
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
          
          <div className="flex items-center gap-2">
            {/* Member Avatars */}
            <div className="flex -space-x-2 mr-2">
              {members.slice(0, 4).map((member) => (
                <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback className="text-xs">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {members.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                  +{members.length - 4}
                </div>
              )}
            </div>
            
            <Button variant="outline" size="sm" onClick={startNewSession}>
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Button>
            
            {/* Settings Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Council Settings</SheetTitle>
                  <SheetDescription>
                    Configure how your council deliberates
                  </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-6 mt-6">
                  {/* Council Template */}
                  <div className="space-y-2">
                    <Label>Council Template</Label>
                    <Select
                      value={settings.councilTemplate}
                      onValueChange={(value: CouncilTemplate) => 
                        updateSettings({ councilTemplate: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balanced">
                          <div>
                            <p className="font-medium">🔵 Balanced</p>
                            <p className="text-xs text-muted-foreground">Equal representation</p>
                          </div>
                        </SelectItem>
                        <SelectItem value="complimentary">
                          <div>
                            <p className="font-medium">🟢 Complimentary</p>
                            <p className="text-xs text-muted-foreground">Skills that amplify</p>
                          </div>
                        </SelectItem>
                        <SelectItem value="adversarial">
                          <div>
                            <p className="font-medium">🟠 Adversarial</p>
                            <p className="text-xs text-muted-foreground">Stress-testing ideas</p>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {TEMPLATE_INFO[settings.councilTemplate].description}
                    </p>
                  </div>
                  
                  {/* Show Expert Reasoning */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Expert Reasoning</Label>
                      <p className="text-xs text-muted-foreground">
                        Display individual expert perspectives
                      </p>
                    </div>
                    <Switch
                      checked={settings.showExpertReasoning}
                      onCheckedChange={(checked) => 
                        updateSettings({ showExpertReasoning: checked })
                      }
                    />
                  </div>
                  
                  {/* Council Members */}
                  <div className="space-y-2">
                    <Label>Council Members ({members.length})</Label>
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div 
                          key={member.id} 
                          className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {member.specialization}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => navigate(`/subscriber-dashboard/syndic8s/${groupId}`)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Members
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <CouncilMessage 
                key={msg.id} 
                message={msg} 
                showExpertReasoning={settings.showExpertReasoning}
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
            
            {/* Empty State */}
            {members.length === 0 && !isLoading && (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Council Members</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Add experts to your council to start deliberating.
                </p>
                <Button onClick={() => navigate(`/subscriber-dashboard/syndic8s/${groupId}`)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experts
                </Button>
              </Card>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input Area */}
        <div className="border-t px-6 py-4 shrink-0">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your council a question..."
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
              Your {members.length} experts will deliberate and synthesize a unified response
            </p>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Syndic8Chat;
