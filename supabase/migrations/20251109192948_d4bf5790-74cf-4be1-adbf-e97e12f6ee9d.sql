-- Create knowledge_base table for storing coach assets
CREATE TABLE public.knowledge_base (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  file_url text,
  file_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Coaches can view their own assets
CREATE POLICY "Coaches can view own assets"
ON public.knowledge_base
FOR SELECT
USING (auth.uid() = coach_id AND has_role(auth.uid(), 'coach'::app_role));

-- Coaches can insert their own assets
CREATE POLICY "Coaches can insert own assets"
ON public.knowledge_base
FOR INSERT
WITH CHECK (auth.uid() = coach_id AND has_role(auth.uid(), 'coach'::app_role));

-- Coaches can update their own assets
CREATE POLICY "Coaches can update own assets"
ON public.knowledge_base
FOR UPDATE
USING (auth.uid() = coach_id AND has_role(auth.uid(), 'coach'::app_role));

-- Coaches can delete their own assets
CREATE POLICY "Coaches can delete own assets"
ON public.knowledge_base
FOR DELETE
USING (auth.uid() = coach_id AND has_role(auth.uid(), 'coach'::app_role));

-- Admins can view all assets
CREATE POLICY "Admins can view all assets"
ON public.knowledge_base
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_knowledge_base_updated_at
BEFORE UPDATE ON public.knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();