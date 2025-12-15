-- Create coach_sessions table for historical session tracking
CREATE TABLE public.coach_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_session_id TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  message_count INTEGER NOT NULL DEFAULT 0,
  session_type TEXT NOT NULL DEFAULT 'chat',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Coaches can view own sessions"
ON public.coach_sessions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM coach_profiles cp 
  WHERE cp.id = coach_sessions.coach_id AND cp.user_id = auth.uid()
) AND has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Subscribers can view own sessions"
ON public.coach_sessions FOR SELECT
USING (auth.uid() = subscriber_id);

CREATE POLICY "Admins can view all sessions"
ON public.coach_sessions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert sessions"
ON public.coach_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update sessions"
ON public.coach_sessions FOR UPDATE
USING (true);

-- Trigger to update updated_at
CREATE TRIGGER update_coach_sessions_updated_at
BEFORE UPDATE ON public.coach_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment total_sessions when session ends
CREATE OR REPLACE FUNCTION public.increment_coach_total_sessions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.ended_at IS NULL AND NEW.ended_at IS NOT NULL THEN
    UPDATE coach_profiles
    SET total_sessions = COALESCE(total_sessions, 0) + 1
    WHERE id = NEW.coach_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for incrementing total_sessions
CREATE TRIGGER on_session_end
AFTER UPDATE ON public.coach_sessions
FOR EACH ROW
EXECUTE FUNCTION public.increment_coach_total_sessions();

-- Enable realtime for coach_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_sessions;