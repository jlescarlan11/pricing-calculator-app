import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercent,
  formatDate,
  truncateText,
  formatNumber,
  getMarginColor,
} from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers correctly', () => {
      expect(formatCurrency(100)).toBe('₱100.00');
      expect(formatCurrency(1234.56)).toBe('₱1,234.56');
    });

    it('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('₱0.00');
      expect(formatCurrency(-0)).toBe('₱0.00');
    });

    it('formats negative numbers correctly', () => {
      // Depending on locale implementation, it might be -₱100.00 or ₱-100.00.
      // en-PH usually puts the negative sign before the symbol or uses parenthesis.
      // Let's check what Intl returns in this environment.
      // Standard en-PH often returns -₱1,000.00
      const formatted = formatCurrency(-1000);
      expect(formatted).toContain('₱');
      expect(formatted).toContain('1,000.00');
      // Ideally check for negative sign presence
      expect(formatted).toMatch(/-₱|₱-|-\s₱/);
    });

    it('handles large numbers', () => {
      expect(formatCurrency(1000000)).toBe('₱1,000,000.00');
    });
  });

  describe('formatPercent', () => {
    it('formats numbers as percentages', () => {
      expect(formatPercent(15)).toBe('15.00%');
      expect(formatPercent(50.5)).toBe('50.50%');
    });

    it('respects decimal places', () => {
      expect(formatPercent(10.123, 1)).toBe('10.1%');
      expect(formatPercent(10.123, 3)).toBe('10.123%');
      expect(formatPercent(100, 0)).toBe('100%');
    });

    it('handles zero and negative values', () => {
      expect(formatPercent(0)).toBe('0.00%');
      expect(formatPercent(-5.5)).toBe('-5.50%');
    });
  });

  describe('formatDate', () => {
    it('formats Date objects correctly', () => {
      const date = new Date('2026-01-03T10:00:00');
      // Expect "Jan 03, 2026"
      expect(formatDate(date)).toMatch(/Jan 0?3, 2026/);
    });

    it('formats timestamps correctly', () => {
      const date = new Date('2026-01-03T10:00:00').getTime();
      expect(formatDate(date)).toMatch(/Jan 0?3, 2026/);
    });

    it('formats date strings correctly', () => {
      expect(formatDate('2026-01-03')).toMatch(/Jan 0?3, 2026/);
    });

    it('handles invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date');
    });
  });

  describe('truncateText', () => {
    it('truncates text exceeding maxLength', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...');
    });

    it('returns original text if within maxLength', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
      expect(truncateText('Hello', 5)).toBe('Hello');
    });

    it('handles empty strings', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('respects decimal places', () => {
      expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
      expect(formatNumber(1234.5678, 0)).toBe('1,235'); // Rounds
    });

    it('handles zero', () => {
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('getMarginColor', () => {
    it('should return rust for margin < 15', () => {
      expect(getMarginColor(10)).toBe('rust');
      expect(getMarginColor(14.9)).toBe('rust');
      expect(getMarginColor(-5)).toBe('rust');
    });

    it('should return sakura for margin between 15 and 25', () => {
      expect(getMarginColor(15)).toBe('sakura');
      expect(getMarginColor(20)).toBe('sakura');
      expect(getMarginColor(25)).toBe('sakura');
    });

    it('should return moss for margin > 25', () => {
      expect(getMarginColor(25.1)).toBe('moss');
      expect(getMarginColor(30)).toBe('moss');
      expect(getMarginColor(100)).toBe('moss');
    });
  });
});
