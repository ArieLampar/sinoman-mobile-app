// Savings Types
export enum SavingsType {
  POKOK = 'pokok',
  WAJIB = 'wajib',
  SUKARELA = 'sukarela',
}

export interface Balance {
  pokok: number;
  wajib: number;
  sukarela: number;
  total: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  savingsType: SavingsType;
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
  status: 'pending' | 'success' | 'failed';
  referenceId?: string;
}

export interface TopUpRequest {
  savingsType: SavingsType;
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface TopUpResponse {
  transactionId: string;
  status: 'pending' | 'success' | 'failed';
  balance: Balance;
  paymentUrl?: string;
}

export interface WithdrawalRequest {
  savingsType: SavingsType;
  amount: number;
  bankAccount?: BankAccount;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  VIRTUAL_ACCOUNT = 'virtual_account',
  E_WALLET = 'e_wallet',
  CREDIT_CARD = 'credit_card',
}

export interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon: string;
  enabled: boolean;
  fee?: number;
}

export interface SavingsStats {
  totalDeposits: number;
  totalWithdrawals: number;
  monthlyGrowth: number;
  transactionCount: number;
}

export interface TransactionReceipt {
  transactionId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  savingsType: SavingsType;
  amount: number;
  fee: number;
  totalAmount: number;
  paymentMethod?: PaymentMethod;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
  referenceId?: string;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
}

export interface MonthlyChartData {
  labels: string[]; // ['Jan', 'Feb', 'Mar']
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

// Savings Store State
export interface SavingsState {
  balance: Balance | null;
  transactions: Transaction[];
  chartData: MonthlyChartData | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;

  // Actions
  fetchBalance: () => Promise<void>;
  fetchTransactions: (page?: number) => Promise<void>;
  fetchChartData: (savingsType?: SavingsType) => Promise<void>;
  topUp: (request: TopUpRequest) => Promise<TopUpResponse>;
  withdraw: (request: WithdrawalRequest) => Promise<void>;
  generateReceipt: (transactionId: string) => Promise<TransactionReceipt | null>;
  refreshData: () => Promise<void>;

  // State Setters
  setBalance: (balance: Balance) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setChartData: (chartData: MonthlyChartData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}