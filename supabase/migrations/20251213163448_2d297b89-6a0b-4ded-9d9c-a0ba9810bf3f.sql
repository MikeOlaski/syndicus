-- Add website and social links fields to coach_profiles
ALTER TABLE public.coach_profiles 
ADD COLUMN website_url text,
ADD COLUMN twitter_url text,
ADD COLUMN linkedin_url text,
ADD COLUMN instagram_url text;