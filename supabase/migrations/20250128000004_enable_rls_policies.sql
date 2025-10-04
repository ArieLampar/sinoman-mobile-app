-- Migration: Enable Row Level Security (RLS) for Financial Tables
-- Description: Adds strict RLS policies to protect sensitive financial data

-- Enable RLS on all financial tables
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- TRANSACTIONS TABLE POLICIES
-- ==========================================

-- Users can only view their own transactions
CREATE POLICY "Users can view own transactions"
    ON public.transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users cannot directly insert transactions (must use RPCs)
CREATE POLICY "Users cannot directly insert transactions"
    ON public.transactions
    FOR INSERT
    WITH CHECK (false);

-- Users cannot update transactions
CREATE POLICY "Users cannot update transactions"
    ON public.transactions
    FOR UPDATE
    USING (false);

-- Users cannot delete transactions
CREATE POLICY "Users cannot delete transactions"
    ON public.transactions
    FOR DELETE
    USING (false);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role can manage all transactions"
    ON public.transactions
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ==========================================
-- USER_BALANCES TABLE POLICIES
-- ==========================================

-- Users can only view their own balance
CREATE POLICY "Users can view own balance"
    ON public.user_balances
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users cannot directly insert balance records
CREATE POLICY "Users cannot insert balance records"
    ON public.user_balances
    FOR INSERT
    WITH CHECK (false);

-- Users cannot directly update balance
CREATE POLICY "Users cannot update balance"
    ON public.user_balances
    FOR UPDATE
    USING (false);

-- Users cannot delete balance records
CREATE POLICY "Users cannot delete balance records"
    ON public.user_balances
    FOR DELETE
    USING (false);

-- Service role can manage all balances
CREATE POLICY "Service role can manage all balances"
    ON public.user_balances
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ==========================================
-- SAVINGS_BALANCE TABLE POLICIES
-- ==========================================

-- Users can only view their own savings
CREATE POLICY "Users can view own savings"
    ON public.savings_balance
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users cannot directly insert savings records
CREATE POLICY "Users cannot insert savings records"
    ON public.savings_balance
    FOR INSERT
    WITH CHECK (false);

-- Users cannot directly update savings
CREATE POLICY "Users cannot update savings"
    ON public.savings_balance
    FOR UPDATE
    USING (false);

-- Users cannot delete savings records
CREATE POLICY "Users cannot delete savings records"
    ON public.savings_balance
    FOR DELETE
    USING (false);

-- Service role can manage all savings
CREATE POLICY "Service role can manage all savings"
    ON public.savings_balance
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ==========================================
-- MERCHANTS TABLE POLICIES
-- ==========================================

-- All authenticated users can view active merchants
CREATE POLICY "Authenticated users can view active merchants"
    ON public.merchants
    FOR SELECT
    USING (auth.role() = 'authenticated' AND is_active = true);

-- Only service role can manage merchants
CREATE POLICY "Service role can manage merchants"
    ON public.merchants
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ==========================================
-- SECURITY DEFINER FUNCTIONS
-- ==========================================

-- Helper function to get user balance safely
CREATE OR REPLACE FUNCTION public.get_user_balance(p_user_id UUID DEFAULT NULL)
RETURNS TABLE(
    available_balance DECIMAL(15, 2),
    savings_balance DECIMAL(15, 2)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Use provided user_id or fall back to current user
    v_user_id := COALESCE(p_user_id, auth.uid());

    -- Security check: users can only query their own balance
    IF v_user_id != auth.uid() AND auth.jwt()->>'role' != 'service_role' THEN
        RAISE EXCEPTION 'Unauthorized: Cannot access other user balances';
    END IF;

    RETURN QUERY
    SELECT ub.available_balance, ub.savings_balance
    FROM public.user_balances ub
    WHERE ub.user_id = v_user_id;
END;
$$;

-- Helper function to get user transactions with pagination
CREATE OR REPLACE FUNCTION public.get_user_transactions(
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0,
    p_transaction_type TEXT DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    type TEXT,
    amount DECIMAL(15, 2),
    merchant_id UUID,
    savings_type TEXT,
    notes TEXT,
    status TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.type,
        t.amount,
        t.merchant_id,
        t.savings_type,
        t.notes,
        t.status,
        t.metadata,
        t.created_at
    FROM public.transactions t
    WHERE
        t.user_id = auth.uid()
        AND (p_transaction_type IS NULL OR t.type = p_transaction_type)
    ORDER BY t.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_balance TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_transactions TO authenticated;

-- Add comments
COMMENT ON POLICY "Users can view own transactions" ON public.transactions IS 'Users can only see their own transaction history';
COMMENT ON POLICY "Users can view own balance" ON public.user_balances IS 'Users can only view their own balance information';
COMMENT ON POLICY "Users can view own savings" ON public.savings_balance IS 'Users can only view their own savings data';
COMMENT ON POLICY "Authenticated users can view active merchants" ON public.merchants IS 'All authenticated users can browse active merchants';
