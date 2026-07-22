-- Remove the policy that exposes all profile data (including emails) publicly
-- The app already uses the secure public_coach_profiles view instead
DROP POLICY IF EXISTS "Public can view verified coach basic info" ON public.profiles;