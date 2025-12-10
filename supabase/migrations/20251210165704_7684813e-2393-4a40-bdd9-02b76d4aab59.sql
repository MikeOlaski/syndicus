-- Create webhook_endpoints table for admin to manage webhooks
CREATE TABLE public.webhook_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

-- Only admins can view webhooks
CREATE POLICY "Admins can view webhooks"
ON public.webhook_endpoints
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert webhooks
CREATE POLICY "Admins can insert webhooks"
ON public.webhook_endpoints
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update webhooks
CREATE POLICY "Admins can update webhooks"
ON public.webhook_endpoints
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete webhooks
CREATE POLICY "Admins can delete webhooks"
ON public.webhook_endpoints
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_webhook_endpoints_updated_at
BEFORE UPDATE ON public.webhook_endpoints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default webhook for coach agent
INSERT INTO public.webhook_endpoints (name, description, url)
VALUES ('add_coach_agent', 'Webhook for Add Coach by Agent feature', '');