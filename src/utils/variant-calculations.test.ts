import { describe, it, expect } from 'vitest';
import {
  calculateBaseCostShare,
  calculateVariantCosts,
  calculateAllVariants,
  getTotalBatchProfit,
  roundCurrency
} from './variant-calculations';
import type { VariantInput } from '../types/variants';
import type { Ingredient } from '../types/calculator';

describe('Variant Calculations', () => {
  // Test Data Setup
  const baseIngredients: Ingredient[] = [
    { id: '1', name: 'Flour', amount: 1000, cost: 50 },
    { id: '2', name: 'Sugar', amount: 500, cost: 20 },
  ]; // Total Base Ingredients = 70
  const baseLabor = 20;
  const baseOverhead = 10;
  // Total Base Cost = 70 + 20 + 10 = 100
  const batchSize = 10; // e.g., 10kg dough

  const variantA: VariantInput = {
    id: 'v1',
    name: 'Small',
    amount: 1, // 1kg
    unit: 'kg',
    additionalIngredients: [{ id: '3', name: 'Box', amount: 1, cost: 2 }],
    additionalLabor: 3,
    pricingStrategy: 'markup',
    pricingValue: 50, // 50% markup
    currentSellingPrice: null
  };

  const variantB: VariantInput = {
    id: 'v2',
    name: 'Large',
    amount: 2, // 2kg
    unit: 'kg',
    additionalIngredients: [],
    additionalLabor: 0,
    pricingStrategy: 'margin',
    pricingValue: 20, // 20% margin
    currentSellingPrice: null
  };

  describe('roundCurrency', () => {
    it('rounds to 2 decimal places', () => {
      expect(roundCurrency(10.123)).toBe(10.12);
      expect(roundCurrency(10.125)).toBe(10.13); // Round half up
      expect(roundCurrency(10)).toBe(10);
    });
  });

  describe('calculateBaseCostShare', () => {
    it('calculates proportional share correctly', () => {
      // Total Base Cost = 100, Batch Size = 10, Variant Amount = 1
      // Cost Per Unit (Base) = 100 / 10 = 10
      // Share = 10 * 1 = 10
      expect(calculateBaseCostShare(100, 10, 1)).toBe(10);
    });

    it('calculates proportional share for larger variant', () => {
      // Share = (100 / 10) * 2 = 20
      expect(calculateBaseCostShare(100, 10, 2)).toBe(20);
    });

    it('handles decimal amounts', () => {
      // Amount 0.5 -> Share = 5
      expect(calculateBaseCostShare(100, 10, 0.5)).toBe(5);
    });

    it('returns 0 if batch size is 0', () => {
      expect(calculateBaseCostShare(100, 0, 1)).toBe(0);
    });
  });

  describe('calculateVariantCosts', () => {
    it('calculates costs and price for Variant A (Markup)', () => {
      const result = calculateVariantCosts(
        variantA,
        baseIngredients,
        baseLabor,
        baseOverhead,
        batchSize
      );

      // Base Cost Share: (100 / 10) * 1 = 10
      // Additional Cost: 2 (ing) + 3 (labor) = 5
      // Total Cost Per Unit: 15
      
      expect(result.totalCost).toBe(15);
      expect(result.costPerUnit).toBe(15);

      // Pricing (Markup 50%): 15 * 1.5 = 22.5
      expect(result.recommendedPrice).toBe(22.5);
      
      // Profit Per Unit: 22.5 - 15 = 7.5
      expect(result.profitPerUnit).toBe(7.5);

      // Profit Margin: (7.5 / 22.5) * 100 = 33.33%
      expect(result.profitMarginPercent).toBe(33.33);

      // Breakdown
      // Base Ingredients Share: (70 / 10) * 1 = 7
      // Total Ingredients: 7 + 2 = 9
      expect(result.breakdown.ingredients).toBe(9);
      
      // Base Labor Share: (20 / 10) * 1 = 2
      // Total Labor: 2 + 3 = 5
      expect(result.breakdown.labor).toBe(5);

      // Base Overhead Share: (10 / 10) * 1 = 1
      expect(result.breakdown.overhead).toBe(1);
    });

    it('calculates costs and price for Variant B (Margin)', () => {
      const result = calculateVariantCosts(
        variantB,
        baseIngredients,
        baseLabor,
        baseOverhead,
        batchSize
      );

      // Base Cost Share: (100 / 10) * 2 = 20
      // Additional: 0
      // Total Cost Per Unit: 20
      expect(result.costPerUnit).toBe(20);

      // Pricing (Margin 20%): 20 / (1 - 0.2) = 20 / 0.8 = 25
      expect(result.recommendedPrice).toBe(25);

      // Profit Per Unit: 25 - 20 = 5
      expect(result.profitPerUnit).toBe(5);
    });
  });

  describe('calculateAllVariants', () => {
    it('processes multiple variants', () => {
      const results = calculateAllVariants(
        [variantA, variantB],
        baseIngredients,
        baseLabor,
        baseOverhead,
        batchSize
      );

      expect(results).toHaveLength(2);
      expect(results[0].variantId).toBe('v1');
      expect(results[1].variantId).toBe('v2');
      expect(results[0].recommendedPrice).toBe(22.5);
      expect(results[1].recommendedPrice).toBe(25);
    });
  });

  describe('getTotalBatchProfit', () => {
    it('sums profitPerBatch for all variants', () => {
      // Variant A Profit Per Unit: 7.5
      // Batch Size = 10. Variant A Amount = 1. Max A from Batch = 10.
      // Variant A Profit Per Batch = 7.5 * 10 = 75.

      // Variant B Profit Per Unit: 5
      // Variant B Amount = 2. Max B from Batch = 5.
      // Variant B Profit Per Batch = 5 * 5 = 25.

      // Note: calculateVariantCosts needs to populate profitPerBatch logic.
      // logic: profitPerUnit * (batchSize / variantAmount)

      const results = calculateAllVariants(
        [variantA, variantB],
        baseIngredients,
        baseLabor,
        baseOverhead,
        batchSize
      );

      // Expected Sum: 75 + 25 = 100
      expect(getTotalBatchProfit(results)).toBe(100);
    });
  });
});
