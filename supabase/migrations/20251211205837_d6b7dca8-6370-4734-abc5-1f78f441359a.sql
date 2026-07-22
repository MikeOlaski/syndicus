-- Add slug column to coach_profiles
ALTER TABLE public.coach_profiles ADD COLUMN slug text;

-- Generate slugs for existing coaches from their profile names
-- First, update with base slugs
UPDATE public.coach_profiles cp
SET slug = lower(regexp_replace(
  regexp_replace(
    COALESCE(
      (SELECT p.full_name FROM public.profiles p WHERE p.id = cp.user_id),
      'coach-' || cp.user_id::text
    ),
    '[^a-zA-Z0-9\s-]', '', 'g'
  ),
  '\s+', '-', 'g'
));

-- Handle any duplicate slugs by appending a suffix
WITH duplicates AS (
  SELECT user_id, slug, 
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM public.coach_profiles
)
UPDATE public.coach_profiles cp
SET slug = cp.slug || '-' || d.rn
FROM duplicates d
WHERE cp.user_id = d.user_id AND d.rn > 1;

-- Add NOT NULL constraint and unique index
ALTER TABLE public.coach_profiles ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX idx_coach_profiles_slug ON public.coach_profiles(slug);