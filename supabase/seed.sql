-- Supabase Seed Data for Development/Testing
-- WARNING: FOR DEVELOPMENT ONLY - DO NOT RUN IN PRODUCTION

-- ============================================
-- Test User in auth.users
-- ============================================
-- Create a test user with phone number
-- Password: testuser123 (for manual testing if needed)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'testuser@sinoman.local',
  '$2a$10$XQqQqQqQqQqQqQqQqQqQqOe', -- placeholder hash
  now(),
  '+6281234567890',
  now(),
  '{"provider":"phone","providers":["phone"]}',
  '{"phone":"+6281234567890","name":"Test User","is_profile_complete":true}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Test User Profile
-- ============================================
INSERT INTO user_profiles (
  id,
  phone,
  name,
  email,
  address,
  is_profile_complete,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '+6281234567890',
  'Test User',
  'testuser@sinoman.local',
  'Jl. Testing No. 123, Jakarta',
  true,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Sample OTP Requests (for query testing)
-- ============================================

-- Expired OTP (24 hours ago)
INSERT INTO otp_requests (
  id,
  phone,
  otp_code,
  expires_at,
  verified,
  attempts,
  created_at
) VALUES (
  gen_random_uuid(),
  '+6281234567890',
  '111111',
  now() - interval '24 hours',
  false,
  0,
  now() - interval '25 hours'
);

-- Verified OTP (used successfully)
INSERT INTO otp_requests (
  id,
  phone,
  otp_code,
  expires_at,
  verified,
  attempts,
  created_at,
  verified_at
) VALUES (
  gen_random_uuid(),
  '+6281234567890',
  '222222',
  now() - interval '1 hour',
  true,
  1,
  now() - interval '2 hours',
  now() - interval '1 hour'
);

-- Active OTP (valid, for testing verification)
-- NOTE: Code '123456' only works in development
-- In production, this should be disabled or removed
INSERT INTO otp_requests (
  id,
  phone,
  otp_code,
  expires_at,
  verified,
  attempts,
  created_at
) VALUES (
  gen_random_uuid(),
  '+6281234567890',
  '123456',
  now() + interval '5 minutes',
  false,
  0,
  now()
);

-- Failed OTP (max attempts reached)
INSERT INTO otp_requests (
  id,
  phone,
  otp_code,
  expires_at,
  verified,
  attempts,
  created_at
) VALUES (
  gen_random_uuid(),
  '+6289876543210',
  '999999',
  now() - interval '1 minute',
  false,
  3,
  now() - interval '10 minutes'
);

-- ============================================
-- Additional Test Users (optional)
-- ============================================

-- Incomplete profile user
INSERT INTO auth.users (
  id,
  instance_id,
  phone,
  phone_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  '+6289876543210',
  now(),
  '{"provider":"phone","providers":["phone"]}',
  '{"phone":"+6289876543210","is_profile_complete":false}',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (
  id,
  phone,
  is_profile_complete,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '+6289876543210',
  false,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Usage Instructions
-- ============================================
-- To run this seed:
-- 1. Development (local): supabase db reset (runs migrations + seed)
-- 2. Or manually: psql $DATABASE_URL < supabase/seed.sql
--
-- Test OTP Code: 123456
-- Test Phone: +6281234567890
-- Test User ID: 11111111-1111-1111-1111-111111111111
--
-- IMPORTANT: Disable test OTP code (123456) in production!
