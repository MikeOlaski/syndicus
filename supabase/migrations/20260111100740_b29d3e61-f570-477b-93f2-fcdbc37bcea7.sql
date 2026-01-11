-- Allow authenticated users to create sessions for public groups
CREATE POLICY "Users can create sessions for public groups"
ON syndic8_sessions FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public_syndic8_groups
    WHERE public_syndic8_groups.id = syndic8_sessions.group_id
  )
);

-- Allow users to view sessions for public groups they participated in
CREATE POLICY "Users can view sessions for public groups"
ON syndic8_sessions FOR SELECT
USING (
  auth.uid() = user_id OR
  (EXISTS (
    SELECT 1 FROM public_syndic8_groups
    WHERE public_syndic8_groups.id = syndic8_sessions.group_id
  ) AND auth.uid() = user_id)
);

-- Allow users to update their own sessions in public groups
CREATE POLICY "Users can update sessions for public groups"
ON syndic8_sessions FOR UPDATE
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public_syndic8_groups
    WHERE public_syndic8_groups.id = syndic8_sessions.group_id
  )
);

-- Allow viewing syndic8_group_members for public groups (needed to show members in chat)
CREATE POLICY "Anyone can view members of public groups"
ON syndic8_group_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public_syndic8_groups
    WHERE public_syndic8_groups.id = syndic8_group_members.group_id
  )
);

-- Allow viewing settings for public groups
CREATE POLICY "Anyone can view settings for public groups"
ON syndic8_group_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public_syndic8_groups
    WHERE public_syndic8_groups.id = syndic8_group_settings.group_id
  )
);