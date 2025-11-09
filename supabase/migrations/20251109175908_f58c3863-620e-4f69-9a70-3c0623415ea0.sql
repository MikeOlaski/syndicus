-- Create waitlist table
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  coach_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to join the waitlist
CREATE POLICY "Anyone can join waitlist"
ON public.waitlist
FOR INSERT
WITH CHECK (true);

-- Only authenticated users can view waitlist (for admin purposes)
CREATE POLICY "Authenticated users can view waitlist"
ON public.waitlist
FOR SELECT
USING (auth.role() = 'authenticated');

-- Create index for email lookups
CREATE INDEX idx_waitlist_email ON public.waitlist(email);

-- Add comment
COMMENT ON TABLE public.waitlist IS 'Stores waitlist signups for PersonaBot creation feature';