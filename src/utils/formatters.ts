/**
 * Formats a number as currency.
 * Handles zero values and negative amounts.
 * 
 * @param amount - The numerical amount to format.
 * @param currency - The currency code (e.g., 'PHP'). Defaults to 'PHP'.
 * @returns The formatted currency string.
 */
export const formatCurrency = (amount: number, currency: string = 'PHP'): string => {
  // Map common symbols to codes if needed, though Intl works best with codes
  const code = currency === '₱' ? 'PHP' : currency;

  // Handle strict zero or -0
  if (amount === 0) {
    const symbol = code === 'PHP' ? '₱' : (code === 'USD' ? '$' : '');
    return `${symbol}0.00`;
  }

  try {
    // Use Intl.NumberFormat for locale-aware formatting
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    // Fallback if currency code is invalid
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
};

/**
 * Formats a number as a percentage string.
 * Assumes the value is already a percentage (e.g., 15 for 15%).
 * 
 * @param value - The percentage value (e.g., 50 for 50%).
 * @param decimals - The number of decimal places to show (default 2).
 * @returns The formatted percentage string (e.g., "50.00%").
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
  if (isNaN(value)) return '0%';
  
  // Use Intl.NumberFormat for consistent decimal handling
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value) + '%';
};

/**
 * Formats a Date object into a user-friendly string (e.g., "Jan 03, 2026").
 * 
 * @param date - The Date object or timestamp to format.
 * @returns The formatted date string.
 */
export const formatDate = (date: Date | number | string): string => {
  const d = new Date(date);
  
  // Check for invalid date
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(d);
};

/**
 * Truncates a string to a maximum length and appends an ellipsis if truncated.
 * 
 * @param text - The text to truncate.
 * @param maxLength - The maximum allowed length.
 * @returns The truncated string.
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Formats a number with comma separators and specified decimal places.
 * 
 * @param num - The number to format.
 * @param decimals - The number of decimal places (default 0).
 * @returns The formatted number string.
 */
export const formatNumber = (num: number, decimals: number = 0): string => {
  if (isNaN(num)) return '0';

  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};
