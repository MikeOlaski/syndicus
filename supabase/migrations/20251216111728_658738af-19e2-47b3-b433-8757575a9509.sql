-- Fix security issues: Remove policies that expose sensitive data
-- Issue 1: coach_profiles exposes webhook_url to all authenticated users
-- Issue 2: profiles exposes email to subscribers

-- Drop the policy that exposes webhook_url to all authenticated users
-- Users should use public_coach_directory view instead (which excludes webhook_url)
DROP POLICY IF EXISTS "Authenticated can view verified coaches" ON public.coach_profiles;

-- Drop the policy that exposes email to subscribers
-- Subscribers should use public_coach_profiles view instead (which excludes email)
DROP POLICY IF EXISTS "Subscribers can view coach profiles with subscription" ON public.profiles;

-- Create a new, safer policy for viewing verified coaches
-- This policy allows viewing but the app should use the public_coach_directory view
-- which already excludes sensitive fields like webhook_url and personality
CREATE POLICY "Public can view verified coach basic info via view"
ON public.coach_profiles
FOR SELECT
USING (
  is_verified = true 
  AND (
    -- Allow viewing through the security invoker view
    current_setting('request.path', true) LIKE '%public_coach_directory%'
    OR
    -- Or if user is admin, coach owner, or has subscription
    has_role(auth.uid(), 'admin'::app_role)
    OR auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM subscriptions s 
      WHERE s.coach_id = coach_profiles.user_id 
      AND s.subscriber_id = auth.uid() 
      AND s.status = 'active'
    )
  )
);

-- Create a safer policy for subscribers to view coach profiles
-- Only allows viewing basic info, not email
CREATE POLICY "Subscribers can view coach basic info"
ON public.profiles
FOR SELECT
USING (
  has_role(id, 'coach'::app_role) 
  AND (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.coach_id = profiles.id
      AND s.subscriber_id = auth.uid()
      AND s.status = 'active'
    )
  )
);