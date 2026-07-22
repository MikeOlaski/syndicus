-- Create table for external webhook subscriptions (outbound notifications)
CREATE TABLE public.outbound_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  secret_key TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  events TEXT[] NOT NULL DEFAULT ARRAY['coach.published', 'coach.updated', 'coach.unpublished'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  last_response_status INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.outbound_webhooks ENABLE ROW LEVEL SECURITY;

-- Only admins can manage outbound webhooks
CREATE POLICY "Admins can manage outbound webhooks" 
ON public.outbound_webhooks 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create webhook logs table
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES public.outbound_webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view webhook logs
CREATE POLICY "Admins can view webhook logs" 
ON public.webhook_logs 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Add timestamp trigger
CREATE TRIGGER update_outbound_webhooks_updated_at
BEFORE UPDATE ON public.outbound_webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for webhook logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.webhook_logs;