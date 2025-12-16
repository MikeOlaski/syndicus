import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Calendar, Phone, Mail, MessageCircle, Maximize2, Send, Loader2, Shield, Globe, Twitter, Linkedin, Instagram, Share2, Copy, Check, Facebook } from "lucide-react";
import Header from "@/components/Header";
import { useCoachChat } from "@/hooks/useCoachChat";
import { useEffect, useRef, useState } from "react";
import { SubscribeButton } from "@/components/SubscribeButton";
import { MessageLimitBanner } from "@/components/MessageLimitBanner";
import { GuestLimitModal } from "@/components/GuestLimitModal";
import { GuestMessageBanner } from "@/components/GuestMessageBanner";
import { SubscriptionLimitModal } from "@/components/SubscriptionLimitModal";
import { ClaimCoachModal } from "@/components/ClaimCoachModal";
import { FormattedMessage } from "@/components/ui/formatted-message";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const CoachProfile = () => {
  const { coachSlug } = useParams();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    coach,
    isCoachLoading,
    sendMessage,
    messagesEndRef,
    guestLimit,
    showGuestLimitModal,
    setShowGuestLimitModal,
    showSubscriptionLimitModal,
    setShowSubscriptionLimitModal,
    subscriptionStatus,
  } = useCoachChat(coachSlug);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const profileUrl = `https://syndic.us/${coachSlug}`;
  
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = `Check out ${displayCoach?.name || "this coach"}'s AI coaching assistant on Syndic.us!`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, "_blank");
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayCoach?.name || "Coach"} - Syndic.us`,
          text: `Check out ${displayCoach?.name || "this coach"}'s AI coaching assistant!`,
          url: profileUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopyLink();
    }
  };

  // Fallback static data for display when coach data isn't loaded
  const displayCoach = coach || {
    id: coachSlug || "1",
    slug: coachSlug || "coach",
    name: "Coach",
    specialization: "General Coaching",
    image: `https://api.dicebear.com/7.x/initials/svg?seed=Coach`,
  };

  // Use dynamic data from coach when available
  const profileData = {
    rating: 4.9,
    clients: 280,
    personality: coach?.personality || "Strategic, analytical, and empowering",
    about: coach?.bio || `${displayCoach.name} is a renowned coach with extensive experience helping clients achieve their goals. Their AI-powered coaching approach combines expertise with personalized insights to help you succeed.`,
    specializations: coach?.expertise || ["Leadership", "Strategy", "Growth"],
    hourlyRate: coach?.hourlyRate || 200,
    websiteUrl: coach?.websiteUrl,
    twitterUrl: coach?.twitterUrl,
    linkedinUrl: coach?.linkedinUrl,
    instagramUrl: coach?.instagramUrl,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[380px_1fr] gap-6 max-w-7xl mx-auto">
          {/* Left Sidebar - Coach Details */}
          <div className="bg-card border rounded-lg p-6 h-fit">
            <div className="text-center mb-6">
              <div className="flex justify-end mb-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy Link"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShareTwitter} className="gap-2 cursor-pointer">
                      <Twitter className="w-4 h-4" />
                      Share on X
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShareLinkedIn} className="gap-2 cursor-pointer">
                      <Linkedin className="w-4 h-4" />
                      Share on LinkedIn
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShareFacebook} className="gap-2 cursor-pointer">
                      <Facebook className="w-4 h-4" />
                      Share on Facebook
                    </DropdownMenuItem>
                    {"share" in navigator && (
                      <DropdownMenuItem onClick={handleNativeShare} className="gap-2 cursor-pointer">
                        <Share2 className="w-4 h-4" />
                        More options...
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <img
                src={displayCoach.image}
                alt={displayCoach.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/${coachSlug}`)}
              />
              <h2 
                className="text-2xl font-bold mb-1 cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate(`/${coachSlug}`)}
              >
                {displayCoach.name}
              </h2>
              <p className="text-primary font-medium mb-3">{displayCoach.specialization}</p>
              <div className="flex items-center justify-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{profileData.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{profileData.clients} clients</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-3">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{profileData.about}</p>
              </div>

              <div>
                <h3 className="font-bold mb-3">Bot Personality</h3>
                <p className="text-sm text-muted-foreground italic">{profileData.personality}</p>
              </div>

              <div>
                <h3 className="font-bold mb-3">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </div>

              {/* Website & Socials */}
              {(profileData.websiteUrl || profileData.twitterUrl || profileData.linkedinUrl || profileData.instagramUrl) && (
                <div>
                  <h3 className="font-bold mb-3">Website & Socials</h3>
                  <div className="space-y-2">
                    {profileData.websiteUrl && (
                      <a 
                        href={profileData.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        <span className="truncate">{profileData.websiteUrl.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                    {profileData.twitterUrl && (
                      <a 
                        href={profileData.twitterUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                        <span className="truncate">Twitter / X</span>
                      </a>
                    )}
                    {profileData.linkedinUrl && (
                      <a 
                        href={profileData.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span className="truncate">LinkedIn</span>
                      </a>
                    )}
                    {profileData.instagramUrl && (
                      <a 
                        href={profileData.instagramUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                        <span className="truncate">Instagram</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t space-y-3">
                {/* Claim Coach Button - only show for unclaimed coaches */}
                {coach && !coach.isClaimed && (
                  <Button 
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setShowClaimModal(true)}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Claim This Profile
                  </Button>
                )}

                {/* Subscribe Button */}
                <SubscribeButton 
                  coachId={coach?.id || displayCoach.id}
                  coachName={displayCoach.name}
                  className="w-full"
                  showStatus={true}
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Live Sessions</span>
                  <span className="text-lg font-bold text-primary">${profileData.hourlyRate}/hour</span>
                </div>
                <Button className="w-full bg-gradient-primary">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Session
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
                <Button 
                  className="w-full bg-gradient-primary"
                  onClick={() => navigate(`/${coachSlug}/chat`)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Try Full-Screen Chat
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="bg-card border rounded-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
            {/* Chat Header */}
            <div className="border-b p-4 flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{displayCoach.name}'s AI Coaching Assistant</h3>
                  <p className="text-xs text-muted-foreground">
                    Experience coaching powered by AI
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-green-600 font-medium">Online</span>
                  </span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(`/${coachSlug}/chat/active`)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Messages */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 p-6 overflow-y-auto"
            >
              {isCoachLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 mb-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      {msg.role === "assistant" && (
                        <img 
                          src={displayCoach.image} 
                          alt={displayCoach.name} 
                          className="w-8 h-8 rounded-full flex-shrink-0" 
                        />
                      )}
                      <div className={`flex-1 ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
                        <div className={`rounded-lg p-3 mb-1 max-w-[80%] ${
                          msg.role === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}>
                          {msg.role === "user" ? (
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            <FormattedMessage content={msg.content} className="text-sm" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3 mb-4">
                      <img 
                        src={displayCoach.image} 
                        alt={displayCoach.name} 
                        className="w-8 h-8 rounded-full flex-shrink-0" 
                      />
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
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
                coachId={coach?.id || displayCoach.id}
                onUpgrade={() => navigate("/pricing")}
              />
            )}

            {/* Chat Input */}
            <div className="border-t p-4">
              {coach?.webhookUrl ? (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={guestLimit.isLimitReached ? "Sign up to continue chatting..." : `Ask ${displayCoach.name}'s AI assistant anything...`}
                    disabled={isLoading || guestLimit.isLimitReached}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background disabled:opacity-50"
                  />
                  <Button 
                    type="submit"
                    size="icon" 
                    className="bg-gradient-primary"
                    disabled={!inputValue.trim() || isLoading || guestLimit.isLimitReached}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </form>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Chat not available yet..."
                    disabled
                    className="flex-1 px-4 py-2 border rounded-lg bg-muted cursor-not-allowed"
                  />
                  <Button size="icon" disabled className="bg-muted">
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {guestLimit.isGuest 
                  ? `${guestLimit.messagesRemaining} of ${guestLimit.limit} free messages remaining`
                  : "This is an AI simulation. For actual coaching, book a live session."
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Limit Modal */}
      <GuestLimitModal 
        open={showGuestLimitModal}
        onOpenChange={setShowGuestLimitModal}
        coachName={displayCoach.name}
      />

      {/* Subscription Limit Modal */}
      <SubscriptionLimitModal
        open={showSubscriptionLimitModal}
        onOpenChange={setShowSubscriptionLimitModal}
        tier={subscriptionStatus?.tier}
      />

      {/* Claim Coach Modal */}
      <ClaimCoachModal
        open={showClaimModal}
        onOpenChange={setShowClaimModal}
        coachId={coach?.id || displayCoach.id}
        coachName={displayCoach.name}
        coachSlug={coachSlug || ""}
      />
    </div>
  );
};

export default CoachProfile;
