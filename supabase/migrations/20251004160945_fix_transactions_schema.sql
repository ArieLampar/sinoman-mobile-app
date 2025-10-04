-- Migration: Fix database schema issues
-- Description: Creates missing tables and fixes policy issues

-- Drop existing transactions table if it has wrong schema
DROP TABLE IF EXISTS public.transactions CASCADE;

-- Create transactions table with correct schema
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'qr_payment', 'top_up', 'transfer')),
    savings_type TEXT CHECK (savings_type IN ('pokok', 'wajib', 'sukarela', 'regular', 'emergency', 'investment')),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    balance DECIMAL(15, 2),
    balance_before DECIMAL(15, 2),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'success', 'failed', 'cancelled')),
    reference_id TEXT,
    payment_method TEXT,
    payment_url TEXT,
    bank_account TEXT,
    fee DECIMAL(15, 2) DEFAULT 0,
    merchant_id UUID,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_balances table
CREATE TABLE IF NOT EXISTS public.user_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    available_balance DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
    savings_balance DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (savings_balance >= 0),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create savings_balance table with columns that match app expectations
CREATE TABLE IF NOT EXISTS public.savings_balance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    pokok DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (pokok >= 0),
    wajib DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (wajib >= 0),
    sukarela DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (sukarela >= 0),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create merchants table
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    merchant_code TEXT UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create push_tokens table for notifications
CREATE TABLE IF NOT EXISTS public.push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    device_id TEXT,
    platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- Add indexes for performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_user_balances_user_id ON public.user_balances(user_id);
CREATE INDEX idx_savings_balance_user_id ON public.savings_balance(user_id);
CREATE INDEX idx_push_tokens_user_id ON public.push_tokens(user_id);
CREATE INDEX idx_push_tokens_token ON public.push_tokens(token);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view own balance" ON public.user_balances;
DROP POLICY IF EXISTS "Users can view own savings" ON public.savings_balance;
DROP POLICY IF EXISTS "Authenticated users can view active merchants" ON public.merchants;
DROP POLICY IF EXISTS "Users can view own push tokens" ON public.push_tokens;

-- Transactions policies
CREATE POLICY "Users can view own transactions"
    ON public.transactions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON public.transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User balances policies
CREATE POLICY "Users can view own balance"
    ON public.user_balances
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own balance"
    ON public.user_balances
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Savings balance policies
CREATE POLICY "Users can view own savings"
    ON public.savings_balance
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings"
    ON public.savings_balance
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Merchants policies
CREATE POLICY "Authenticated users can view active merchants"
    ON public.merchants
    FOR SELECT
    USING (auth.role() = 'authenticated' AND is_active = true);

-- Push tokens policies
CREATE POLICY "Users can view own push tokens"
    ON public.push_tokens
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push tokens"
    ON public.push_tokens
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push tokens"
    ON public.push_tokens
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push tokens"
    ON public.push_tokens
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.transactions TO authenticated;
GRANT ALL ON public.user_balances TO authenticated;
GRANT ALL ON public.savings_balance TO authenticated;
GRANT SELECT ON public.merchants TO authenticated;
GRANT ALL ON public.push_tokens TO authenticated;
