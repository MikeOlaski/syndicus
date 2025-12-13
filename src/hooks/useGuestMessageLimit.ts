import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const GUEST_MESSAGE_LIMIT = 5;
const GUEST_MESSAGES_KEY = (coachId: string) => `guest_messages_${coachId}`;

interface GuestLimitState {
  isGuest: boolean;
  messagesUsed: number;
  messagesRemaining: number;
  isLimitReached: boolean;
  isLoading: boolean;
}

export const useGuestMessageLimit = (coachId: string | undefined) => {
  const [state, setState] = useState<GuestLimitState>({
    isGuest: true,
    messagesUsed: 0,
    messagesRemaining: GUEST_MESSAGE_LIMIT,
    isLimitReached: false,
    isLoading: true,
  });

  // Check authentication status and guest message count
  useEffect(() => {
    const checkStatus = async () => {
      if (!coachId) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // User is logged in - not a guest
        setState({
          isGuest: false,
          messagesUsed: 0,
          messagesRemaining: GUEST_MESSAGE_LIMIT,
          isLimitReached: false,
          isLoading: false,
        });
      } else {
        // Guest user - check localStorage for message count
        const storedCount = localStorage.getItem(GUEST_MESSAGES_KEY(coachId));
        const messagesUsed = storedCount ? parseInt(storedCount, 10) : 0;
        
        setState({
          isGuest: true,
          messagesUsed,
          messagesRemaining: Math.max(0, GUEST_MESSAGE_LIMIT - messagesUsed),
          isLimitReached: messagesUsed >= GUEST_MESSAGE_LIMIT,
          isLoading: false,
        });
      }
    };

    checkStatus();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setState(prev => ({
          ...prev,
          isGuest: false,
          isLimitReached: false,
        }));
      } else {
        // User logged out - recheck guest status
        if (coachId) {
          const storedCount = localStorage.getItem(GUEST_MESSAGES_KEY(coachId));
          const messagesUsed = storedCount ? parseInt(storedCount, 10) : 0;
          setState({
            isGuest: true,
            messagesUsed,
            messagesRemaining: Math.max(0, GUEST_MESSAGE_LIMIT - messagesUsed),
            isLimitReached: messagesUsed >= GUEST_MESSAGE_LIMIT,
            isLoading: false,
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [coachId]);

  const incrementGuestMessage = useCallback(() => {
    if (!coachId || !state.isGuest) return;

    const newCount = state.messagesUsed + 1;
    localStorage.setItem(GUEST_MESSAGES_KEY(coachId), newCount.toString());
    
    setState(prev => ({
      ...prev,
      messagesUsed: newCount,
      messagesRemaining: Math.max(0, GUEST_MESSAGE_LIMIT - newCount),
      isLimitReached: newCount >= GUEST_MESSAGE_LIMIT,
    }));
  }, [coachId, state.isGuest, state.messagesUsed]);

  const canSendMessage = useCallback(() => {
    if (!state.isGuest) return true;
    return !state.isLimitReached;
  }, [state.isGuest, state.isLimitReached]);

  return {
    ...state,
    incrementGuestMessage,
    canSendMessage,
    limit: GUEST_MESSAGE_LIMIT,
  };
};
