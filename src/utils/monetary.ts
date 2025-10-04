/**
 * Monetary Utilities
 * Handles currency calculations with precision using Decimal.js
 * Prevents floating-point precision errors in financial calculations
 */

import Decimal from 'decimal.js';

// Configure Decimal.js for currency (2 decimal places)
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21,
});

/**
 * Convert rupiah to smallest unit (cents) for storage
 * @param rupiah - Amount in rupiah
 * @returns Amount in cents (integer)
 */
export function rupiahToCents(rupiah: number | string): number {
  const decimal = new Decimal(rupiah);
  return decimal.times(100).toNumber();
}

/**
 * Convert cents to rupiah for display
 * @param cents - Amount in cents
 * @returns Amount in rupiah (with 2 decimal places)
 */
export function centsToRupiah(cents: number | string): number {
  const decimal = new Decimal(cents);
  return decimal.dividedBy(100).toNumber();
}

/**
 * Add two monetary amounts with precision
 * @param a - First amount
 * @param b - Second amount
 * @returns Sum
 */
export function addMoney(a: number | string, b: number | string): number {
  const decimalA = new Decimal(a);
  const decimalB = new Decimal(b);
  return decimalA.plus(decimalB).toNumber();
}

/**
 * Subtract two monetary amounts with precision
 * @param a - First amount
 * @param b - Second amount
 * @returns Difference
 */
export function subtractMoney(a: number | string, b: number | string): number {
  const decimalA = new Decimal(a);
  const decimalB = new Decimal(b);
  return decimalA.minus(decimalB).toNumber();
}

/**
 * Multiply monetary amount with precision
 * @param amount - Amount
 * @param multiplier - Multiplier
 * @returns Product
 */
export function multiplyMoney(amount: number | string, multiplier: number | string): number {
  const decimal = new Decimal(amount);
  const mult = new Decimal(multiplier);
  return decimal.times(mult).toDecimalPlaces(2).toNumber();
}

/**
 * Divide monetary amount with precision
 * @param amount - Amount
 * @param divisor - Divisor
 * @returns Quotient
 */
export function divideMoney(amount: number | string, divisor: number | string): number {
  const decimal = new Decimal(amount);
  const div = new Decimal(divisor);
  return decimal.dividedBy(div).toDecimalPlaces(2).toNumber();
}

/**
 * Calculate percentage of amount
 * @param amount - Base amount
 * @param percentage - Percentage (e.g., 15 for 15%)
 * @returns Calculated percentage amount
 */
export function calculatePercentage(amount: number | string, percentage: number | string): number {
  const decimal = new Decimal(amount);
  const percent = new Decimal(percentage).dividedBy(100);
  return decimal.times(percent).toDecimalPlaces(2).toNumber();
}

/**
 * Calculate tax amount
 * @param subtotal - Subtotal before tax
 * @param taxRate - Tax rate as percentage (e.g., 11 for 11%)
 * @returns Tax amount
 */
export function calculateTax(subtotal: number | string, taxRate: number | string): number {
  return calculatePercentage(subtotal, taxRate);
}

/**
 * Calculate total with tax
 * @param subtotal - Subtotal before tax
 * @param taxRate - Tax rate as percentage
 * @returns Total with tax
 */
export function calculateTotalWithTax(subtotal: number | string, taxRate: number | string): number {
  const sub = new Decimal(subtotal);
  const tax = calculateTax(subtotal, taxRate);
  return sub.plus(tax).toDecimalPlaces(2).toNumber();
}

/**
 * Round to nearest rupiah
 * @param amount - Amount to round
 * @returns Rounded amount
 */
export function roundMoney(amount: number | string): number {
  const decimal = new Decimal(amount);
  return decimal.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
}

/**
 * Format money for display
 * @param amount - Amount to format
 * @param includeSymbol - Whether to include Rp symbol
 * @param useThousandSeparator - Whether to use thousand separator
 * @returns Formatted string
 */
export function formatMoney(
  amount: number | string,
  includeSymbol: boolean = true,
  useThousandSeparator: boolean = true
): string {
  const decimal = new Decimal(amount);
  const rounded = decimal.toDecimalPlaces(2).toNumber();

  let formatted: string;

  if (useThousandSeparator) {
    formatted = rounded.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  } else {
    formatted = rounded.toFixed(2);
  }

  // Remove trailing zeros after decimal
  formatted = formatted.replace(/\.00$/, '');

  return includeSymbol ? `Rp ${formatted}` : formatted;
}

/**
 * Parse money string to number
 * Handles various formats: "Rp 1.000", "1,000.50", "1000"
 * @param moneyString - Money string to parse
 * @returns Parsed number
 */
export function parseMoney(moneyString: string): number {
  // Remove currency symbols and spaces
  let cleaned = moneyString.replace(/Rp|IDR|\s/gi, '').trim();

  // Handle Indonesian format (1.000,50) vs US format (1,000.50)
  // If there's both comma and dot, determine which is decimal separator
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // If dot comes after comma, it's decimal separator (US format)
    if (cleaned.lastIndexOf('.') > cleaned.lastIndexOf(',')) {
      cleaned = cleaned.replace(/,/g, ''); // Remove thousand separators
    } else {
      // If comma comes after dot, comma is decimal separator (ID format)
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
  } else if (cleaned.includes(',')) {
    // Only comma - assume decimal separator
    cleaned = cleaned.replace(',', '.');
  }

  const decimal = new Decimal(cleaned);
  return decimal.toNumber();
}

/**
 * Compare two monetary amounts
 * @param a - First amount
 * @param b - Second amount
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareMoney(a: number | string, b: number | string): number {
  const decimalA = new Decimal(a);
  const decimalB = new Decimal(b);
  return decimalA.comparedTo(decimalB);
}

/**
 * Check if amount is zero
 * @param amount - Amount to check
 * @returns True if zero
 */
export function isZero(amount: number | string): boolean {
  const decimal = new Decimal(amount);
  return decimal.isZero();
}

/**
 * Check if amount is positive
 * @param amount - Amount to check
 * @returns True if positive
 */
export function isPositive(amount: number | string): boolean {
  const decimal = new Decimal(amount);
  return decimal.isPositive();
}

/**
 * Check if amount is negative
 * @param amount - Amount to check
 * @returns True if negative
 */
export function isNegative(amount: number | string): boolean {
  const decimal = new Decimal(amount);
  return decimal.isNegative();
}

/**
 * Calculate sum of array of amounts
 * @param amounts - Array of amounts
 * @returns Total sum
 */
export function sumMoney(amounts: (number | string)[]): number {
  let total = new Decimal(0);

  for (const amount of amounts) {
    total = total.plus(new Decimal(amount));
  }

  return total.toDecimalPlaces(2).toNumber();
}

/**
 * Calculate average of array of amounts
 * @param amounts - Array of amounts
 * @returns Average
 */
export function averageMoney(amounts: (number | string)[]): number {
  if (amounts.length === 0) {
    return 0;
  }

  const total = sumMoney(amounts);
  return divideMoney(total, amounts.length);
}
