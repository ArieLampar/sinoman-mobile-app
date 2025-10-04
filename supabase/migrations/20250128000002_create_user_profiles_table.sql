-- Create user_profiles table for storing user profile information
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    address TEXT,
    is_profile_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Only service role can insert (done via edge function during OTP verification)
CREATE POLICY "Service role can insert profiles" ON user_profiles
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- Function to sync user_profiles data to auth.users.user_metadata
CREATE OR REPLACE FUNCTION sync_user_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update auth.users.user_metadata with profile data
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
        'phone', NEW.phone,
        'name', NEW.name,
        'email', NEW.email,
        'address', NEW.address,
        'is_profile_complete', NEW.is_profile_complete
    )
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$;

-- Trigger to sync metadata when profile is updated
CREATE TRIGGER trigger_sync_user_metadata
    AFTER INSERT OR UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_metadata();

-- Index for phone number lookups
CREATE INDEX idx_user_profiles_phone ON user_profiles(phone);
