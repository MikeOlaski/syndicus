-- Fix: PUBLIC_DATA_EXPOSURE - webhook_url_rls_exposure
-- Create a secure public view for coach directory that excludes sensitive fields

-- First, drop the overly permissive policy that exposes webhook_url
DROP POLICY IF EXISTS "Public verified coach profiles" ON public.coach_profiles;

-- Create a public view that only exposes safe fields (excludes webhook_url, personality, hourly_rate)
CREATE OR REPLACE VIEW public.public_coach_directory AS
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
  -- Explicitly excluded: webhook_url, personality, hourly_rate
FROM public.coach_profiles
WHERE is_verified = true;

-- Grant access to the view
GRANT SELECT ON public.public_coach_directory TO anon, authenticated;

-- Create a restricted policy for authenticated users only (they can see full profile if needed)
CREATE POLICY "Authenticated can view verified coaches" 
ON public.coach_profiles 
FOR SELECT 
TO authenticated 
USING (is_verified = true);