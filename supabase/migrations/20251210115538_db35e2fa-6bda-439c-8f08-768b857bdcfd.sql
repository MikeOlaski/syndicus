-- Fix security definer view by setting security_invoker = true
DROP VIEW IF EXISTS public.public_coach_profiles;

CREATE VIEW public.public_coach_profiles 
WITH (security_invoker = true)
AS
SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.created_at
FROM public.profiles p
INNER JOIN public.coach_profiles cp ON cp.user_id = p.id
WHERE cp.is_verified = true;

-- Grant select to anon and authenticated roles
GRANT SELECT ON public.public_coach_profiles TO anon, authenticated;

-- Add RLS policy on profiles table for public access to coach profiles
CREATE POLICY "Public can view verified coach basic info"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.coach_profiles cp 
    WHERE cp.user_id = profiles.id AND cp.is_verified = true
  )
);