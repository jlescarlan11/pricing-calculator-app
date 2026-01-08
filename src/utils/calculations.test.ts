import { describe, it, expect } from 'vitest';
import {
  calculateTotalIngredientCost,
  calculateCostPerUnit,
  calculateMarkupPrice,
  calculateMarginPrice,
  calculateRecommendedPrice,
  calculateProfitMargin,
  performFullCalculation,
  calculateMarketPosition,
} from './calculations';
import type { Ingredient } from '../types/calculator';

describe('Calculation Utils', () => {
  describe('calculateMarketPosition', () => {
    it('returns error if fewer than 2 competitors', () => {
      expect(calculateMarketPosition(100, [])).toEqual({ error: 'NEEDS_TWO_COMPETITORS' });
      expect(calculateMarketPosition(100, [{ competitorPrice: 100 }])).toEqual({
        error: 'NEEDS_TWO_COMPETITORS',
      });
    });

    it('filters out invalid competitor prices', () => {
      const result = calculateMarketPosition(150, [
        { competitorPrice: 100 },
        { competitorPrice: NaN },
        { competitorPrice: -50 },
        { competitorPrice: 200 },
      ]);
      
      if ('error' in result) throw new Error('Should not return error');
      
      expect(result.minPrice).toBe(100);
      expect(result.maxPrice).toBe(200);
      expect(result.avgPrice).toBe(150);
    });

    it('correctly identifies budget position', () => {
      const result = calculateMarketPosition(100, [
        { competitorPrice: 120 },
        { competitorPrice: 200 },
      ]);
      
      if ('error' in result) throw new Error('Should not return error');
      
      expect(result.position).toBe('budget');
      expect(result.percentile).toBe(0);
    });

    it('correctly identifies mid position', () => {
      const result = calculateMarketPosition(150, [
        { competitorPrice: 100 },
        { competitorPrice: 200 },
      ]);
      
      if ('error' in result) throw new Error('Should not return error');
      
      expect(result.position).toBe('mid');
      expect(result.percentile).toBe(50);
    });

    it('correctly identifies premium position', () => {
      const result = calculateMarketPosition(250, [
        { competitorPrice: 100 },
        { competitorPrice: 200 },
      ]);
      
      if ('error' in result) throw new Error('Should not return error');
      
      expect(result.position).toBe('premium');
      expect(result.percentile).toBe(100);
    });

    it('handles all competitors having the same price', () => {
      const competitors = [{ competitorPrice: 100 }, { competitorPrice: 100 }];

      // Price matches exactly
      let result = calculateMarketPosition(100, competitors);
      if ('error' in result) throw new Error('Should not return error');
      expect(result.position).toBe('mid');
      expect(result.percentile).toBe(50);

      // Price is lower
      result = calculateMarketPosition(90, competitors);
      if ('error' in result) throw new Error('Should not return error');
      expect(result.position).toBe('budget');
      expect(result.percentile).toBe(0);

      // Price is higher
      result = calculateMarketPosition(110, competitors);
      if ('error' in result) throw new Error('Should not return error');
      expect(result.position).toBe('premium');
      expect(result.percentile).toBe(100);
    });
  });

  describe('calculateTotalIngredientCost', () => {
    it('should sum the costs of all ingredients', () => {
      const ingredients: Ingredient[] = [
        { id: '1', name: 'Flour', amount: 1, cost: 10.5 },
        { id: '2', name: 'Sugar', amount: 1, cost: 5.25 },
        { id: '3', name: 'Eggs', amount: 1, cost: 2.0 },
      ];
      expect(calculateTotalIngredientCost(ingredients)).toBe(17.75);
    });

    it('should return 0 for an empty array', () => {
      expect(calculateTotalIngredientCost([])).toBe(0);
    });

    it('should ignore negative costs', () => {
      const ingredients: Ingredient[] = [
        { id: '1', name: 'Flour', amount: 1, cost: 10 },
        { id: '2', name: 'Bad Data', amount: 1, cost: -5 },
      ];
      expect(calculateTotalIngredientCost(ingredients)).toBe(10);
    });

    it('should handle large numbers correctly', () => {
      const ingredients: Ingredient[] = [
        { id: '1', name: 'Gold', amount: 1, cost: 999999.99 },
        { id: '2', name: 'Silver', amount: 1, cost: 0.01 },
      ];
      expect(calculateTotalIngredientCost(ingredients)).toBe(1000000);
    });
  });

  describe('calculateCostPerUnit', () => {
    it('should calculate cost per unit correctly', () => {
      expect(calculateCostPerUnit(100, 10)).toBe(10);
      expect(calculateCostPerUnit(50.55, 5)).toBe(10.11);
    });

    it('should return 0 when batch size is 0', () => {
      expect(calculateCostPerUnit(100, 0)).toBe(0);
    });

    it('should return 0 when batch size is negative', () => {
      expect(calculateCostPerUnit(100, -5)).toBe(0);
    });

    it('should return 0 when total cost is negative', () => {
      expect(calculateCostPerUnit(-100, 10)).toBe(0);
    });
  });

  describe('calculateMarkupPrice', () => {
    it('should calculate price based on markup percentage', () => {
      // Cost 10, Markup 50% -> 10 * 1.5 = 15
      expect(calculateMarkupPrice(10, 50)).toBe(15);
    });

    it('should round to 2 decimal places', () => {
      // Cost 10, Markup 33.333% -> 10 * 1.33333 = 13.3333... -> 13.33
      expect(calculateMarkupPrice(10, 33.333)).toBe(13.33);
    });

    it('should return 0 if cost is negative', () => {
      expect(calculateMarkupPrice(-10, 50)).toBe(0);
    });
  });

  describe('calculateMarginPrice', () => {
    it('should calculate price based on profit margin', () => {
      // Cost 10, Margin 50% -> 10 / (1 - 0.5) = 10 / 0.5 = 20
      expect(calculateMarginPrice(10, 50)).toBe(20);
    });

    it('should return 0 if margin is 100% or more', () => {
      expect(calculateMarginPrice(10, 100)).toBe(0);
      expect(calculateMarginPrice(10, 150)).toBe(0);
    });

    it('should round correctly', () => {
      // Cost 75, Margin 25% -> 75 / 0.75 = 100
      expect(calculateMarginPrice(75, 25)).toBe(100);
    });
  });

  describe('calculateRecommendedPrice', () => {
    it('should use markup strategy when specified', () => {
      expect(calculateRecommendedPrice(10, 'markup', 50)).toBe(15);
    });

    it('should use margin strategy when specified', () => {
      expect(calculateRecommendedPrice(10, 'margin', 50)).toBe(20);
    });
  });

  describe('calculateProfitMargin', () => {
    it('should calculate correct margin percentage', () => {
      // Cost 10, Price 20 -> (20-10)/20 = 0.5 -> 50%
      expect(calculateProfitMargin(10, 20)).toBe(50);
    });

    it('should handle break-even (0% margin)', () => {
      expect(calculateProfitMargin(10, 10)).toBe(0);
    });

    it('should handle loss (negative margin)', () => {
      // Cost 20, Price 10 -> (10-20)/10 = -1 -> -100%
      expect(calculateProfitMargin(20, 10)).toBe(-100);
    });

    it('should return 0 if selling price is 0', () => {
      expect(calculateProfitMargin(10, 0)).toBe(0);
    });

    it('should return 0 if selling price is negative', () => {
      expect(calculateProfitMargin(10, -5)).toBe(0);
    });
  });

  describe('performFullCalculation', () => {
    const baseInput = {
      productName: 'Test Product',
      batchSize: 100,
      ingredients: [{ id: '1', name: 'Ing 1', amount: 100, cost: 100 }], // Total Ing Cost = 100
      laborCost: 0,
      overhead: 0,
      hasVariants: false,
      variants: [],
    };

    it('performs full calculation with variants and calculates current price comparison', () => {
      const result = performFullCalculation(
        {
          ...baseInput,
          hasVariants: true,
          variants: [
            {
              id: 'v1',
              name: 'Variant 1',
              batchSize: 50,
              ingredients: [],
              laborCost: 0,
              overhead: 0,
              pricingConfig: { strategy: 'markup', value: 50 },
              currentSellingPrice: 20, // User says they sell it for 20
            },
          ],
        },
        { strategy: 'markup', value: 50 }
      );

      expect(result.variantResults).toHaveLength(2); // Base + Variant 1

      const v1 = result.variantResults?.find((v) => v.id === 'v1');
      expect(v1).toBeDefined();
      expect(v1?.currentSellingPrice).toBe(20);

      // Cost per unit is 1.00 (from base).
      // Markup 50% -> Recommended 1.50.
      // Current Price 20.
      // Profit = 20 - 1 = 19.
      // Margin = (20 - 1) / 20 = 0.95 = 95%.

      expect(v1?.currentProfitPerUnit).toBe(19);
      expect(v1?.currentProfitMargin).toBe(95);
    });

    it('populates breakdown property for variants', () => {
      const result = performFullCalculation(
        {
          ...baseInput,
          batchSize: 10,
          ingredients: [{ id: '1', name: 'Ing 1', amount: 10, cost: 100 }], // Cost per unit = 10
          laborCost: 20, // Total base cost = 120. Cost per unit = 12
          overhead: 0,
          hasVariants: true,
          variants: [
            {
              id: 'v1',
              name: 'Variant 1',
              batchSize: 5,
              ingredients: [{ id: '2', name: 'Add-on', amount: 1, cost: 10 }], // Specific cost = 10
              laborCost: 5,
              overhead: 5,
              pricingConfig: { strategy: 'markup', value: 50 },
            },
          ],
        },
        { strategy: 'markup', value: 50 }
      );

      const v1 = result.variantResults?.find((v) => v.id === 'v1');
      expect(v1?.breakdown).toBeDefined();
      expect(v1?.breakdown?.baseAllocation).toBe(60); // 12 * 5
      expect(v1?.breakdown?.specificIngredients).toBe(10);
      expect(v1?.breakdown?.specificLabor).toBe(5);
      expect(v1?.breakdown?.specificOverhead).toBe(5);
      expect(v1?.totalCost).toBe(80); // 60 + 10 + 5 + 5

      const base = result.variantResults?.find((v) => v.id === 'base-original');
      expect(base?.breakdown).toBeDefined();
      expect(base?.breakdown?.baseAllocation).toBe(60); // 12 * 5 remaining
      expect(base?.breakdown?.specificIngredients).toBe(0);
    });
  });
});
