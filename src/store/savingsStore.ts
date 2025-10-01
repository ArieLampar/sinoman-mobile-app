import { create } from 'zustand';
import { SavingsState, Balance, Transaction, TopUpRequest, WithdrawalRequest, SavingsType } from '@types';
import {
  fetchBalance as fetchBalanceService,
  fetchTransactions as fetchTransactionsService,
  fetchChartData as fetchChartDataService,
  topUp as topUpService,
  withdraw as withdrawService,
  generateReceipt as generateReceiptService,
} from '@services/savings';
import { logger } from '@utils/logger';

export const useSavingsStore = create<SavingsState>((set, get) => ({
  // Initial State
  balance: null,
  transactions: [],
  chartData: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  hasMore: true,

  // Actions
  fetchBalance: async () => {
    try {
      set({ isLoading: true, error: null });

      const balance = await fetchBalanceService();

      if (balance) {
        set({ balance, isLoading: false });
      } else {
        set({ error: 'Gagal memuat saldo', isLoading: false });
      }
    } catch (error: any) {
      logger.error('Fetch balance error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  fetchTransactions: async (page = 1) => {
    try {
      const { currentPage } = get();

      // If page is 1, reset transactions (refresh)
      if (page === 1) {
        set({ isLoading: true, error: null, transactions: [], currentPage: 1 });
      } else {
        set({ isLoading: true, error: null });
      }

      const result = await fetchTransactionsService(page, 20);

      const { data, pagination } = result;

      if (page === 1) {
        // Replace transactions
        set({
          transactions: data,
          currentPage: page,
          hasMore: pagination.page < pagination.totalPages,
          isLoading: false,
        });
      } else {
        // Append transactions
        const existingTransactions = get().transactions;
        set({
          transactions: [...existingTransactions, ...data],
          currentPage: page,
          hasMore: pagination.page < pagination.totalPages,
          isLoading: false,
        });
      }

      logger.info('Transactions fetched:', data.length);
    } catch (error: any) {
      logger.error('Fetch transactions error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  topUp: async (request: TopUpRequest) => {
    try {
      set({ isLoading: true, error: null });

      const response = await topUpService(request);

      // Update balance
      set({ balance: response.balance, isLoading: false });

      // Refresh transactions
      get().fetchTransactions(1);

      logger.info('Top up successful');
      return response;
    } catch (error: any) {
      logger.error('Top up error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  withdraw: async (request: WithdrawalRequest) => {
    try {
      set({ isLoading: true, error: null });

      await withdrawService(request);

      // Refresh balance and transactions
      await get().fetchBalance();
      await get().fetchTransactions(1);

      set({ isLoading: false });
      logger.info('Withdrawal successful');
    } catch (error: any) {
      logger.error('Withdrawal error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchChartData: async (savingsType?: SavingsType) => {
    try {
      set({ isLoading: true, error: null });

      const chartData = await fetchChartDataService(savingsType, 6);

      set({ chartData, isLoading: false });
      logger.info('Chart data fetched successfully');
    } catch (error: any) {
      logger.error('Fetch chart data error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  generateReceipt: async (transactionId: string) => {
    try {
      const receipt = await generateReceiptService(transactionId);
      logger.info('Receipt generated successfully');
      return receipt;
    } catch (error: any) {
      logger.error('Generate receipt error:', error);
      return null;
    }
  },

  refreshData: async () => {
    try {
      await Promise.all([
        get().fetchBalance(),
        get().fetchTransactions(1),
        get().fetchChartData(),
      ]);
    } catch (error: any) {
      logger.error('Refresh data error:', error);
    }
  },

  // State Setters
  setBalance: (balance: Balance) => set({ balance }),
  setTransactions: (transactions: Transaction[]) => set({ transactions }),
  setChartData: (chartData) => set({ chartData }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
}));