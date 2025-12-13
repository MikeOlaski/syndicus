import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Minimize2, Loader2, Send, Plus, History, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCoachChat } from "@/hooks/useCoachChat";
import { SubscribeButton } from "@/components/SubscribeButton";
import { MessageLimitBanner } from "@/components/MessageLimitBanner";
import { GuestLimitModal } from "@/components/GuestLimitModal";
import { GuestMessageBanner } from "@/components/GuestMessageBanner";

const ChatActive = () => {
  const { coachSlug } = useParams();
  const navigate = useNavigate();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const {
    message,
    setMessage,
    messages,
    isLoading,
    coach,
    isCoachLoading,
    sessionId,
    sessions,
    messagesEndRef,
    createNewSession,
    loadSession,
    deleteSession,
    sendMessage,
    guestLimit,
    showGuestLimitModal,
    setShowGuestLimitModal,
  } = useCoachChat(coachSlug);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage();
  };

  const handleNewChat = () => {
    createNewSession();
    setIsHistoryOpen(false);
  };

  const handleLoadSession = (session: any) => {
    loadSession(session);
    setIsHistoryOpen(false);
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
      <Header />
      
      {/* Chat Controls Bar */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleNewChat}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>

            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <History className="w-4 h-4" />
                  History
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Chat History</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                  {sessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No chat history yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {sessions.map((session) => (
                        <div
                          key={session.sessionId}
                          onClick={() => handleLoadSession(session)}
                          className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors group ${
                            session.sessionId === sessionId ? "bg-muted border-primary" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {session.lastMessage || "New conversation"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(session.createdAt).toLocaleDateString()} • {session.messages.length} messages
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => deleteSession(session.sessionId, e)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-3">
            {/* Subscribe Button */}
            <SubscribeButton 
              coachId={coach.id}
              coachName={coach.name}
              size="sm"
              showStatus={false}
            />

            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(`/${coachSlug}`)}
            >
              <img src={coach.image} alt={coach.name} className="w-8 h-8 rounded-full" />
              <div className="text-right">
                <div className="font-bold text-sm">{coach.name}</div>
                <div className="text-xs text-primary">{coach.specialization}</div>
              </div>
            </div>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-green-600 font-medium">Online</span>
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(`/${coachSlug}`)}
              title="Back to profile"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

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

      {/* Guest Message Banner */}
      {guestLimit.isGuest && (
        <GuestMessageBanner 
          messagesRemaining={guestLimit.messagesRemaining}
          isGuest={guestLimit.isGuest}
        />
      )}

      {/* Message Limit Banner (for logged-in free tier) */}
      {!guestLimit.isGuest && (
        <MessageLimitBanner 
          coachId={coach.id}
          onUpgrade={() => navigate("/pricing")}
        />
      )}

      {/* Chat Input - Fixed at Bottom */}
      <div className="border-t bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          {coach.webhookUrl ? (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={guestLimit.isLimitReached ? "Sign up to continue chatting..." : `Message ${coach.name}...`}
                disabled={isLoading || guestLimit.isLimitReached}
                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background disabled:opacity-50"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-12 w-12 bg-gradient-primary"
                disabled={!message.trim() || isLoading || guestLimit.isLimitReached}
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
            {guestLimit.isGuest 
              ? `${guestLimit.messagesRemaining} of ${guestLimit.limit} free messages remaining • Sign up for more`
              : `This is an AI simulation of ${coach.name}'s coaching style. For live sessions, book a consultation.`
            }
          </p>
        </div>
      </div>

      {/* Guest Limit Modal */}
      <GuestLimitModal 
        open={showGuestLimitModal}
        onOpenChange={setShowGuestLimitModal}
        coachName={coach.name}
      />
    </div>
  );
};

export default ChatActive;
