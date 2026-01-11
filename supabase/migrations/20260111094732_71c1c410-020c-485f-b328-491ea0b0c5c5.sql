-- Fix the security definer view by making it security invoker
DROP VIEW IF EXISTS public.public_syndic8_groups;

CREATE VIEW public.public_syndic8_groups 
WITH (security_invoker = on)
AS
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
    SELECT 1 FROM syndic8_group_members m 
    WHERE m.group_id = g.id AND (m.has_approved_public = false OR m.has_approved_public IS NULL)
  )
  AND (SELECT COUNT(*) FROM syndic8_group_members m WHERE m.group_id = g.id) > 0;