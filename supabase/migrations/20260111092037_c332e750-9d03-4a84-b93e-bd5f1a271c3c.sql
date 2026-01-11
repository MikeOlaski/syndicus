-- Phase 1: Syndic8 Council Runtime Database Schema

-- 1. Create syndic8_sessions table to track council chat sessions
CREATE TABLE public.syndic8_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.syndic8_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER NOT NULL DEFAULT 0,
  council_template TEXT NOT NULL DEFAULT 'balanced' CHECK (council_template IN ('balanced', 'complimentary', 'adversarial')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create syndic8_messages table for council conversation history
CREATE TABLE public.syndic8_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.syndic8_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'synthesis', 'expert_draft', 'critique', 'system')),
  content TEXT NOT NULL,
  expert_coach_id UUID REFERENCES public.coach_profiles(id) ON DELETE SET NULL,
  stage TEXT CHECK (stage IN ('clarify', 'draft', 'critique', 'synthesis', 'verify')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create syndic8_group_settings table for group-level configuration
CREATE TABLE public.syndic8_group_settings (
  group_id UUID NOT NULL PRIMARY KEY REFERENCES public.syndic8_groups(id) ON DELETE CASCADE,
  council_template TEXT NOT NULL DEFAULT 'balanced' CHECK (council_template IN ('balanced', 'complimentary', 'adversarial')),
  show_expert_reasoning BOOLEAN NOT NULL DEFAULT false,
  require_dissent BOOLEAN NOT NULL DEFAULT false,
  synthesis_style TEXT NOT NULL DEFAULT 'consensus' CHECK (synthesis_style IN ('consensus', 'options', 'debate')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.syndic8_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syndic8_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syndic8_group_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for syndic8_sessions
CREATE POLICY "Users can view own sessions"
  ON public.syndic8_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions for own groups"
  ON public.syndic8_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.syndic8_groups
      WHERE id = group_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own sessions"
  ON public.syndic8_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.syndic8_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for syndic8_messages
CREATE POLICY "Users can view messages from own sessions"
  ON public.syndic8_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.syndic8_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own sessions"
  ON public.syndic8_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.syndic8_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for syndic8_group_settings
CREATE POLICY "Users can view settings for own groups"
  ON public.syndic8_group_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.syndic8_groups
      WHERE id = group_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create settings for own groups"
  ON public.syndic8_group_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.syndic8_groups
      WHERE id = group_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update settings for own groups"
  ON public.syndic8_group_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.syndic8_groups
      WHERE id = group_id AND owner_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_syndic8_sessions_updated_at
  BEFORE UPDATE ON public.syndic8_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_syndic8_group_settings_updated_at
  BEFORE UPDATE ON public.syndic8_group_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster session lookups
CREATE INDEX idx_syndic8_sessions_group_id ON public.syndic8_sessions(group_id);
CREATE INDEX idx_syndic8_sessions_user_id ON public.syndic8_sessions(user_id);
CREATE INDEX idx_syndic8_messages_session_id ON public.syndic8_messages(session_id);
CREATE INDEX idx_syndic8_messages_stage ON public.syndic8_messages(stage);