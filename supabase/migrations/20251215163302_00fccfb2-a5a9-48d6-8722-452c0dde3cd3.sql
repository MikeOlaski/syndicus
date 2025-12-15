-- Drop the existing insert policy
DROP POLICY IF EXISTS "System can insert sessions" ON coach_sessions;

-- Create new policy that allows anyone (including anonymous) to insert sessions
CREATE POLICY "Anyone can insert sessions" 
ON coach_sessions 
FOR INSERT 
WITH CHECK (true);

-- Also ensure the update policy works for session tracking
DROP POLICY IF EXISTS "System can update sessions" ON coach_sessions;

CREATE POLICY "Anyone can update own sessions" 
ON coach_sessions 
FOR UPDATE 
USING (
  (subscriber_id IS NOT NULL AND subscriber_id = auth.uid()) OR
  (guest_session_id IS NOT NULL) OR
  (auth.uid() IS NULL AND guest_session_id IS NOT NULL)
);

-- Create a public read policy for Stats to count all sessions
CREATE POLICY "Public can count sessions" 
ON coach_sessions 
FOR SELECT 
USING (true);