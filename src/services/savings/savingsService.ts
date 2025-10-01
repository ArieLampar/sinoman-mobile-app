import { supabase } from '@services/supabase';
import { logger } from '@utils/logger';
import {
  Balance,
  Transaction,
  TopUpRequest,
  TopUpResponse,
  WithdrawalRequest,
  SavingsType,
  ApiResponse,
  PaginatedResponse,
  MonthlyChartData,
  TransactionReceipt,
} from '@types';

/**
 * Fetch user's savings balance
 * @returns Balance object or null
 */
export async function fetchBalance(): Promise<Balance | null> {
  try {
    logger.info('Fetching savings balance');

    const { data, error } = await supabase
      .from('savings_balance')
      .select('*')
      .single();

    if (error) {
      logger.error('Fetch balance error:', error.message);
      return null;
    }

    if (!data) {
      logger.warn('No balance data found');
      return {
        pokok: 0,
        wajib: 0,
        sukarela: 0,
        total: 0,
      };
    }

    const balance: Balance = {
      pokok: data.pokok || 0,
      wajib: data.wajib || 0,
      sukarela: data.sukarela || 0,
      total: (data.pokok || 0) + (data.wajib || 0) + (data.sukarela || 0),
    };

    logger.info('Balance fetched successfully:', balance);
    return balance;
  } catch (error: any) {
    logger.error('Fetch balance exception:', error);
    return null;
  }
}

/**
 * Fetch user's transaction history
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 * @param savingsType - Filter by savings type (optional)
 * @returns Paginated transactions
 */
export async function fetchTransactions(
  page: number = 1,
  limit: number = 20,
  savingsType?: SavingsType
): Promise<PaginatedResponse<Transaction>> {
  try {
    logger.info('Fetching transactions:', { page, limit, savingsType });

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    // Filter by savings type if provided
    if (savingsType) {
      query = query.eq('savings_type', savingsType);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('Fetch transactions error:', error.message);
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const transactions: Transaction[] = (data || []).map((row) => ({
      id: row.id,
      type: row.type,
      savingsType: row.savings_type,
      amount: row.amount,
      balance: row.balance,
      description: row.description,
      createdAt: row.created_at,
      status: row.status,
      referenceId: row.reference_id,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    logger.info('Transactions fetched:', transactions.length);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  } catch (error: any) {
    logger.error('Fetch transactions exception:', error);
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

/**
 * Top up savings account
 * @param request - Top up request data
 * @returns Top up response
 */
export async function topUp(request: TopUpRequest): Promise<TopUpResponse> {
  try {
    logger.info('Processing top up:', request);

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type: 'deposit',
        savings_type: request.savingsType,
        amount: request.amount,
        payment_method: request.paymentMethod,
        status: 'pending',
        description: `Top up ${request.savingsType}`,
      })
      .select()
      .single();

    if (error) {
      logger.error('Top up error:', error.message);
      throw new Error(error.message);
    }

    // Fetch updated balance
    const balance = await fetchBalance();

    const response: TopUpResponse = {
      transactionId: data.id,
      status: data.status,
      balance: balance || { pokok: 0, wajib: 0, sukarela: 0, total: 0 },
      paymentUrl: data.payment_url,
    };

    logger.info('Top up successful:', response.transactionId);
    return response;
  } catch (error: any) {
    logger.error('Top up exception:', error);
    throw error;
  }
}

/**
 * Withdraw from savings account
 * @param request - Withdrawal request data
 */
export async function withdraw(request: WithdrawalRequest): Promise<void> {
  try {
    logger.info('Processing withdrawal:', request);

    const { error } = await supabase
      .from('transactions')
      .insert({
        type: 'withdrawal',
        savings_type: request.savingsType,
        amount: request.amount,
        status: 'pending',
        description: `Withdrawal from ${request.savingsType}`,
        bank_account: request.bankAccount,
      });

    if (error) {
      logger.error('Withdrawal error:', error.message);
      throw new Error(error.message);
    }

    logger.info('Withdrawal request submitted');
  } catch (error: any) {
    logger.error('Withdrawal exception:', error);
    throw error;
  }
}

/**
 * Fetch savings statistics
 * @param savingsType - Optional filter by savings type
 * @returns Savings statistics
 */
export async function fetchSavingsStats(savingsType?: SavingsType): Promise<any> {
  try {
    logger.info('Fetching savings stats');

    let query = supabase
      .from('transactions')
      .select('type, amount, created_at');

    if (savingsType) {
      query = query.eq('savings_type', savingsType);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Fetch stats error:', error.message);
      return null;
    }

    // Calculate stats
    const totalDeposits = (data || [])
      .filter((t) => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = (data || [])
      .filter((t) => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalDeposits,
      totalWithdrawals,
      transactionCount: data?.length || 0,
    };
  } catch (error: any) {
    logger.error('Fetch stats exception:', error);
    return null;
  }
}

/**
 * Fetch monthly chart data for savings growth
 * @param savingsType - Optional filter by savings type
 * @param months - Number of months to fetch (default: 6)
 * @returns Monthly chart data
 */
export async function fetchChartData(
  savingsType?: SavingsType,
  months: number = 6
): Promise<MonthlyChartData> {
  try {
    logger.info('Fetching chart data:', { savingsType, months });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    let query = supabase
      .from('transactions')
      .select('type, amount, created_at, savings_type')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (savingsType) {
      query = query.eq('savings_type', savingsType);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Fetch chart data error:', error.message);
      return { labels: [], datasets: [{ data: [] }] };
    }

    // Aggregate by month
    const monthlyData = new Map<string, { balance: number; month: string }>();
    let runningBalance = 0;

    // Initialize months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = `${monthNames[date.getMonth()]} '${String(date.getFullYear()).slice(2)}`;
      monthlyData.set(monthKey, { balance: 0, month: monthLabel });
    }

    // Process transactions
    (data || []).forEach((transaction) => {
      const date = new Date(transaction.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (transaction.type === 'deposit') {
        runningBalance += transaction.amount;
      } else if (transaction.type === 'withdrawal') {
        runningBalance -= transaction.amount;
      }

      if (monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          ...monthlyData.get(monthKey)!,
          balance: runningBalance,
        });
      }
    });

    // Convert to chart format
    const sortedData = Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([_, value]) => value);

    const labels = sortedData.map((d) => d.month);
    const balances = sortedData.map((d) => d.balance);

    logger.info('Chart data fetched:', { labels, balances });

    return {
      labels,
      datasets: [{ data: balances }],
    };
  } catch (error: any) {
    logger.error('Fetch chart data exception:', error);
    return { labels: [], datasets: [{ data: [] }] };
  }
}

/**
 * Generate receipt for a transaction
 * @param transactionId - Transaction ID
 * @returns Transaction receipt or null
 */
export async function generateReceipt(
  transactionId: string
): Promise<TransactionReceipt | null> {
  try {
    logger.info('Generating receipt for transaction:', transactionId);

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error || !data) {
      logger.error('Fetch transaction error:', error?.message);
      return null;
    }

    // Fetch current balance
    const balance = await fetchBalance();

    const receipt: TransactionReceipt = {
      transactionId: data.id,
      type: data.type,
      savingsType: data.savings_type,
      amount: data.amount,
      fee: data.fee || 0,
      totalAmount: data.amount + (data.fee || 0),
      paymentMethod: data.payment_method,
      status: data.status,
      timestamp: data.created_at,
      referenceId: data.reference_id || `REF-${data.id.substring(0, 8).toUpperCase()}`,
      description: data.description || `${data.type} ${data.savings_type}`,
      balanceBefore: data.balance_before || 0,
      balanceAfter: balance?.total || 0,
    };

    logger.info('Receipt generated successfully');
    return receipt;
  } catch (error: any) {
    logger.error('Generate receipt exception:', error);
    return null;
  }
}