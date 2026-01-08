import { describe, it, expect } from 'vitest';
import { compareTotals, ComparisonInput } from './presetComparison';

describe('compareTotals', () => {
  it('calculates deltas correctly for positive changes', () => {
    const previous: ComparisonInput = {
      totalCost: 100,
      suggestedPrice: 150,
      profitMargin: 33.33,
    };

    const current: ComparisonInput = {
      totalCost: 120,
      suggestedPrice: 180,
      profitMargin: 35.0,
    };

    const result = compareTotals(current, previous);

    expect(result.totalCost).toBe(20);
    expect(result.suggestedPrice).toBe(30);
    expect(result.profitMargin).toBeCloseTo(1.67, 2);
  });

  it('calculates deltas correctly for negative changes', () => {
    const previous: ComparisonInput = {
      totalCost: 100,
      suggestedPrice: 150,
      profitMargin: 33.33,
    };

    const current: ComparisonInput = {
      totalCost: 90,
      suggestedPrice: 140,
      profitMargin: 30.0,
    };

    const result = compareTotals(current, previous);

    expect(result.totalCost).toBe(-10);
    expect(result.suggestedPrice).toBe(-10);
    expect(result.profitMargin).toBeCloseTo(-3.33, 2);
  });

  it('returns zero deltas when inputs are identical', () => {
    const data: ComparisonInput = {
      totalCost: 100,
      suggestedPrice: 150,
      profitMargin: 33.33,
    };

    const result = compareTotals(data, data);

    expect(result.totalCost).toBe(0);
    expect(result.suggestedPrice).toBe(0);
    expect(result.profitMargin).toBe(0);
  });

  it('handles zero values correctly', () => {
    const previous: ComparisonInput = {
      totalCost: 0,
      suggestedPrice: 0,
      profitMargin: 0,
    };

    const current: ComparisonInput = {
      totalCost: 10,
      suggestedPrice: 20,
      profitMargin: 50,
    };

    const result = compareTotals(current, previous);

    expect(result.totalCost).toBe(10);
    expect(result.suggestedPrice).toBe(20);
    expect(result.profitMargin).toBe(50);
  });
});
