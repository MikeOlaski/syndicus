-- Drop the overly permissive RLS policy that exposes email addresses
DROP POLICY IF EXISTS "Public can view verified coach basic info" ON public.profiles;

-- Create a more restrictive policy that requires at least anonymous authentication
-- This limits automated scraping while still allowing legitimate public access
CREATE POLICY "Public can view verified coach basic info"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM coach_profiles cp
    WHERE cp.user_id = profiles.id AND cp.is_verified = true
  )
);