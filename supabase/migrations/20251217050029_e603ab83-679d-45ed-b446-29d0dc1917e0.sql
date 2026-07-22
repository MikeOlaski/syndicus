-- Table to store API keys for external integrations
CREATE TABLE public.external_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  allowed_origins TEXT[] DEFAULT '{}',
  permissions TEXT[] DEFAULT '{read_coaches, chat}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.external_api_keys ENABLE ROW LEVEL SECURITY;

-- Only admins can manage API keys
CREATE POLICY "Admins can view API keys"
ON public.external_api_keys
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert API keys"
ON public.external_api_keys
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update API keys"
ON public.external_api_keys
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete API keys"
ON public.external_api_keys
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial API key for rehabit.biz
INSERT INTO public.external_api_keys (name, api_key, allowed_origins, permissions)
VALUES (
  'rehabit.biz',
  'sk_live_' || encode(gen_random_bytes(32), 'hex'),
  ARRAY['https://rehabit.biz', 'https://preview.rehabit.biz', 'http://localhost:3000'],
  ARRAY['read_coaches', 'chat']
);