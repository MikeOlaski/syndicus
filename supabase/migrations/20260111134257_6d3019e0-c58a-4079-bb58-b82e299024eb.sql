
-- Fix infinite recursion between syndic8_groups and syndic8_group_members
-- The issue: syndic8_groups RLS queries syndic8_group_members, which has RLS that queries public_syndic8_groups (view that queries syndic8_groups)

-- Step 1: Create a security definer function to check if group is viewable
CREATE OR REPLACE FUNCTION public.is_syndic8_group_owner(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM syndic8_groups 
    WHERE id = _group_id AND owner_id = _user_id
  );
$$;

-- Step 2: Create a function to check if group is fully approved for public
CREATE OR REPLACE FUNCTION public.is_syndic8_group_public(_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM syndic8_groups g
    WHERE g.id = _group_id 
      AND g.is_public = true
      AND NOT EXISTS (
        SELECT 1 FROM syndic8_group_members m
        WHERE m.group_id = g.id
          AND (m.has_approved_public = false OR m.has_approved_public IS NULL)
      )
  );
$$;

-- Step 3: Drop and recreate problematic policies on syndic8_groups
DROP POLICY IF EXISTS "Anyone can view public syndic8 groups" ON public.syndic8_groups;
DROP POLICY IF EXISTS "Users can view own groups" ON public.syndic8_groups;

CREATE POLICY "Users can view own groups" 
ON public.syndic8_groups 
FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view public syndic8 groups" 
ON public.syndic8_groups 
FOR SELECT 
USING (is_syndic8_group_public(id));

-- Step 4: Drop and recreate problematic policies on syndic8_group_members
DROP POLICY IF EXISTS "Anyone can view members of public groups" ON public.syndic8_group_members;
DROP POLICY IF EXISTS "Users can view members of own groups" ON public.syndic8_group_members;

CREATE POLICY "Users can view members of own groups" 
ON public.syndic8_group_members 
FOR SELECT 
USING (is_syndic8_group_owner(group_id, auth.uid()));

CREATE POLICY "Anyone can view members of public groups" 
ON public.syndic8_group_members 
FOR SELECT 
USING (is_syndic8_group_public(group_id));
