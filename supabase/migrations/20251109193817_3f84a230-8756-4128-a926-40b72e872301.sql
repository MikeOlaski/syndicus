-- Create conversations table
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  last_message_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Coaches can view own conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = coach_id AND has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Coaches can insert own conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = coach_id AND has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Coaches can update own conversations"
ON public.conversations
FOR UPDATE
USING (auth.uid() = coach_id AND has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Coaches can delete own conversations"
ON public.conversations
FOR DELETE
USING (auth.uid() = coach_id AND has_role(auth.uid(), 'coach'::app_role));

-- Chat messages policies
CREATE POLICY "Coaches can view messages from own conversations"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = chat_messages.conversation_id
    AND conversations.coach_id = auth.uid()
  )
  AND has_role(auth.uid(), 'coach'::app_role)
);

CREATE POLICY "Coaches can insert messages to own conversations"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = chat_messages.conversation_id
    AND conversations.coach_id = auth.uid()
  )
  AND has_role(auth.uid(), 'coach'::app_role)
);

-- Admins can view all conversations and messages
CREATE POLICY "Admins can view all conversations"
ON public.conversations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all chat messages"
ON public.chat_messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_conversations_coach_id ON public.conversations(coach_id);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);