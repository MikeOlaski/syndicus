-- Add webhook URL column to coach_profiles table
ALTER TABLE public.coach_profiles 
ADD COLUMN webhook_url text;