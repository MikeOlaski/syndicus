import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ExpertDraft {
  expertId: string;
  expertName: string;
  answer: string;
  confidence: number;
  assumptions: string[];
  uncertainties: string[];
}

export interface ExpertCritique {
  reviewerName: string;
  targetExpertId: string;
  scores: {
    correctness: number;
    completeness: number;
    actionability: number;
  };
  strengths: string[];
  improvements: string[];
}

export interface CouncilSynthesis {
  finalAnswer: string;
  confidence: number;
  consensusPoints: string[];
  dissentSummary: string | null;
  nextSteps: string[];
  primaryContributors: string[];
}

export interface CouncilMessage {
  id: string;
  role: "user" | "synthesis" | "system";
  content: string;
  timestamp: string;
  expertDrafts?: ExpertDraft[];
  critiques?: ExpertCritique[];
  synthesis?: CouncilSynthesis;
  metadata?: {
    councilSize?: number;
    avgConfidence?: number;
    hasSignificantDissent?: boolean;
  };
}

export interface CouncilMember {
  id: string;
  coachId: string;
  name: string;
  specialization: string;
  avatarUrl: string;
}

export interface Syndic8Group {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
}

export interface GroupSettings {
  councilTemplate: "balanced" | "complimentary" | "adversarial";
  showExpertReasoning: boolean;
  requireDissent: boolean;
  synthesisStyle: "consensus" | "options" | "debate";
}

export type CouncilTemplate = "balanced" | "complimentary" | "adversarial";

const SYNDIC8_COUNCIL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/syndic8-council`;

export const useSyndic8Chat = (groupId: string | undefined) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<CouncilMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [group, setGroup] = useState<Syndic8Group | null>(null);
  const [members, setMembers] = useState<CouncilMember[]>([]);
  const [settings, setSettings] = useState<GroupSettings>({
    councilTemplate: "balanced",
    showExpertReasoning: false,
    requireDissent: false,
    synthesisStyle: "consensus",
  });
  const [isGroupLoading, setIsGroupLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Fetch group, members, and settings
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch group
        const { data: groupData, error: groupError } = await supabase
          .from("syndic8_groups")
          .select("*")
          .eq("id", groupId)
          .eq("owner_id", user.id)
          .single();

        if (groupError) throw groupError;

        setGroup({
          id: groupData.id,
          name: groupData.name,
          description: groupData.description,
          ownerId: groupData.owner_id,
        });

        // Fetch members with coach profiles
        const { data: membersData, error: membersError } = await supabase
          .from("syndic8_group_members")
          .select(`
            id,
            coach_id,
            coach_profiles!inner (
              id,
              user_id,
              specialization
            )
          `)
          .eq("group_id", groupId);

        if (membersError) throw membersError;

        // Get profile names for each coach
        if (membersData && membersData.length > 0) {
          const userIds = membersData.map((m: any) => m.coach_profiles.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", userIds);

          const profileMap = new Map(
            profiles?.map((p) => [p.id, { name: p.full_name, avatar: p.avatar_url }]) || []
          );

          const formattedMembers: CouncilMember[] = membersData.map((m: any) => {
            const profile = profileMap.get(m.coach_profiles.user_id);
            return {
              id: m.id,
              coachId: m.coach_id,
              name: profile?.name || "Expert",
              specialization: m.coach_profiles.specialization || "General",
              avatarUrl: profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || 'E'}`,
            };
          });

          setMembers(formattedMembers);
        }

        // Fetch or create settings
        const { data: settingsData } = await supabase
          .from("syndic8_group_settings")
          .select("*")
          .eq("group_id", groupId)
          .single();

        if (settingsData) {
          setSettings({
            councilTemplate: settingsData.council_template as CouncilTemplate,
            showExpertReasoning: settingsData.show_expert_reasoning,
            requireDissent: settingsData.require_dissent,
            synthesisStyle: settingsData.synthesis_style as "consensus" | "options" | "debate",
          });
        }

        // Create or resume session
        const { data: existingSession } = await supabase
          .from("syndic8_sessions")
          .select("id")
          .eq("group_id", groupId)
          .eq("user_id", user.id)
          .is("ended_at", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (existingSession) {
          setSessionId(existingSession.id);
          
          // Load existing messages
          const { data: existingMessages } = await supabase
            .from("syndic8_messages")
            .select("*")
            .eq("session_id", existingSession.id)
            .order("created_at", { ascending: true });

          if (existingMessages && existingMessages.length > 0) {
            const loadedMessages: CouncilMessage[] = existingMessages
              .filter((m) => m.role === "user" || m.role === "synthesis")
              .map((m) => ({
                id: m.id,
                role: m.role as "user" | "synthesis",
                content: m.content,
                timestamp: new Date(m.created_at).toLocaleTimeString([], { 
                  hour: "2-digit", 
                  minute: "2-digit" 
                }),
                metadata: m.metadata as any,
              }));
            setMessages(loadedMessages);
          }
        } else {
          // Create new session
          const { data: newSession, error: sessionError } = await supabase
            .from("syndic8_sessions")
            .insert({
              group_id: groupId,
              user_id: user.id,
              council_template: settings.councilTemplate,
            })
            .select("id")
            .single();

          if (sessionError) throw sessionError;
          setSessionId(newSession.id);
        }

        // Add welcome message if no messages
        if (messages.length === 0) {
          const welcomeMessage: CouncilMessage = {
            id: "welcome",
            role: "system",
            content: `Welcome to **${groupData.name}**! Your council of ${membersData?.length || 0} experts is ready to collaborate on any challenge. Ask a question and watch them deliberate together.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages([welcomeMessage]);
        }
      } catch (error: any) {
        console.error("Error fetching group data:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load council",
          variant: "destructive",
        });
      } finally {
        setIsGroupLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId, toast]);

  const updateSettings = async (newSettings: Partial<GroupSettings>) => {
    if (!groupId) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      await supabase
        .from("syndic8_group_settings")
        .upsert({
          group_id: groupId,
          council_template: updatedSettings.councilTemplate,
          show_expert_reasoning: updatedSettings.showExpertReasoning,
          require_dissent: updatedSettings.requireDissent,
          synthesis_style: updatedSettings.synthesisStyle,
        });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const sendMessage = useCallback(async (messageText?: string) => {
    const textToSend = messageText || message;
    if (!textToSend.trim() || isLoading || !groupId || members.length === 0) return;

    const userMessage: CouncilMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setCurrentStage("Gathering expert perspectives...");

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      // Build conversation history (last 10 messages)
      const conversationHistory = messages
        .filter((m) => m.role === "user" || m.role === "synthesis")
        .slice(-10)
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.role === "synthesis" && m.synthesis 
            ? m.synthesis.finalAnswer 
            : m.content,
        }));

      // Save user message to database
      if (sessionId) {
        await supabase.from("syndic8_messages").insert({
          session_id: sessionId,
          role: "user",
          content: textToSend.trim(),
          stage: null,
        });
      }

      setCurrentStage("Experts drafting responses...");

      // Call council runtime
      const response = await fetch(SYNDIC8_COUNCIL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          groupId,
          sessionId,
          message: textToSend.trim(),
          template: settings.councilTemplate,
          skipCritique: members.length <= 2,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Council request failed");
      }

      setCurrentStage("Synthesizing council response...");

      const councilResponse = await response.json();

      // Create council message with full response data
      const councilMessage: CouncilMessage = {
        id: (Date.now() + 1).toString(),
        role: "synthesis",
        content: councilResponse.synthesis?.finalAnswer || "The council was unable to reach a conclusion.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        expertDrafts: councilResponse.expertDrafts,
        critiques: councilResponse.critiques,
        synthesis: councilResponse.synthesis,
        metadata: councilResponse.metadata,
      };

      setMessages((prev) => [...prev, councilMessage]);

      // Save synthesis to database
      if (sessionId) {
        await supabase.from("syndic8_messages").insert({
          session_id: sessionId,
          role: "synthesis",
          content: councilResponse.synthesis?.finalAnswer || "",
          stage: "synthesis",
          metadata: {
            expertDrafts: councilResponse.expertDrafts,
            critiques: councilResponse.critiques,
            synthesis: councilResponse.synthesis,
            ...councilResponse.metadata,
          },
        });

        // Update session message count
        await supabase
          .from("syndic8_sessions")
          .update({ message_count: messages.length + 2 })
          .eq("id", sessionId);
      }
    } catch (error: any) {
      console.error("Council chat error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get council response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentStage(null);
    }
  }, [message, isLoading, groupId, sessionId, members, settings.councilTemplate, messages, toast]);

  const startNewSession = useCallback(async () => {
    if (!groupId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // End current session
      if (sessionId) {
        await supabase
          .from("syndic8_sessions")
          .update({ ended_at: new Date().toISOString() })
          .eq("id", sessionId);
      }

      // Create new session
      const { data: newSession, error } = await supabase
        .from("syndic8_sessions")
        .insert({
          group_id: groupId,
          user_id: user.id,
          council_template: settings.councilTemplate,
        })
        .select("id")
        .single();

      if (error) throw error;
      setSessionId(newSession.id);

      // Reset messages with welcome
      const welcomeMessage: CouncilMessage = {
        id: "welcome",
        role: "system",
        content: `New session started! Your council of ${members.length} experts is ready.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([welcomeMessage]);

      toast({
        title: "New Session",
        description: "Started a fresh council session.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start new session",
        variant: "destructive",
      });
    }
  }, [groupId, sessionId, settings.councilTemplate, members.length, toast]);

  return {
    // State
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
    // Actions
    sendMessage,
    updateSettings,
    startNewSession,
  };
};
