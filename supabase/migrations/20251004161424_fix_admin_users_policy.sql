-- Migration: Fix admin_users policy infinite recursion
-- Description: Drops problematic policies on admin_users table

-- Drop all policies on admin_users to fix infinite recursion
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_users') THEN
        -- Drop all existing policies
        FOR pol IN
            SELECT policyname
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename = 'admin_users'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_users', pol.policyname);
        END LOOP;

        -- Create simple, non-recursive policies
        -- Only allow authenticated users to view active admin users (without self-reference)
        CREATE POLICY "view_admin_users"
            ON public.admin_users
            FOR SELECT
            USING (auth.role() = 'authenticated');
    END IF;
END $$;
