-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'coach', 'subscriber');

-- Create profiles table for basic user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create coach_profiles table for digital twin data
CREATE TABLE public.coach_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bio TEXT,
  expertise TEXT[],
  hourly_rate DECIMAL(10,2),
  is_verified BOOLEAN DEFAULT false,
  is_claimed BOOLEAN DEFAULT false,
  total_sessions INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID REFERENCES public.coach_profiles(user_id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(subscriber_id, coach_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Only system can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- RLS Policies for coach_profiles
CREATE POLICY "Anyone can view verified coach profiles"
  ON public.coach_profiles FOR SELECT
  TO authenticated
  USING (is_verified = true);

CREATE POLICY "Coaches can view own profile"
  ON public.coach_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can update own profile"
  ON public.coach_profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND
    public.has_role(auth.uid(), 'coach')
  );

CREATE POLICY "Coaches can insert own profile"
  ON public.coach_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    public.has_role(auth.uid(), 'coach')
  );

-- RLS Policies for subscriptions
CREATE POLICY "Subscribers can view own subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = subscriber_id);

CREATE POLICY "Coaches can view their subscribers"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = coach_id AND
    public.has_role(auth.uid(), 'coach')
  );

CREATE POLICY "Subscribers can create subscriptions"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = subscriber_id AND
    public.has_role(auth.uid(), 'subscriber')
  );

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_profiles_updated_at
  BEFORE UPDATE ON public.coach_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();