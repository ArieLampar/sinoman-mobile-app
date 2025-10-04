-- Migration: Atomic QR Payment RPC
-- Description: Creates a stored procedure for atomic QR payment processing with row-level locks

-- Create transactions table if not exists
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('qr_payment', 'top_up', 'withdrawal', 'transfer')),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    merchant_id UUID,
    savings_type TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_balances table if not exists
CREATE TABLE IF NOT EXISTS public.user_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    available_balance DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
    savings_balance DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (savings_balance >= 0),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create merchants table if not exists
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    merchant_code TEXT UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create savings_balance table if not exists (for different savings types)
CREATE TABLE IF NOT EXISTS public.savings_balance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    savings_type TEXT NOT NULL CHECK (savings_type IN ('regular', 'emergency', 'investment')),
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, savings_type)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON public.user_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_balance_user_id ON public.savings_balance(user_id);

-- Atomic QR Payment Function
-- This function ensures that QR payment is processed atomically with proper locking
CREATE OR REPLACE FUNCTION public.process_qr_payment(
    p_user_id UUID,
    p_amount DECIMAL(15, 2),
    p_merchant_id UUID,
    p_savings_type TEXT DEFAULT 'regular',
    p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    transaction_id UUID,
    new_balance DECIMAL(15, 2),
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_transaction_id UUID;
    v_current_balance DECIMAL(15, 2);
    v_new_balance DECIMAL(15, 2);
    v_savings_current DECIMAL(15, 2);
    v_merchant_exists BOOLEAN;
BEGIN
    -- Validate inputs
    IF p_amount <= 0 THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL(15, 2), 'Amount must be greater than zero';
        RETURN;
    END IF;

    IF p_user_id IS NULL THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL(15, 2), 'User ID is required';
        RETURN;
    END IF;

    -- Verify merchant exists and is active
    SELECT EXISTS(
        SELECT 1 FROM public.merchants
        WHERE id = p_merchant_id AND is_active = true
    ) INTO v_merchant_exists;

    IF NOT v_merchant_exists THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL(15, 2), 'Invalid or inactive merchant';
        RETURN;
    END IF;

    -- Lock the user balance row for update (prevents race conditions)
    SELECT available_balance INTO v_current_balance
    FROM public.user_balances
    WHERE user_id = p_user_id
    FOR UPDATE;

    -- If user balance doesn't exist, create it
    IF v_current_balance IS NULL THEN
        INSERT INTO public.user_balances (user_id, available_balance, savings_balance)
        VALUES (p_user_id, 0, 0)
        ON CONFLICT (user_id) DO NOTHING;
        v_current_balance := 0;
    END IF;

    -- Check if sufficient balance
    IF v_current_balance < p_amount THEN
        RETURN QUERY SELECT false, NULL::UUID, v_current_balance, 'Insufficient balance';
        RETURN;
    END IF;

    -- Calculate new balance
    v_new_balance := v_current_balance - p_amount;

    -- Create transaction record
    INSERT INTO public.transactions (
        user_id,
        type,
        amount,
        merchant_id,
        savings_type,
        notes,
        status,
        metadata
    )
    VALUES (
        p_user_id,
        'qr_payment',
        p_amount,
        p_merchant_id,
        p_savings_type,
        p_notes,
        'completed',
        jsonb_build_object(
            'payment_method', 'qr',
            'processed_at', NOW()
        )
    )
    RETURNING id INTO v_transaction_id;

    -- Update user balance atomically
    UPDATE public.user_balances
    SET
        available_balance = v_new_balance,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- If savings type is specified, update savings balance
    IF p_savings_type IS NOT NULL THEN
        -- Lock savings balance for update
        SELECT balance INTO v_savings_current
        FROM public.savings_balance
        WHERE user_id = p_user_id AND savings_type = p_savings_type
        FOR UPDATE;

        -- Create savings record if doesn't exist
        IF v_savings_current IS NULL THEN
            INSERT INTO public.savings_balance (user_id, savings_type, balance)
            VALUES (p_user_id, p_savings_type, p_amount)
            ON CONFLICT (user_id, savings_type)
            DO UPDATE SET balance = savings_balance.balance + p_amount, updated_at = NOW();
        ELSE
            -- Update existing savings
            UPDATE public.savings_balance
            SET
                balance = balance + p_amount,
                updated_at = NOW()
            WHERE user_id = p_user_id AND savings_type = p_savings_type;
        END IF;
    END IF;

    -- Return success with transaction details
    RETURN QUERY SELECT true, v_transaction_id, v_new_balance, NULL::TEXT;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.process_qr_payment TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.process_qr_payment IS 'Atomically process QR payment with balance validation and row-level locking';
