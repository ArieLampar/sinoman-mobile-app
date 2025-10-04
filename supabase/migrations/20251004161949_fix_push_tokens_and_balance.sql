-- Migration: Fix push_tokens device_type column and add auto-create balance trigger
-- Description: Adds missing device_type column and creates trigger to auto-initialize user balance

-- 1. Add device_type column to push_tokens (rename platform to device_type)
ALTER TABLE public.push_tokens
  DROP COLUMN IF EXISTS platform CASCADE;

ALTER TABLE public.push_tokens
  ADD COLUMN IF NOT EXISTS device_type TEXT CHECK (device_type IN ('ios', 'android', 'web'));

-- 2. Create function to auto-initialize user balance on first login
CREATE OR REPLACE FUNCTION public.initialize_user_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default balance for new user if not exists
  INSERT INTO public.savings_balance (user_id, pokok, wajib, sukarela)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger to auto-initialize balance when user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_balance();

-- 4. Initialize balance for existing users who don't have one
INSERT INTO public.savings_balance (user_id, pokok, wajib, sukarela)
SELECT u.id, 0, 0, 0
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.savings_balance sb WHERE sb.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- 5. Add updated_at trigger for push_tokens
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_push_tokens_updated_at ON public.push_tokens;
CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.initialize_user_balance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;
