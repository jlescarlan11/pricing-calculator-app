import { describe, it, expect } from 'vitest';
import { calculateRiskScore, generateStaticRecommendations } from './aiAnalysis';
import { PROFIT_MARGIN_THRESHOLDS } from '../constants/app';

describe('aiAnalysis', () => {
  describe('calculateRiskScore', () => {
    it('should return "high" for margins below the low threshold', () => {
      const result = calculateRiskScore(PROFIT_MARGIN_THRESHOLDS.LOW - 0.1);
      expect(result).toBe('high');
    });

    it('should return "medium" for margins equal to the low threshold', () => {
      const result = calculateRiskScore(PROFIT_MARGIN_THRESHOLDS.LOW);
      expect(result).toBe('medium');
    });

    it('should return "medium" for margins between low and good thresholds', () => {
      const midPoint = (PROFIT_MARGIN_THRESHOLDS.LOW + PROFIT_MARGIN_THRESHOLDS.GOOD) / 2;
      const result = calculateRiskScore(midPoint);
      expect(result).toBe('medium');
    });

    it('should return "medium" for margins equal to the good threshold', () => {
      const result = calculateRiskScore(PROFIT_MARGIN_THRESHOLDS.GOOD);
      expect(result).toBe('medium');
    });

    it('should return "low" for margins above the good threshold', () => {
      const result = calculateRiskScore(PROFIT_MARGIN_THRESHOLDS.GOOD + 0.1);
      expect(result).toBe('low');
    });

    it('should return "high" for zero margin', () => {
      expect(calculateRiskScore(0)).toBe('high');
    });

    it('should return "high" for negative margin', () => {
      expect(calculateRiskScore(-5)).toBe('high');
    });
  });

  describe('generateStaticRecommendations', () => {
    it('should return high risk recommendations', () => {
      const recommendations = generateStaticRecommendations(10, 'high');
      expect(recommendations).toHaveLength(3);
      expect(recommendations[0]).toContain('At 10.0%, consider raising your selling price');
    });

    it('should return medium risk recommendations', () => {
      const recommendations = generateStaticRecommendations(20, 'medium');
      expect(recommendations).toHaveLength(3);
      expect(recommendations[0]).toContain('Your margin of 20.0% is healthy');
    });

    it('should return low risk recommendations', () => {
      const recommendations = generateStaticRecommendations(30, 'low');
      expect(recommendations).toHaveLength(3);
      expect(recommendations[0]).toContain('Excellent margin (30.0%)!');
    });

    it('should return empty array for invalid risk score (if type safety is bypassed)', () => {
      // @ts-expect-error Testing invalid input
      const recommendations = generateStaticRecommendations(30, 'unknown');
      expect(recommendations).toEqual([]);
    });
  });
});
