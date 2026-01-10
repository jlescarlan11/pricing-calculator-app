/**
 * Formats a number as Philippine currency (PHP).
 * Handles zero values and negative amounts.
 *
 * @param amount - The numerical amount to format.
 * @returns The formatted currency string (e.g., "₱1,000.00").
 */
export const formatCurrency = (amount: number): string => {
  // Handle strict zero or -0
  if (amount === 0) {
    return '₱0.00';
  }

  // Use Intl.NumberFormat for locale-aware formatting
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
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
  return (
    new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value) + '%'
  );
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

/**
 * Formats a Date object as a relative time string (e.g., "2 days ago", "just now").
 *
 * @param date - The Date object or timestamp to format.
 * @returns A user-friendly relative time string.
 */
export const formatTimeAgo = (date: Date | number | string): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'unknown';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
};

/**
 * Returns a color token name based on profit margin thresholds.
 *
 * Thresholds:
 * - Below 15%: 'rust' (Red)
 * - 15% to 25%: 'sakura' (Soft Pink/Warning)
 * - Above 25%: 'moss' (Green)
 *
 * @param margin - The profit margin percentage.
 * @returns The color token name.
 */
export const getMarginColor = (margin: number): string => {
  if (margin < 15) return 'rust';
  if (margin <= 25) return 'sakura';
  return 'moss';
};
