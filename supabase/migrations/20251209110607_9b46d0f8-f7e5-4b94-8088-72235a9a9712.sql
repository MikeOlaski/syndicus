-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public can view coach profiles" ON public.profiles;

-- Create a more restrictive policy that only exposes non-sensitive columns
-- For public coach profiles, we'll use a view instead
CREATE OR REPLACE VIEW public.public_coach_profiles AS
SELECT 
  p.id,
  p.full_name,
  p.avatar_url,
  p.created_at
FROM public.profiles p
WHERE public.has_role(p.id, 'coach'::app_role);

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.public_coach_profiles TO anon, authenticated;

-- Create a new RLS policy that only allows coaches to be viewed by:
-- 1. The coach themselves
-- 2. Subscribers who have an active subscription to that coach
-- 3. Admins (already covered by separate policy)
CREATE POLICY "Subscribers can view coach profiles with subscription" ON public.profiles
  FOR SELECT
  USING (
    has_role(id, 'coach'::app_role) AND (
      -- Coach viewing their own profile
      auth.uid() = id OR
      -- Subscriber with active subscription to this coach
      EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.coach_id = profiles.id
          AND s.subscriber_id = auth.uid()
          AND s.status = 'active'
      )
    )
  );