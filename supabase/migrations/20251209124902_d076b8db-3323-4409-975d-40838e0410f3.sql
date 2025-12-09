-- Fix waitlist visibility: restrict to admins only
DROP POLICY IF EXISTS "Authenticated users can view waitlist" ON public.waitlist;

CREATE POLICY "Admins can view waitlist" ON public.waitlist
  FOR SELECT USING (has_role(auth.uid(), 'admin'));