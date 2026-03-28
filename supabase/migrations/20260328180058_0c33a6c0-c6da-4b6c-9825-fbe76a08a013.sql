
-- Fix 1: Revoke column-level SELECT on webhook_url from anon and authenticated
-- This prevents webhook_url from being returned in ANY query by non-superuser roles
REVOKE SELECT (webhook_url) ON public.coach_profiles FROM anon;
REVOKE SELECT (webhook_url) ON public.coach_profiles FROM authenticated;

-- Grant webhook_url SELECT back only via the existing SECURITY DEFINER functions
-- Coaches and admins who need webhook_url will access it through edge functions
-- that use the service_role key (which bypasses RLS and column grants)

-- Also revoke personality column from anon (not needed publicly)
REVOKE SELECT (personality) ON public.coach_profiles FROM anon;

-- Fix 2: Replace the overly permissive guest session UPDATE policy
-- The current policy allows ANYONE to update ANY guest session
DROP POLICY IF EXISTS "Anyone can update own sessions" ON public.coach_sessions;

-- Create scoped policies: authenticated users can only update their own sessions
CREATE POLICY "Authenticated users can update own sessions"
ON public.coach_sessions
FOR UPDATE
TO authenticated
USING (subscriber_id IS NOT NULL AND subscriber_id = auth.uid());

-- For guest session updates, create a SECURITY DEFINER function
-- that validates the guest_session_id matches what the client provides
CREATE OR REPLACE FUNCTION public.update_guest_session(
  p_session_id uuid,
  p_guest_session_id text,
  p_ended_at timestamptz DEFAULT NULL,
  p_duration_seconds integer DEFAULT NULL,
  p_message_count integer DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated boolean;
BEGIN
  -- Only update if guest_session_id matches exactly
  UPDATE coach_sessions
  SET
    ended_at = COALESCE(p_ended_at, ended_at),
    duration_seconds = COALESCE(p_duration_seconds, duration_seconds),
    message_count = COALESCE(p_message_count, message_count),
    updated_at = now()
  WHERE id = p_session_id
    AND guest_session_id = p_guest_session_id
    AND subscriber_id IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;
