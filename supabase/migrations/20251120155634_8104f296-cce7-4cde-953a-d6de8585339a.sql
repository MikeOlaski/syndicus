-- Fix RLS on coach_profiles to allow public viewing of verified coaches
DROP POLICY IF EXISTS "Admins can view all coach profiles" ON public.coach_profiles;
DROP POLICY IF EXISTS "Anyone can view verified coach profiles" ON public.coach_profiles;
DROP POLICY IF EXISTS "Coaches can view own profile" ON public.coach_profiles;

-- Public: can view any verified coach profile
CREATE POLICY "Public verified coach profiles"
ON public.coach_profiles
FOR SELECT
USING (is_verified = true);

-- Coaches: can view their own profile (even if not yet verified)
CREATE POLICY "Coach can view own coach profile"
ON public.coach_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND has_role(auth.uid(), 'coach'));

-- Admins: can view all coach profiles
CREATE POLICY "Admin can view all coach profiles"
ON public.coach_profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Fix RLS on profiles to allow public viewing of coach profiles only
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own email" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profile data" ON public.profiles;

-- Admins: can view all profiles
CREATE POLICY "Admin can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Users: can view their own profile
CREATE POLICY "User can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Public: can view profiles that belong to coaches (for the directory)
CREATE POLICY "Public can view coach profiles"
ON public.profiles
FOR SELECT
USING (has_role(id, 'coach'));