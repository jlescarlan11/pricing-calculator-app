import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { checkRateLimit, incrementUsage, ANALYSIS_LIMIT_KEY, DAILY_LIMIT } from './analysisRateLimit';

describe('analysisRateLimit', () => {
  const mockToday = '2026-01-08';
  const mockNow = new Date('2026-01-08T12:00:00Z');

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('checkRateLimit', () => {
    it('should allow if no data in localStorage', () => {
      const result = checkRateLimit();
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(DAILY_LIMIT);
    });

    it('should reset if lastReset is a different day', () => {
      localStorage.setItem(ANALYSIS_LIMIT_KEY, JSON.stringify({
        count: DAILY_LIMIT,
        lastReset: '2026-01-07'
      }));

      const result = checkRateLimit();
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(DAILY_LIMIT);
    });

    it('should deny if limit reached today', () => {
      localStorage.setItem(ANALYSIS_LIMIT_KEY, JSON.stringify({
        count: DAILY_LIMIT,
        lastReset: mockToday
      }));

      const result = checkRateLimit();
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should return remaining count correctly', () => {
      localStorage.setItem(ANALYSIS_LIMIT_KEY, JSON.stringify({
        count: 2,
        lastReset: mockToday
      }));

      const result = checkRateLimit();
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(DAILY_LIMIT - 2);
    });
  });

  describe('incrementUsage', () => {
    it('should initialize usage if first time', () => {
      incrementUsage();
      const stored = JSON.parse(localStorage.getItem(ANALYSIS_LIMIT_KEY) || '{}');
      expect(stored.count).toBe(1);
      expect(stored.lastReset).toBe(mockToday);
    });

    it('should increment existing usage for today', () => {
      localStorage.setItem(ANALYSIS_LIMIT_KEY, JSON.stringify({
        count: 2,
        lastReset: mockToday
      }));

      incrementUsage();
      const stored = JSON.parse(localStorage.getItem(ANALYSIS_LIMIT_KEY) || '{}');
      expect(stored.count).toBe(3);
    });

    it('should reset and increment if last usage was yesterday', () => {
      localStorage.setItem(ANALYSIS_LIMIT_KEY, JSON.stringify({
        count: 5,
        lastReset: '2026-01-07'
      }));

      incrementUsage();
      const stored = JSON.parse(localStorage.getItem(ANALYSIS_LIMIT_KEY) || '{}');
      expect(stored.count).toBe(1);
      expect(stored.lastReset).toBe(mockToday);
    });
  });

  describe('Persistence & Restoration Edge Cases', () => {
    it('restores rate-limit state correctly after a "reload" (simulated by re-running checkRateLimit with existing localStorage)', () => {
      // 1. First "session" - use up some limit
      incrementUsage();
      incrementUsage();
      
      const firstSessionResult = checkRateLimit();
      expect(firstSessionResult.count).toBeUndefined(); // count isn't returned, but remaining is
      expect(firstSessionResult.remaining).toBe(DAILY_LIMIT - 2);

      // 2. Simulate "reload" - In reality, localStorage persists.
      // We just call checkRateLimit again, it should pick up where it left off.
      const secondSessionResult = checkRateLimit();
      expect(secondSessionResult.remaining).toBe(DAILY_LIMIT - 2);
      expect(secondSessionResult.allowed).toBe(true);
    });

    it('handles malformed localStorage data gracefully by resetting', () => {
      localStorage.setItem(ANALYSIS_LIMIT_KEY, 'invalid-json');
      
      // Should not throw and should return default (allowed)
      const result = checkRateLimit();
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(DAILY_LIMIT);
    });
  });
});
