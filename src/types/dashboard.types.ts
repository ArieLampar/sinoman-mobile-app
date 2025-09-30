import { Balance, Transaction } from './savings.types';

// Dashboard State
export interface DashboardState {
  balance: Balance | null;
  recentTransactions: Transaction[];
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  lastRefresh: Date | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  refreshDashboard: () => Promise<void>;

  // State Setters
  setBalance: (balance: Balance) => void;
  setRecentTransactions: (transactions: Transaction[]) => void;
  setStats: (stats: DashboardStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Dashboard Statistics
export interface DashboardStats {
  totalSavings: number;
  monthlyDeposits: number;
  monthlyWithdrawals: number;
  savingsGrowth: number;
  transactionCount: number;
}

// Quick Actions
export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
  params?: any;
}

// Banner/Promotion
export interface PromotionalBanner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  actionUrl?: string;
  actionLabel?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}