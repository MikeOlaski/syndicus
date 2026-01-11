-- Add public visibility and member approval fields to syndic8_groups
ALTER TABLE public.syndic8_groups 
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS popularity_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS public_description text,
ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Add member approval tracking to syndic8_group_members
ALTER TABLE public.syndic8_group_members 
ADD COLUMN IF NOT EXISTS has_approved_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

-- Create index for faster public group queries
CREATE INDEX IF NOT EXISTS idx_syndic8_groups_public ON public.syndic8_groups(is_public, popularity_score DESC) WHERE is_public = true;

-- Create a view for public syndic8 groups (only groups where ALL members have approved)
CREATE OR REPLACE VIEW public.public_syndic8_groups AS
SELECT 
  g.id,
  g.name,
  g.description,
  g.public_description,
  g.cover_image_url,
  g.popularity_score,
  g.is_featured,
  g.created_at,
  g.owner_id,
  (SELECT COUNT(*)::integer FROM syndic8_group_members m WHERE m.group_id = g.id) as member_count,
  (SELECT array_agg(cp.specialization) 
   FROM syndic8_group_members m 
   JOIN coach_profiles cp ON m.coach_id = cp.id 
   WHERE m.group_id = g.id) as specializations
FROM public.syndic8_groups g
WHERE g.is_public = true
  AND NOT EXISTS (
    -- Exclude groups where any member hasn't approved
    SELECT 1 FROM syndic8_group_members m 
    WHERE m.group_id = g.id AND (m.has_approved_public = false OR m.has_approved_public IS NULL)
  )
  AND (SELECT COUNT(*) FROM syndic8_group_members m WHERE m.group_id = g.id) > 0;

-- Enable RLS on the view implicitly through the base tables
-- Add RLS policy for public read access to public groups
CREATE POLICY "Anyone can view public syndic8 groups" 
ON public.syndic8_groups 
FOR SELECT 
USING (
  is_public = true 
  AND NOT EXISTS (
    SELECT 1 FROM syndic8_group_members m 
    WHERE m.group_id = id AND (m.has_approved_public = false OR m.has_approved_public IS NULL)
  )
);

-- Coach members can approve/unapprove their participation in public groups
CREATE POLICY "Coach members can update their public approval" 
ON public.syndic8_group_members 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM coach_profiles cp 
    WHERE cp.id = coach_id AND cp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM coach_profiles cp 
    WHERE cp.id = coach_id AND cp.user_id = auth.uid()
  )
);

-- Group owners can toggle public visibility
CREATE POLICY "Group owners can update public visibility" 
ON public.syndic8_groups 
FOR UPDATE 
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Function to increment popularity when a session is started
CREATE OR REPLACE FUNCTION public.increment_syndic8_popularity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE syndic8_groups
  SET popularity_score = COALESCE(popularity_score, 0) + 1
  WHERE id = NEW.group_id;
  RETURN NEW;
END;
$$;

-- Trigger to track popularity based on sessions
DROP TRIGGER IF EXISTS increment_syndic8_popularity_trigger ON syndic8_sessions;
CREATE TRIGGER increment_syndic8_popularity_trigger
AFTER INSERT ON syndic8_sessions
FOR EACH ROW
EXECUTE FUNCTION increment_syndic8_popularity();