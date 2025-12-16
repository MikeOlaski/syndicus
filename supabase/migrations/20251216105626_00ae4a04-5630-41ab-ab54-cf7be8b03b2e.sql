-- Fix the SECURITY DEFINER view issue by recreating with explicit security settings
DROP VIEW IF EXISTS public.public_coach_directory;

-- Recreate the view - views in Postgres are SECURITY INVOKER by default
-- This explicitly ensures the view runs with the permissions of the querying user
CREATE VIEW public.public_coach_directory 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  slug,
  specialization,
  bio,
  expertise,
  is_verified,
  is_claimed,
  total_sessions,
  rating,
  show_on_homepage,
  website_url,
  twitter_url,
  linkedin_url,
  instagram_url,
  created_at,
  updated_at,
  status
FROM public.coach_profiles
WHERE is_verified = true;

-- Grant access to the view
GRANT SELECT ON public.public_coach_directory TO anon, authenticated;