import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MarketPositionSpectrum } from './MarketPositionSpectrum';
import { calculateMarketPosition, type MarketPositionResult } from '../../utils/calculations';

describe('Competitor Positioning Edge Cases', () => {
  const currentPrice = 100;

  describe('calculateMarketPosition logic boundaries', () => {
    it('handles 0 competitors', () => {
      const result = calculateMarketPosition(currentPrice, []);
      expect(result).toEqual({ error: 'NEEDS_TWO_COMPETITORS' });
    });

    it('handles 1 competitor', () => {
      const result = calculateMarketPosition(currentPrice, [{ competitorPrice: 150 }]);
      expect(result).toEqual({ error: 'NEEDS_TWO_COMPETITORS' });
    });

    it('handles 2 competitors (minimum for range)', () => {
      const result = calculateMarketPosition(currentPrice, [
        { competitorPrice: 80 },
        { competitorPrice: 120 }
      ]) as MarketPositionResult;
      expect(result.minPrice).toBe(80);
      expect(result.maxPrice).toBe(120);
      expect(result.percentile).toBe(50); // (100-80)/(120-80) = 20/40 = 0.5
      expect(result.position).toBe('mid');
    });

    it('handles 5 competitors (maximum allowed)', () => {
      const result = calculateMarketPosition(currentPrice, [
        { competitorPrice: 120 },
        { competitorPrice: 80 },
        { competitorPrice: 90 },
        { competitorPrice: 110 },
        { competitorPrice: 100 }
      ]) as MarketPositionResult;
      
      // Sorted: 80, 90, 100, 110, 120
      expect(result.minPrice).toBe(80);
      expect(result.maxPrice).toBe(120);
      expect(result.avgPrice).toBe(100);
      expect(result.percentile).toBe(50);
    });

    it('handles price exactly at minimum', () => {
      const result = calculateMarketPosition(80, [
        { competitorPrice: 80 },
        { competitorPrice: 120 }
      ]) as MarketPositionResult;
      expect(result.percentile).toBe(0);
      expect(result.position).toBe('budget');
    });

    it('handles price exactly at maximum', () => {
      const result = calculateMarketPosition(120, [
        { competitorPrice: 80 },
        { competitorPrice: 120 }
      ]) as MarketPositionResult;
      expect(result.percentile).toBe(100);
      expect(result.position).toBe('premium');
    });
    
    it('handles price outside range (below)', () => {
      const result = calculateMarketPosition(50, [
        { competitorPrice: 80 },
        { competitorPrice: 120 }
      ]) as MarketPositionResult;
      expect(result.percentile).toBe(0);
    });

    it('handles price outside range (above)', () => {
      const result = calculateMarketPosition(200, [
        { competitorPrice: 80 },
        { competitorPrice: 120 }
      ]) as MarketPositionResult;
      expect(result.percentile).toBe(100);
    });
  });

  describe('MarketPositionSpectrum UI boundaries', () => {
    it('renders correctly at 0%', () => {
      render(<MarketPositionSpectrum percentile={0} />);
      const you = screen.getByText('You');
      const container = you.closest('div')?.parentElement;
      expect(container?.style.left).toBe('0%');
    });

    it('renders correctly at 100%', () => {
      render(<MarketPositionSpectrum percentile={100} />);
      const you = screen.getByText('You');
      const container = you.closest('div')?.parentElement;
      expect(container?.style.left).toBe('100%');
    });

    it('renders correctly at 50%', () => {
      render(<MarketPositionSpectrum percentile={50} />);
      const you = screen.getByText('You');
      const container = you.closest('div')?.parentElement;
      expect(container?.style.left).toBe('50%');
    });

    it('does not crash with null percentile', () => {
      render(<MarketPositionSpectrum percentile={null as unknown as number} />);
      expect(screen.queryByText('You')).toBeNull();
    });
  });
});
