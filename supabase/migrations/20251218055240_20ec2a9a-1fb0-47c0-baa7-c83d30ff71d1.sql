-- Add expires_at column to outbound_webhooks table
ALTER TABLE public.outbound_webhooks 
ADD COLUMN expires_at timestamp with time zone DEFAULT NULL;

-- Add a comment to explain the column
COMMENT ON COLUMN public.outbound_webhooks.expires_at IS 'When the secret key expires. NULL means never expires.';