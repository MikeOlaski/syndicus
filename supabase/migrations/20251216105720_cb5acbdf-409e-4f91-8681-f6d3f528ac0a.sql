-- Fix: coach_sessions public exposure
-- Remove the overly permissive "Public can count sessions" policy
DROP POLICY IF EXISTS "Public can count sessions" ON public.coach_sessions;