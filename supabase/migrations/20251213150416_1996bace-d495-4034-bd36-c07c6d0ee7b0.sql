-- Create subscriber tier enum
CREATE TYPE public.subscriber_tier AS ENUM ('free', 'plus', 'prime');

-- Add tier to profiles table for subscribers
ALTER TABLE public.profiles 
ADD COLUMN subscriber_tier subscriber_tier DEFAULT 'free';

-- Create daily message usage tracking table
CREATE TABLE public.daily_message_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  coach_id UUID NOT NULL,
  message_date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, coach_id, message_date)
);

-- Enable RLS on daily_message_usage
ALTER TABLE public.daily_message_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_message_usage
CREATE POLICY "Users can view own message usage"
ON public.daily_message_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own message usage"
ON public.daily_message_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own message usage"
ON public.daily_message_usage FOR UPDATE
USING (auth.uid() = user_id);

-- Create Syndic8 groups table (cohorts of coaches)
CREATE TABLE public.syndic8_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on syndic8_groups
ALTER TABLE public.syndic8_groups ENABLE ROW LEVEL SECURITY;

-- RLS policies for syndic8_groups
CREATE POLICY "Users can view own groups"
ON public.syndic8_groups FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own groups"
ON public.syndic8_groups FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own groups"
ON public.syndic8_groups FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own groups"
ON public.syndic8_groups FOR DELETE
USING (auth.uid() = owner_id);

-- Create Syndic8 group members table
CREATE TABLE public.syndic8_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.syndic8_groups(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, coach_id)
);

-- Enable RLS on syndic8_group_members
ALTER TABLE public.syndic8_group_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for syndic8_group_members
CREATE POLICY "Users can view members of own groups"
ON public.syndic8_group_members FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.syndic8_groups 
  WHERE id = syndic8_group_members.group_id 
  AND owner_id = auth.uid()
));

CREATE POLICY "Users can add members to own groups"
ON public.syndic8_group_members FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.syndic8_groups 
  WHERE id = syndic8_group_members.group_id 
  AND owner_id = auth.uid()
));

CREATE POLICY "Users can remove members from own groups"
ON public.syndic8_group_members FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.syndic8_groups 
  WHERE id = syndic8_group_members.group_id 
  AND owner_id = auth.uid()
));

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION public.get_subscription_limits(user_tier subscriber_tier)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT CASE user_tier
    WHEN 'free' THEN jsonb_build_object(
      'max_coaches', 3,
      'max_syndic8_groups', 1,
      'max_coaches_per_group', 2,
      'daily_messages', 5,
      'modality', 'text'
    )
    WHEN 'plus' THEN jsonb_build_object(
      'max_coaches', 10,
      'max_syndic8_groups', 3,
      'max_coaches_per_group', 8,
      'daily_messages', 50,
      'modality', 'text'
    )
    WHEN 'prime' THEN jsonb_build_object(
      'max_coaches', 999,
      'max_syndic8_groups', 10,
      'max_coaches_per_group', 8,
      'daily_messages', 999,
      'modality', 'all'
    )
    ELSE jsonb_build_object(
      'max_coaches', 3,
      'max_syndic8_groups', 1,
      'max_coaches_per_group', 2,
      'daily_messages', 5,
      'modality', 'text'
    )
  END;
$$;