-- Add show_on_homepage column to coach_profiles
ALTER TABLE public.coach_profiles 
ADD COLUMN show_on_homepage boolean DEFAULT false;