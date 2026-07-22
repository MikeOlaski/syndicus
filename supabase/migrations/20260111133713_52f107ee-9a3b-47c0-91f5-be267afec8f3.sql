-- Fix the broken RLS policy on syndic8_groups that causes infinite recursion
-- The issue: m.group_id = m.id (comparing to wrong column)
-- Should be: m.group_id = syndic8_groups.id

DROP POLICY IF EXISTS "Anyone can view public syndic8 groups" ON public.syndic8_groups;

-- Recreate with the correct condition
CREATE POLICY "Anyone can view public syndic8 groups" 
ON public.syndic8_groups 
FOR SELECT 
USING (
  (is_public = true) AND 
  (NOT (EXISTS ( 
    SELECT 1
    FROM syndic8_group_members m
    WHERE (m.group_id = syndic8_groups.id) 
      AND ((m.has_approved_public = false) OR (m.has_approved_public IS NULL))
  )))
);