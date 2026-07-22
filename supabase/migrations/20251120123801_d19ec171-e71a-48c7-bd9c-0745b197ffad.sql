-- Add specialization and personality fields to coach_profiles table
ALTER TABLE public.coach_profiles 
ADD COLUMN specialization TEXT,
ADD COLUMN personality TEXT;