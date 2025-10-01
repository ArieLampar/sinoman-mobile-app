import { PromotionalBanner } from '@types';
import { logger } from '@utils/logger';
// import { supabase } from '@services/supabase'; // For future real API

const MOCK_BANNERS: PromotionalBanner[] = [
  {
    id: '1',
    title: 'Promo Simpanan Sukarela',
    description: 'Dapatkan bunga 8% per tahun untuk simpanan sukarela',
    imageUrl: 'https://via.placeholder.com/800x400/059669/FFFFFF?text=Promo+Simpanan',
    actionUrl: '/savings',
    actionLabel: 'Mulai Menabung',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    isActive: true,
  },
  {
    id: '2',
    title: 'Fit Challenge 2025',
    description: 'Ikuti program kesehatan 8 minggu dan menangkan hadiah',
    imageUrl: 'https://via.placeholder.com/800x400/F59E0B/FFFFFF?text=Fit+Challenge',
    actionUrl: '/fit-challenge',
    actionLabel: 'Daftar Sekarang',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
    isActive: true,
  },
  {
    id: '3',
    title: 'Belanja Hemat di Marketplace',
    description: 'Diskon hingga 30% untuk produk pilihan',
    imageUrl: 'https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Marketplace+Promo',
    actionUrl: '/marketplace',
    actionLabel: 'Belanja Sekarang',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
    isActive: true,
  },
];

export async function fetchBanners(): Promise<PromotionalBanner[]> {
  try {
    logger.info('Fetching promotional banners');

    // TODO: Replace with real Supabase query when backend is ready
    // const { data, error } = await supabase
    //   .from('promotional_banners')
    //   .select('*')
    //   .eq('is_active', true)
    //   .gte('end_date', new Date().toISOString())
    //   .order('created_at', { ascending: false });
    //
    // if (error) {
    //   logger.error('Fetch banners error:', error.message);
    //   return [];
    // }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter active banners
    const now = new Date();
    const activeBanners = MOCK_BANNERS.filter(banner => {
      const endDate = new Date(banner.endDate);
      return banner.isActive && endDate > now;
    });

    logger.info('Banners fetched successfully:', activeBanners.length);
    return activeBanners;
  } catch (error: any) {
    logger.error('Fetch banners exception:', error);
    return [];
  }
}

export { fetchBanners };
