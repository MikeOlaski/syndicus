-- Add admin role to app_role enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'admin' 
    AND enumtypid = 'public.app_role'::regtype
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'admin';
  END IF;
END $$;

-- Create admin_actions audit log table
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_actions
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Admins can view all admin actions
CREATE POLICY "Admins can view all actions"
ON public.admin_actions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can insert actions
CREATE POLICY "Admins can log actions"
ON public.admin_actions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') AND auth.uid() = admin_id);

-- Update coach_profiles RLS to allow admins to manage
CREATE POLICY "Admins can view all coach profiles"
ON public.coach_profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update coach profiles"
ON public.coach_profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete coach profiles"
ON public.coach_profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Update profiles RLS to allow admins to view all
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Update subscriptions RLS to allow admins to view all
CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update subscriptions"
ON public.subscriptions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coach_profiles_is_verified ON public.coach_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);