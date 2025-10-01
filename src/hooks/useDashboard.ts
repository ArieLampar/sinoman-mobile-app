import { useEffect } from 'react';
import { useDashboardStore } from '@store/dashboardStore';

export const useDashboard = () => {
  const {
    balance,
    recentTransactions,
    banners,
    stats,
    isLoading,
    error,
    lastRefresh,
    fetchDashboardData,
    refreshDashboard,
    setBalance,
    setRecentTransactions,
    setBanners,
    setStats,
    setLoading,
    setError,
  } = useDashboardStore();

  // Auto-fetch on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    // State
    balance,
    recentTransactions,
    banners,
    stats,
    isLoading,
    error,
    lastRefresh,

    // Actions
    fetchDashboardData,
    refreshDashboard,

    // Setters
    setBalance,
    setRecentTransactions,
    setBanners,
    setStats,
    setLoading,
    setError,
  };
};
