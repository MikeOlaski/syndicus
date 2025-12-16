-- Fix: Ensure profiles and subscriptions tables deny anonymous access
-- The issue is that auth.uid() returns NULL for anonymous users, and policies need to handle this

-- Drop existing policies that may be problematic and recreate with explicit anonymous denial
-- For profiles table - ensure all SELECT policies require authentication

-- First, let's add a restrictive policy that denies anonymous access to profiles
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Add restrictive policy that denies anonymous access to subscriptions
DROP POLICY IF EXISTS "Deny anonymous access to subscriptions" ON public.subscriptions;
CREATE POLICY "Deny anonymous access to subscriptions"
ON public.subscriptions
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);