/**
 * Format phone number to Indonesian format with +62 prefix
 * @param phone - Phone number (e.g., "81234567890")
 * @returns Formatted phone number (e.g., "+62 812-3456-7890")
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Remove leading 0 if present
  const withoutLeadingZero = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned;

  // Format as +62 XXX-XXXX-XXXX
  if (withoutLeadingZero.length >= 10) {
    const match = withoutLeadingZero.match(/^(\d{3})(\d{4})(\d{4,})$/);
    if (match) {
      return `+62 ${match[1]}-${match[2]}-${match[3]}`;
    }
  }

  return `+62 ${withoutLeadingZero}`;
}

/**
 * Mask phone number for display (show only first 3 and last 3 digits)
 * @param phone - Phone number (e.g., "81234567890")
 * @returns Masked phone number (e.g., "+62 812****890")
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');
  const withoutLeadingZero = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned;

  if (withoutLeadingZero.length >= 6) {
    const first = withoutLeadingZero.substring(0, 3);
    const last = withoutLeadingZero.substring(withoutLeadingZero.length - 3);
    const masked = '*'.repeat(withoutLeadingZero.length - 6);
    return `+62 ${first}${masked}${last}`;
  }

  return `+62 ${withoutLeadingZero}`;
}

/**
 * Format phone number for Supabase (with +62 prefix, no formatting)
 * @param phone - Phone number (e.g., "81234567890")
 * @returns Formatted phone (e.g., "+6281234567890")
 */
export function formatPhoneForSupabase(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Remove leading 0 if present
  const withoutLeadingZero = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned;

  return `+62${withoutLeadingZero}`;
}

/**
 * Format currency to Indonesian Rupiah
 * @param amount - Amount in rupiah
 * @returns Formatted currency (e.g., "Rp 1.000.000")
 */
export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Rp 0';

  return `Rp ${amount.toLocaleString('id-ID')}`;
}

/**
 * Format date to Indonesian format (DD/MM/YYYY)
 * @param date - Date string or Date object
 * @returns Formatted date (e.g., "25/01/2025")
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format date and time
 * @param date - Date string or Date object
 * @returns Formatted date time (e.g., "25/01/2025 14:30")
 */
export function formatDateTime(date: string | Date): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '';

  const dateStr = formatDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Format time remaining (for countdown)
 * @param seconds - Seconds remaining
 * @returns Formatted time (e.g., "04:32")
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '00:00';

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}