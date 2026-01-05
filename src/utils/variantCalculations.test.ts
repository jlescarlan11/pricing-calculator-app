import { describe, it, expect } from 'vitest';
import { calculateProportionalCosts, performVariantCalculation } from './variantCalculations';
import type { CalculationInput, Variant } from '../types/calculator';

describe('variantCalculations', () => {
  describe('calculateProportionalCosts', () => {
    it('should correctly calculate proportional cost', () => {
      // Base Total: 100, Base Batch: 10, Variant Batch: 5 -> (100/10)*5 = 50
      expect(calculateProportionalCosts(100, 10, 5)).toBe(50);
    });

    it('should return 0 if base batch size is 0', () => {
      expect(calculateProportionalCosts(100, 0, 5)).toBe(0);
    });

    it('should return 0 if variant batch size is 0', () => {
      expect(calculateProportionalCosts(100, 10, 0)).toBe(0);
    });

    it('should handle decimal results and round to 2 places', () => {
      // (100/3) * 1 = 33.333... -> 33.33
      expect(calculateProportionalCosts(100, 3, 1)).toBe(33.33);
    });
  });

  describe('performVariantCalculation', () => {
    const mockBaseInput: CalculationInput = {
      productName: 'Base Cookie Dough',
      batchSize: 10, // 10kg total dough
      ingredients: [
        { id: '1', name: 'Flour', amount: 5000, cost: 50 },
        { id: '2', name: 'Sugar', amount: 3000, cost: 30 }
      ], // Total Base Ingredients: 80
      laborCost: 20,
      overhead: 10,
      // Base Total Cost: 80 + 20 + 10 = 110
      hasVariants: true,
      variants: []
    };

    const mockVariant1: Variant = {
      id: 'v1',
      name: 'Choco Chip',
      batchSize: 5, // 50% of base
      ingredients: [
        { id: 'v1-1', name: 'Chocolate Chips', amount: 500, cost: 15 }
      ],
      laborCost: 5, // Extra labor
      overhead: 2, // Extra overhead
      pricingConfig: { strategy: 'markup', value: 50 } // 50% Markup
    };

    const mockVariant2: Variant = {
      id: 'v2',
      name: 'Oatmeal',
      batchSize: 5, // 50% of base
      ingredients: [
        { id: 'v2-1', name: 'Oats', amount: 500, cost: 5 }
      ],
      laborCost: 0,
      overhead: 0,
      pricingConfig: { strategy: 'margin', value: 20 } // 20% Margin
    };

    it('should return empty array if no variants or hasVariants is false', () => {
      expect(performVariantCalculation({ ...mockBaseInput, hasVariants: false })).toEqual([]);
      expect(performVariantCalculation({ ...mockBaseInput, variants: [] })).toEqual([]);
    });

    it('should return empty array if base batch size is <= 0', () => {
      expect(performVariantCalculation({ ...mockBaseInput, batchSize: 0, variants: [mockVariant1] })).toEqual([]);
    });

    it('should throw error if sum of variant batch sizes exceeds base batch size', () => {
      const hugeVariant = { ...mockVariant1, batchSize: 11 };
      expect(() => performVariantCalculation({ ...mockBaseInput, variants: [hugeVariant] }))
        .toThrow(/exceeds base batch size/);
    });

    it('should correctly calculate costs for a single variant (Partial Allocation)', () => {
      // Base Costs: Ing=80, Labor=20, Overhead=10. Total=110.
      // Variant 1 (5 units out of 10):
      // Allocated: Ing=40, Labor=10, Overhead=5.
      // Specific: Ing=15, Labor=5, Overhead=2.
      // Total Variant Cost: 
      // Ing = 40 + 15 = 55
      // Labor = 10 + 5 = 15
      // Overhead = 5 + 2 = 7
      // Total = 77
      // Cost Per Unit = 77 / 5 = 15.40
      // Price (Markup 50%) = 15.40 * 1.5 = 23.10

      const results = performVariantCalculation({
        ...mockBaseInput,
        variants: [mockVariant1]
      });

      expect(results).toHaveLength(1);
      const res = results[0];
      
      expect(res.variantName).toBe('Choco Chip');
      expect(res.breakdown.ingredients).toBe(55);
      expect(res.breakdown.labor).toBe(15);
      expect(res.breakdown.overhead).toBe(7);
      expect(res.totalCost).toBe(77);
      expect(res.costPerUnit).toBe(15.40);
      expect(res.recommendedPrice).toBe(23.10);
    });

    it('should correctly calculate costs for multiple variants (Full Allocation)', () => {
      // Variant 2 (5 units out of 10):
      // Allocated: Ing=40, Labor=10, Overhead=5
      // Specific: Ing=5, Labor=0, Overhead=0
      // Total Variant Cost:
      // Ing = 45
      // Labor = 10
      // Overhead = 5
      // Total = 60
      // Cost Per Unit = 60 / 5 = 12.00
      // Price (Margin 20%) = 12.00 / (1 - 0.20) = 15.00

      const results = performVariantCalculation({
        ...mockBaseInput,
        variants: [mockVariant1, mockVariant2]
      });

      expect(results).toHaveLength(2);

      // Variant 1 Checks (Same as above)
      expect(results[0].totalCost).toBe(77);
      
      // Variant 2 Checks
      const res2 = results[1];
      expect(res2.variantName).toBe('Oatmeal');
      expect(res2.breakdown.ingredients).toBe(45);
      expect(res2.breakdown.labor).toBe(10);
      expect(res2.breakdown.overhead).toBe(5);
      expect(res2.totalCost).toBe(60);
      expect(res2.costPerUnit).toBe(12.00);
      expect(res2.recommendedPrice).toBe(15.00);
    });

    it('should handle cases where variants do not sum up to full batch (Partial Use)', () => {
      // Only using 2 units out of 10 for a small variant test run
      const smallVariant = { ...mockVariant1, batchSize: 2 };
      
      // Base Ratio: 2/10 = 0.2
      // Allocated: Ing=80*0.2=16, Labor=20*0.2=4, Overhead=10*0.2=2
      // Specific: Ing=15, Labor=5, Overhead=2
      // Total: Ing=31, Labor=9, Overhead=4 => Total=44
      
      const results = performVariantCalculation({
        ...mockBaseInput,
        variants: [smallVariant]
      });
      
      expect(results[0].totalCost).toBe(44);
      expect(results[0].costPerUnit).toBe(22); // 44 / 2
    });
  });
});
