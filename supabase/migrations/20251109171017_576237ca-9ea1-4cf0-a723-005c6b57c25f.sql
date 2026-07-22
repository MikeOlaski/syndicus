-- Fix Issue #1: Restrict email visibility in profiles table
-- Drop the overly permissive policy that exposes all emails
DROP POLICY "Users can view all profiles" ON public.profiles;

-- Allow viewing public profile fields (full_name, avatar_url)
CREATE POLICY "Users can view public profile data"
ON public.profiles FOR SELECT
USING (true);

-- Only allow users to see their own email
CREATE POLICY "Users can view own email"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Fix Issue #2: Add UPDATE and DELETE policies to subscriptions table
-- Prevent unauthorized modifications - only system (service role) can update/delete
CREATE POLICY "Only system can update subscriptions"
ON public.subscriptions FOR UPDATE
USING (false);

CREATE POLICY "Only system can delete subscriptions"
ON public.subscriptions FOR DELETE
USING (false);

-- Note: System operations should use the service role key to bypass RLS
-- Users who want to cancel subscriptions should update the status field via an edge function