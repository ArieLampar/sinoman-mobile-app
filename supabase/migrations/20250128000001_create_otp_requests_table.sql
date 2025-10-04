-- Create otp_requests table for custom OTP flow with FONTTE WhatsApp API
CREATE TABLE IF NOT EXISTS otp_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT false,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    verified_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT otp_code_format CHECK (otp_code ~ '^\d{6}$'),
    CONSTRAINT attempts_non_negative CHECK (attempts >= 0),
    CONSTRAINT expires_after_created CHECK (expires_at > created_at)
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_otp_requests_phone ON otp_requests(phone);
CREATE INDEX IF NOT EXISTS idx_otp_requests_expires_at ON otp_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_requests_phone_verified_expires ON otp_requests(phone, verified, expires_at);

-- Enable Row Level Security
ALTER TABLE otp_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies (use DO block to avoid errors if policies already exist)
DO $$
BEGIN
  -- Service role can do everything (for edge functions)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'otp_requests' AND policyname = 'Service role has full access'
  ) THEN
    CREATE POLICY "Service role has full access" ON otp_requests
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;

  -- Authenticated users can only read their own records (for debugging)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'otp_requests' AND policyname = 'Users can read own OTP records'
  ) THEN
    CREATE POLICY "Users can read own OTP records" ON otp_requests
      FOR SELECT
      TO authenticated
      USING (phone = current_setting('request.jwt.claims', true)::json->>'phone');
  END IF;
END $$;

-- Cleanup function for expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otp()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM otp_requests
    WHERE expires_at < (now() - interval '24 hours');
END;
$$;

-- Schedule cleanup to run every hour using pg_cron (if available)
-- Note: This requires pg_cron extension to be enabled in Supabase
-- If pg_cron is not available, you can manually run this or use another scheduler
-- SELECT cron.schedule('cleanup-expired-otp', '0 * * * *', 'SELECT cleanup_expired_otp()');

-- Manual cleanup can be done with: SELECT cleanup_expired_otp();
