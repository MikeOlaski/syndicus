
-- 1. Remove anon SELECT policy on coach_profiles (exposes webhook_url, personality)
DROP POLICY IF EXISTS "Anonymous can view verified homepage coaches" ON public.coach_profiles;

-- Public listing view (safe columns only, no webhook_url)
CREATE OR REPLACE VIEW public.public_coach_listing
WITH (security_invoker = true) AS
SELECT id, user_id, slug, specialization, bio, expertise, personality,
       rating, total_sessions, hourly_rate, is_verified, show_on_homepage,
       website_url, twitter_url, linkedin_url, instagram_url, status,
       created_at, updated_at
FROM public.coach_profiles
WHERE is_verified = true AND show_on_homepage = true;

-- The view runs as invoker so we need a SELECT policy that allows anon to read
-- those rows from coach_profiles via the view. Reuse the safe predicate.
CREATE POLICY "Anon can view verified homepage coaches via listing"
ON public.coach_profiles FOR SELECT TO anon
USING (is_verified = true AND show_on_homepage = true);

-- Lock down sensitive columns from anon
REVOKE SELECT (webhook_url, personality) ON public.coach_profiles FROM anon;

GRANT SELECT ON public.public_coach_listing TO anon, authenticated;

-- 2. Tighten always-true RLS on waitlist
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;
CREATE POLICY "Anyone can join waitlist"
ON public.waitlist FOR INSERT TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) BETWEEN 5 AND 320
  AND email LIKE '%@%.%'
  AND full_name IS NOT NULL
  AND length(full_name) BETWEEN 1 AND 200
  AND (coach_type IS NULL OR length(coach_type) <= 100)
);

-- 3. Remove sensitive tables from Realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.coach_sessions;
ALTER PUBLICATION supabase_realtime DROP TABLE public.webhook_logs;

-- 4. Storage avatars: drop broad listing SELECT policy.
-- Bucket remains public so direct URL access still works for avatars.
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;

-- 5. Hash outbound_webhooks.secret_key (drop plaintext storage)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.outbound_webhooks
  ADD COLUMN IF NOT EXISTS secret_key_hash text;

UPDATE public.outbound_webhooks
SET secret_key_hash = encode(digest(secret_key, 'sha256'), 'hex')
WHERE secret_key_hash IS NULL AND secret_key IS NOT NULL;

ALTER TABLE public.outbound_webhooks
  ALTER COLUMN secret_key_hash SET NOT NULL;

ALTER TABLE public.outbound_webhooks DROP COLUMN secret_key;

-- 6. Restrict EXECUTE on SECURITY DEFINER functions not meant to be invoked
-- directly by clients (RLS helpers and RPCs the frontend does call are left alone).
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_syndic8_popularity() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_coach_total_sessions() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
