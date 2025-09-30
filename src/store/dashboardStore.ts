import { create } from 'zustand';
import { DashboardState, DashboardStats, Balance, Transaction } from '@types';
import { fetchBalance, fetchTransactions } from '@services/savings';
import { logger } from '@utils/logger';

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial State
  balance: null,
  recentTransactions: [],
  stats: null,
  isLoading: false,
  error: null,
  lastRefresh: null,

  // Actions
  fetchDashboardData: async () => {
    try {
      set({ isLoading: true, error: null });

      // Fetch balance and recent transactions in parallel
      const [balance, transactionsResult] = await Promise.all([
        fetchBalance(),
        fetchTransactions(1, 5), // Get only 5 recent transactions
      ]);

      // Calculate stats
      const stats: DashboardStats = {
        totalSavings: balance?.total || 0,
        monthlyDeposits: 0, // Will calculate from transactions
        monthlyWithdrawals: 0, // Will calculate from transactions
        savingsGrowth: 0, // Will calculate growth percentage
        transactionCount: transactionsResult.pagination.total,
      };

      // Calculate monthly deposits and withdrawals
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      transactionsResult.data.forEach((transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        if (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        ) {
          if (transaction.type === 'deposit') {
            stats.monthlyDeposits += transaction.amount;
          } else if (transaction.type === 'withdrawal') {
            stats.monthlyWithdrawals += transaction.amount;
          }
        }
      });

      set({
        balance,
        recentTransactions: transactionsResult.data,
        stats,
        isLoading: false,
        lastRefresh: new Date(),
      });

      logger.info('Dashboard data fetched successfully');
    } catch (error: any) {
      logger.error('Fetch dashboard data error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  refreshDashboard: async () => {
    await get().fetchDashboardData();
  },

  // State Setters
  setBalance: (balance: Balance) => set({ balance }),
  setRecentTransactions: (recentTransactions: Transaction[]) => set({ recentTransactions }),
  setStats: (stats: DashboardStats) => set({ stats }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
}));