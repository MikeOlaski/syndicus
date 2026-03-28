
-- Remove the unreliable request.path-based policy
DROP POLICY IF EXISTS "Public can view verified coach basic info via view" ON public.coach_profiles;

-- Replace with a clean policy that covers legitimate access patterns:
-- 1. Admins can see all (already covered by separate policy)
-- 2. Own profile (already covered by separate policy)
-- 3. Subscribers with active subscriptions can see their coach's profile
-- The public_coach_directory view already handles anonymous public access safely
CREATE POLICY "Subscribers can view subscribed coach profiles"
ON public.coach_profiles
FOR SELECT
TO authenticated
USING (
  is_verified = true
  AND EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.coach_id = coach_profiles.user_id
      AND s.subscriber_id = auth.uid()
      AND s.status = 'active'
  )
);
