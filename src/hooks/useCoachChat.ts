import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGuestMessageLimit } from "@/hooks/useGuestMessageLimit";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

interface CoachData {
  id: string;
  slug: string;
  name: string;
  specialization: string;
  image: string;
  webhookUrl: string | null;
  isClaimed: boolean;
  bio: string | null;
  personality: string | null;
  expertise: string[] | null;
  hourlyRate: number | null;
  websiteUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatSession {
  sessionId: string;
  coachId: string; // Always UUID for internal storage
  createdAt: string;
  lastMessage: string;
  messages: Message[];
}

// LocalStorage helper functions - always use UUID (coachId) for keys
const getStorageKey = (coachId: string) => `chat_sessions_${coachId}`;
const getCurrentSessionKey = (coachId: string) => `current_session_${coachId}`;

const getSessions = (coachId: string): ChatSession[] => {
  const stored = localStorage.getItem(getStorageKey(coachId));
  return stored ? JSON.parse(stored) : [];
};

const saveSessions = (coachId: string, sessions: ChatSession[]) => {
  localStorage.setItem(getStorageKey(coachId), JSON.stringify(sessions));
};

const generateSessionId = () => {
  return Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

/**
 * Hook for managing coach chat - accepts slug and resolves to UUID internally
 */
export const useCoachChat = (coachSlug: string | undefined) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [coach, setCoach] = useState<CoachData | null>(null);
  const [isCoachLoading, setIsCoachLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>("");
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);
  const [showSubscriptionLimitModal, setShowSubscriptionLimitModal] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [coachId, setCoachId] = useState<string>(""); // The UUID
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Guest message limit tracking
  const guestLimit = useGuestMessageLimit(coachId || undefined);
  
  // Subscription limits for logged-in users
  const { checkDailyMessageLimit, incrementMessageCount, status: subscriptionStatus } = useSubscriptionLimits();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Save messages to localStorage whenever they change (using UUID coachId)
  useEffect(() => {
    if (!coachId || !sessionId || messages.length === 0) return;
    
    const allSessions = getSessions(coachId);
    const existingIndex = allSessions.findIndex(s => s.sessionId === sessionId);
    
    const sessionData: ChatSession = {
      sessionId,
      coachId,
      createdAt: existingIndex >= 0 ? allSessions[existingIndex].createdAt : new Date().toISOString(),
      lastMessage: messages[messages.length - 1]?.content.slice(0, 50) || "",
      messages,
    };

    if (existingIndex >= 0) {
      allSessions[existingIndex] = sessionData;
    } else {
      allSessions.unshift(sessionData);
    }

    saveSessions(coachId, allSessions);
    setSessions(allSessions);
    localStorage.setItem(getCurrentSessionKey(coachId), sessionId);
  }, [messages, sessionId, coachId]);

  const createNewSession = useCallback((coachName?: string) => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: `Hello! I'm ${coachName || coach?.name || "your coach"}'s AI coaching assistant. I'm here to help you. What can I assist you with today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([welcomeMessage]);
    
    if (coachId) {
      localStorage.setItem(getCurrentSessionKey(coachId), newSessionId);
    }
  }, [coach?.name, coachId]);

  // Fetch coach by slug and resolve to UUID
  useEffect(() => {
    const fetchCoach = async () => {
      if (!coachSlug) return;
      
      try {
        // First, try to find coach by slug
        const { data: coachProfile, error: coachError } = await supabase
          .from("coach_profiles")
          .select("user_id, slug, specialization, personality, webhook_url, is_claimed, bio, expertise, hourly_rate, website_url, twitter_url, linkedin_url, instagram_url")
          .eq("slug", coachSlug)
          .maybeSingle();

        if (coachError) throw coachError;

        if (!coachProfile) {
          console.error("Coach not found for slug:", coachSlug);
          setIsCoachLoading(false);
          return;
        }

        const resolvedCoachId = coachProfile.user_id;
        setCoachId(resolvedCoachId);

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", resolvedCoachId)
          .maybeSingle();

        if (profileError) throw profileError;

        const coachData: CoachData = {
          id: resolvedCoachId,
          slug: coachProfile.slug || coachSlug,
          name: profile?.full_name || "Coach",
          specialization: coachProfile.specialization || "General Coaching",
          image: profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || 'Coach'}`,
          webhookUrl: coachProfile.webhook_url,
          isClaimed: coachProfile.is_claimed || false,
          bio: coachProfile.bio,
          personality: coachProfile.personality,
          expertise: coachProfile.expertise,
          hourlyRate: coachProfile.hourly_rate,
          websiteUrl: coachProfile.website_url,
          twitterUrl: coachProfile.twitter_url,
          linkedinUrl: coachProfile.linkedin_url,
          instagramUrl: coachProfile.instagram_url,
        };
        setCoach(coachData);

        // Load existing sessions using UUID
        const existingSessions = getSessions(resolvedCoachId);
        setSessions(existingSessions);

        // Check for current session or create new one
        const currentSessionId = localStorage.getItem(getCurrentSessionKey(resolvedCoachId));
        const existingSession = existingSessions.find(s => s.sessionId === currentSessionId);

        if (existingSession && existingSession.messages.length > 0) {
          // Resume existing session
          setSessionId(existingSession.sessionId);
          setMessages(existingSession.messages);
        } else {
          // Create new session
          const newSessionId = generateSessionId();
          setSessionId(newSessionId);
          
          const welcomeMessage: Message = {
            id: "welcome",
            role: "assistant",
            content: `Hello! I'm ${coachData.name}'s AI coaching assistant. I'm here to help you. What can I assist you with today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          setMessages([welcomeMessage]);
          localStorage.setItem(getCurrentSessionKey(resolvedCoachId), newSessionId);
        }
      } catch (error) {
        console.error("Error fetching coach:", error);
      } finally {
        setIsCoachLoading(false);
      }
    };

    fetchCoach();
  }, [coachSlug]);

  const loadSession = useCallback((session: ChatSession) => {
    setSessionId(session.sessionId);
    setMessages(session.messages);
    if (coachId) {
      localStorage.setItem(getCurrentSessionKey(coachId), session.sessionId);
    }
  }, [coachId]);

  const deleteSession = useCallback((sessionIdToDelete: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!coachId) return;

    const allSessions = getSessions(coachId);
    const filtered = allSessions.filter(s => s.sessionId !== sessionIdToDelete);
    saveSessions(coachId, filtered);
    setSessions(filtered);

    // If deleting current session, create a new one
    if (sessionIdToDelete === sessionId) {
      createNewSession();
    }

    toast({
      title: "Chat deleted",
      description: "The chat session has been removed.",
    });
  }, [coachId, sessionId, createNewSession, toast]);

  const sendMessage = useCallback(async (messageText?: string) => {
    const textToSend = messageText || message;
    if (!textToSend.trim() || isLoading || !coach?.webhookUrl) return;

    // Check guest message limit before sending
    if (guestLimit.isGuest && !guestLimit.canSendMessage()) {
      setShowGuestLimitModal(true);
      return;
    }

    // Check subscription limits for logged-in users
    if (!guestLimit.isGuest && coachId) {
      const { canSend, remaining } = await checkDailyMessageLimit(coachId);
      if (!canSend) {
        setShowSubscriptionLimitModal(true);
        toast({
          title: "Daily message limit reached",
          description: "Upgrade your plan for more messages.",
          variant: "destructive",
        });
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    // Increment guest message count after sending
    if (guestLimit.isGuest) {
      guestLimit.incrementGuestMessage();
    } else if (coachId) {
      // Increment subscription message count for logged-in users
      await incrementMessageCount(coachId);
    }

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
  }, [message, isLoading, coach?.webhookUrl, coachId, sessionId, toast, guestLimit, checkDailyMessageLimit, incrementMessageCount]);

  return {
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
    // Guest limit state
    guestLimit,
    showGuestLimitModal,
    setShowGuestLimitModal,
    // Subscription limit state
    showSubscriptionLimitModal,
    setShowSubscriptionLimitModal,
    subscriptionStatus,
  };
};

export type { Message, ChatSession, CoachData };
