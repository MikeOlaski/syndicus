-- Enable RLS on public_coach_profiles view
ALTER VIEW public.public_coach_profiles SET (security_invoker = on);

-- Create policy for public read access (or if view doesn't support RLS, drop and recreate)
DROP VIEW IF EXISTS public.public_coach_profiles;

CREATE VIEW public.public_coach_profiles AS
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