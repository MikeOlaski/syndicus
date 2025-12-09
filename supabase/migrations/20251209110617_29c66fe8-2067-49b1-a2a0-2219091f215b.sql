-- Drop and recreate the view with SECURITY INVOKER to avoid security definer issues
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
WHERE public.has_role(p.id, 'coach'::app_role);

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.public_coach_profiles TO anon, authenticated;