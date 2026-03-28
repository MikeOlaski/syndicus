
-- Hash existing API keys and drop plaintext column from external_api_keys
-- This table is no longer actively used (consolidated into outbound_webhooks)

-- Enable pgcrypto for digest function
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- Add hash column
ALTER TABLE public.external_api_keys ADD COLUMN api_key_hash text;

-- Hash existing keys
UPDATE public.external_api_keys 
SET api_key_hash = encode(extensions.digest(api_key, 'sha256'), 'hex')
WHERE api_key IS NOT NULL;

-- Drop the plaintext column
ALTER TABLE public.external_api_keys DROP COLUMN api_key;
