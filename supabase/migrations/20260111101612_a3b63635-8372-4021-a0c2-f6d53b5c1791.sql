-- Add RLS policy for anonymous users to count coach_sessions
CREATE POLICY "Allow anonymous to count coach_sessions"
ON public.coach_sessions
FOR SELECT
USING (true);

-- Add RLS policy for anonymous users to count syndic8_groups
CREATE POLICY "Allow anonymous to count syndic8_groups"
ON public.syndic8_groups
FOR SELECT
USING (true);