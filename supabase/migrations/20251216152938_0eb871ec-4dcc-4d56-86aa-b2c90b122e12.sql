-- Allow anonymous users to view verified coaches on homepage
CREATE POLICY "Anonymous can view verified homepage coaches"
ON public.coach_profiles
FOR SELECT
TO anon
USING (is_verified = true AND show_on_homepage = true);

-- Create security definer function to get public coach profile data safely
CREATE OR REPLACE FUNCTION public.get_public_coach_profiles(coach_ids UUID[])
RETURNS TABLE (id UUID, full_name TEXT, avatar_url TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.avatar_url
  FROM profiles p
  INNER JOIN coach_profiles cp ON cp.user_id = p.id
  WHERE p.id = ANY(coach_ids)
    AND cp.is_verified = true;
END;
$$;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION public.get_public_coach_profiles(UUID[]) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_coach_profiles(UUID[]) TO authenticated;