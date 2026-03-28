
-- Fix 1: Replace overly permissive coach_sessions INSERT policy
DROP POLICY IF EXISTS "Anyone can insert sessions" ON public.coach_sessions;

CREATE POLICY "Authenticated users can insert own sessions"
ON public.coach_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  (subscriber_id IS NOT NULL AND auth.uid() = subscriber_id AND guest_session_id IS NULL)
);

CREATE POLICY "Guest users can insert guest sessions"
ON public.coach_sessions
FOR INSERT
TO anon
WITH CHECK (
  subscriber_id IS NULL AND guest_session_id IS NOT NULL
);

-- Also allow authenticated users to create guest-style sessions (when not logged in context)
CREATE POLICY "Authenticated users can insert guest sessions"
ON public.coach_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  subscriber_id IS NULL AND guest_session_id IS NOT NULL
);

-- Fix 2: Create server-side function for incrementing message usage
CREATE OR REPLACE FUNCTION public.increment_daily_message_usage(p_coach_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_today date;
  v_current_count integer;
  v_tier subscriber_tier;
  v_daily_limit integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'not_authenticated');
  END IF;

  v_today := CURRENT_DATE;

  -- Get user tier
  SELECT subscriber_tier INTO v_tier FROM profiles WHERE id = v_user_id;
  v_tier := COALESCE(v_tier, 'free');

  -- Get daily limit
  v_daily_limit := CASE v_tier
    WHEN 'prime' THEN 999
    WHEN 'plus' THEN 50
    ELSE 5
  END;

  -- Upsert and increment atomically
  INSERT INTO daily_message_usage (user_id, coach_id, message_date, message_count)
  VALUES (v_user_id, p_coach_id, v_today, 1)
  ON CONFLICT (user_id, coach_id, message_date)
  DO UPDATE SET message_count = daily_message_usage.message_count + 1, updated_at = now()
  RETURNING message_count INTO v_current_count;

  RETURN jsonb_build_object(
    'can_send', v_current_count <= v_daily_limit,
    'current_count', v_current_count,
    'daily_limit', v_daily_limit,
    'remaining', GREATEST(0, v_daily_limit - v_current_count)
  );
END;
$$;

-- Add unique constraint for upsert if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_message_usage_user_coach_date_unique'
  ) THEN
    ALTER TABLE public.daily_message_usage
    ADD CONSTRAINT daily_message_usage_user_coach_date_unique
    UNIQUE (user_id, coach_id, message_date);
  END IF;
END $$;

-- Fix 3: Remove direct UPDATE access on daily_message_usage
DROP POLICY IF EXISTS "Users can update own message usage" ON public.daily_message_usage;
DROP POLICY IF EXISTS "Users can insert own message usage" ON public.daily_message_usage;

-- Only allow SELECT for users to check their own usage (the increment is done via RPC)
-- Keep the existing SELECT policy
