-- Add coach_status enum type
CREATE TYPE coach_status AS ENUM (
  'admin_setup',
  'coach_claimed', 
  'onboarding_started',
  'onboarding_completed',
  'knowledge_base_setup',
  'active',
  'inactive'
);

-- Add status column to coach_profiles
ALTER TABLE coach_profiles 
ADD COLUMN status coach_status DEFAULT 'admin_setup' NOT NULL;

-- Add last_activity_at for tracking
ALTER TABLE coach_profiles
ADD COLUMN last_activity_at timestamp with time zone DEFAULT now();

-- Create index for filtering by status
CREATE INDEX idx_coach_profiles_status ON coach_profiles(status);

-- Update existing coaches based on their data
UPDATE coach_profiles 
SET status = CASE
  WHEN is_verified = true AND bio IS NOT NULL AND expertise IS NOT NULL THEN 'active'::coach_status
  WHEN is_claimed = true AND bio IS NOT NULL THEN 'onboarding_completed'::coach_status
  WHEN is_claimed = true THEN 'coach_claimed'::coach_status
  ELSE 'admin_setup'::coach_status
END;