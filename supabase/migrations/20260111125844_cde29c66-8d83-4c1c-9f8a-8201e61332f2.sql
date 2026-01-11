-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Allow anonymous to count syndic8_groups" ON public.syndic8_groups;
DROP POLICY IF EXISTS "Anonymous can count syndic8_groups" ON public.syndic8_groups;

-- Create a security definer function for counting syndic8_groups
CREATE OR REPLACE FUNCTION public.count_syndic8_groups()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.syndic8_groups WHERE is_public = true;
$$;

-- Create a security definer function for counting coach_sessions
CREATE OR REPLACE FUNCTION public.count_coach_sessions()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.coach_sessions;
$$;

-- Drop the overly permissive policy on coach_sessions too
DROP POLICY IF EXISTS "Allow anonymous to count coach_sessions" ON public.coach_sessions;
DROP POLICY IF EXISTS "Anonymous can count coach_sessions" ON public.coach_sessions;