import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { 
  CouncilMessage, 
  CouncilMember, 
  GroupSettings,
  CouncilTemplate 
} from "@/hooks/useSyndic8Chat";

interface PublicSyndic8Group {
  id: string;
  name: string;
  description: string | null;
  publicDescription: string | null;
}

const SYNDIC8_COUNCIL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/syndic8-council`;

export const usePublicSyndic8Chat = (groupId: string | undefined) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<CouncilMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [group, setGroup] = useState<PublicSyndic8Group | null>(null);
  const [members, setMembers] = useState<CouncilMember[]>([]);
  const [settings, setSettings] = useState<GroupSettings | null>(null);
  const [isGroupLoading, setIsGroupLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Fetch public group data
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) return;

      try {
        // Fetch from public view (no auth required for viewing)
        const { data: groupData, error: groupError } = await supabase
          .from("public_syndic8_groups")
          .select("*")
          .eq("id", groupId)
          .single();

        if (groupError || !groupData) {
          console.error("Group not found or not public:", groupError);
          setIsGroupLoading(false);
          return;
        }

        setGroup({
          id: groupData.id!,
          name: groupData.name!,
          description: groupData.description,
          publicDescription: groupData.public_description,
        });

        // Fetch members via public_syndic8_groups specializations or directly
        const { data: membersData } = await supabase
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

        if (membersData && membersData.length > 0) {
          // Get profile info via RPC function (works for verified coaches)
          const userIds = membersData.map((m: any) => m.coach_profiles.user_id);
          const { data: profiles } = await supabase.rpc("get_public_coach_profiles", {
            coach_ids: userIds,
          });

          const profileMap = new Map(
            profiles?.map((p: any) => [p.id, { name: p.full_name, avatar: p.avatar_url }]) || []
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

        // Fetch settings
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

        // Add welcome message
        const welcomeMessage: CouncilMessage = {
          id: "welcome",
          role: "system",
          content: `Welcome to **${groupData.name}**! This council of ${membersData?.length || 0} experts is ready to help. ${groupData.public_description || "Ask a question to see them collaborate."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages([welcomeMessage]);

      } catch (error: any) {
        console.error("Error fetching public group data:", error);
      } finally {
        setIsGroupLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

  // Create/resume session when authenticated
  useEffect(() => {
    const initSession = async () => {
      if (!isAuthenticated || !groupId || !group) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check for existing session
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
            
            // Prepend welcome, then loaded messages
            setMessages((prev) => {
              const welcome = prev.find((m) => m.id === "welcome");
              return welcome ? [welcome, ...loadedMessages] : loadedMessages;
            });
          }
        } else {
          // Create new session
          const { data: newSession, error: sessionError } = await supabase
            .from("syndic8_sessions")
            .insert({
              group_id: groupId,
              user_id: user.id,
              council_template: settings?.councilTemplate || "balanced",
            })
            .select("id")
            .single();

          if (sessionError) {
            console.error("Error creating session:", sessionError);
            return;
          }
          setSessionId(newSession.id);
        }
      } catch (error) {
        console.error("Error initializing session:", error);
      }
    };

    initSession();
  }, [isAuthenticated, groupId, group, settings?.councilTemplate]);

  const sendMessage = useCallback(async (messageText?: string) => {
    const textToSend = messageText || message;
    if (!textToSend.trim() || isLoading || !groupId || members.length === 0 || !isAuthenticated) return;

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      // Build conversation history
      const conversationHistory = messages
        .filter((m) => m.role === "user" || m.role === "synthesis")
        .slice(-10)
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.role === "synthesis" && m.synthesis 
            ? m.synthesis.finalAnswer 
            : m.content,
        }));

      // Save user message
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
          template: settings?.councilTemplate || "balanced",
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

      // Save synthesis
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
  }, [message, isLoading, groupId, sessionId, members, settings?.councilTemplate, messages, toast, isAuthenticated]);

  return {
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
  };
};
