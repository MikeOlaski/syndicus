-- Allow anonymous users to count coach_sessions for homepage stats
CREATE POLICY "Anonymous can count coach_sessions"
ON public.coach_sessions
FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to count syndic8_groups for homepage stats
CREATE POLICY "Anonymous can count syndic8_groups"
ON public.syndic8_groups
FOR SELECT
TO anon
USING (true);