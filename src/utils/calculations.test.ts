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
  getCompatibleUnits,
  calculateIngredientCostFromPurchase,
  calculateEquivalentMarkup,
  calculateEquivalentMargin,
  calculateMarginFromProfit,
  calculateMarkupFromProfit,
  calculateProfitFromPercentage,
} from './calculations';
import type { Ingredient } from '../types/calculator';

describe('Calculation Utils', () => {
  describe('calculateEquivalentMarkup', () => {
    it('correctly converts common margin values to markup', () => {
      expect(calculateEquivalentMarkup(0)).toBe(0);
      expect(calculateEquivalentMarkup(20)).toBe(25);
      expect(calculateEquivalentMarkup(50)).toBe(100);
      expect(calculateEquivalentMarkup(75)).toBe(300);
    });

    it('returns 0 for invalid margins', () => {
      expect(calculateEquivalentMarkup(-10)).toBe(0);
      expect(calculateEquivalentMarkup(100)).toBe(0);
      expect(calculateEquivalentMarkup(110)).toBe(0);
    });

    it('handles decimal values accurately', () => {
      // 25% margin -> 33.33% markup
      expect(calculateEquivalentMarkup(25)).toBe(33.33);
    });
  });

  describe('calculateEquivalentMargin', () => {
    it('correctly converts common markup values to margin', () => {
      expect(calculateEquivalentMargin(0)).toBe(0);
      expect(calculateEquivalentMargin(25)).toBe(20);
      expect(calculateEquivalentMargin(100)).toBe(50);
      expect(calculateEquivalentMargin(300)).toBe(75);
    });

    it('returns 0 for invalid markups', () => {
      expect(calculateEquivalentMargin(-10)).toBe(0);
    });

    it('handles decimal values accurately', () => {
      // 33.33% markup -> 24.998...% margin -> 25.0%
      // 1 / 3 markup -> 25% margin
      expect(calculateEquivalentMargin(33.333333)).toBe(25);
    });
  });

  describe('calculateMarginFromProfit', () => {
    it('calculates margin correctly for standard inputs', () => {
      // Cost 75, Profit 25 -> Price 100 -> Margin = 25 / 100 = 25%
      expect(calculateMarginFromProfit(75, 25)).toBe(25);
      // Cost 50, Profit 50 -> Price 100 -> Margin = 50 / 100 = 50%
      expect(calculateMarginFromProfit(50, 50)).toBe(50);
    });

    it('returns 0 for zero or negative denominators', () => {
      expect(calculateMarginFromProfit(0, 0)).toBe(0);
      expect(calculateMarginFromProfit(-10, 5)).toBe(0);
      expect(calculateMarginFromProfit(5, -10)).toBe(0);
    });

    it('handles large costs and profits', () => {
      expect(calculateMarginFromProfit(1000000, 1000000)).toBe(50);
    });

    it('rounds to 2 decimal places', () => {
      // Cost 10, Profit 5 -> Price 15 -> Margin = 5 / 15 = 33.333...%
      expect(calculateMarginFromProfit(10, 5)).toBe(33.33);
    });
  });

  describe('calculateMarkupFromProfit', () => {
    it('calculates markup correctly for standard inputs', () => {
      // Cost 100, Profit 50 -> Markup = 50 / 100 = 50%
      expect(calculateMarkupFromProfit(100, 50)).toBe(50);
      // Cost 50, Profit 50 -> Markup = 50 / 50 = 100%
      expect(calculateMarkupFromProfit(50, 50)).toBe(100);
    });

    it('returns 0 for zero or negative cost', () => {
      expect(calculateMarkupFromProfit(0, 50)).toBe(0);
      expect(calculateMarkupFromProfit(-10, 50)).toBe(0);
    });

    it('returns 0 for negative profit', () => {
      expect(calculateMarkupFromProfit(100, -10)).toBe(0);
    });

    it('rounds to 2 decimal places', () => {
      // Cost 3, Profit 1 -> Markup = 1 / 3 = 33.333...%
      expect(calculateMarkupFromProfit(3, 1)).toBe(33.33);
    });
  });

  describe('calculateProfitFromPercentage', () => {
    it('calculates profit correctly for markup strategy', () => {
      // Cost 100, Markup 50% -> Price 150 -> Profit 50
      expect(calculateProfitFromPercentage(100, 'markup', 50)).toBe(50);
    });

    it('calculates profit correctly for margin strategy', () => {
      // Cost 75, Margin 25% -> Price 100 -> Profit 25
      expect(calculateProfitFromPercentage(75, 'margin', 25)).toBe(25);
    });

    it('returns 0 for negative cost or percentage', () => {
      expect(calculateProfitFromPercentage(-100, 'markup', 50)).toBe(0);
      expect(calculateProfitFromPercentage(100, 'markup', -50)).toBe(0);
    });

    it('returns 0 if margin is 100% or more', () => {
      expect(calculateProfitFromPercentage(100, 'margin', 100)).toBe(0);
      expect(calculateProfitFromPercentage(100, 'margin', 150)).toBe(0);
    });

    it('returns 0 if value is 0', () => {
      expect(calculateProfitFromPercentage(100, 'markup', 0)).toBe(0);
      expect(calculateProfitFromPercentage(100, 'margin', 0)).toBe(0);
    });

    it('rounds to 2 decimal places', () => {
      // Cost 10, Markup 33.33% -> Price 13.333 -> Round 13.33 -> Profit 3.33
      expect(calculateProfitFromPercentage(10, 'markup', 33.33)).toBe(3.33);
    });
  });

  describe('calculateIngredientCostFromPurchase', () => {
    it('calculates cost correctly within same category (weight)', () => {
      // 1kg for 100, use 250g -> (100 / 1000) * 250 = 25
      expect(calculateIngredientCostFromPurchase(1, 'kg', 100, 250, 'g')).toBe(25);
    });

    it('calculates cost correctly within same category (volume)', () => {
      // 1L for 100, use 100ml -> (100 / 1000) * 100 = 10
      expect(calculateIngredientCostFromPurchase(1, 'l', 100, 100, 'ml')).toBe(10);
    });

    it('returns null for incompatible categories', () => {
      // kg to L
      expect(calculateIngredientCostFromPurchase(1, 'kg', 100, 1, 'l')).toBeNull();
    });

    it('handles same unit conversion', () => {
      expect(calculateIngredientCostFromPurchase(10, 'piece', 100, 2, 'piece')).toBe(20);
    });
  });

  describe('getCompatibleUnits', () => {
    it('returns only weight units for a weight unit', () => {
      const units = getCompatibleUnits('kg');
      const values = units.map((u) => u.value);
      expect(values).toContain('g');
      expect(values).toContain('kg');
      expect(values).toContain('oz');
      expect(values).toContain('lb');
      expect(values).not.toContain('ml');
      expect(values).not.toContain('piece');
    });

    it('returns volume units for a volume unit', () => {
      const units = getCompatibleUnits('ml');
      const values = units.map((u) => u.value);
      expect(values).toContain('ml');
      expect(values).toContain('l');
      expect(values).toContain('tsp');
      expect(values).toContain('tbsp');
      expect(values).toContain('cup');
      expect(values).toContain('fl_oz');
      expect(values).not.toContain('kg');
    });

    it('returns all units for invalid or empty input', () => {
      const units = getCompatibleUnits('');
      expect(units.length).toBeGreaterThan(10);
    });
  });

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

    it('should adjust cost per unit based on yield percentage', () => {
      // 100 cost, 10 units, 50% yield -> (100/10) / 0.5 = 10 / 0.5 = 20
      expect(calculateCostPerUnit(100, 10, 50)).toBe(20);
      // 100 cost, 10 units, 80% yield -> 10 / 0.8 = 12.5
      expect(calculateCostPerUnit(100, 10, 80)).toBe(12.5);
    });

    it('should return 0 when batch size is 0', () => {
      expect(calculateCostPerUnit(100, 0)).toBe(0);
    });

    it('should return 0 for 0 or negative yield', () => {
      expect(calculateCostPerUnit(100, 10, 0)).toBe(0);
      expect(calculateCostPerUnit(100, 10, -10)).toBe(0);
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
      yieldPercentage: 100,
    };

    it('performs full calculation and accounts for yieldPercentage', () => {
      const result = performFullCalculation(
        {
          ...baseInput,
          yieldPercentage: 80,
        },
        { strategy: 'markup', value: 50 }
      );

      // Total Ing Cost = 100, Batch = 100.
      // Raw unit cost = 1.
      // Yield 80% -> 1 / 0.8 = 1.25.
      // Recommended Price (Markup 50%) = 1.25 * 1.5 = 1.875 -> 1.88.
      // Profit per unit = 1.88 - 1.25 = 0.63.
      // Sellable units = 100 * 0.8 = 80.
      // Profit per batch = 80 * 0.63 = 50.4.
      expect(result.costPerUnit).toBe(1.25);
      expect(result.profitPerBatch).toBe(50.4);
    });

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
              yieldPercentage: 100,
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

    it('accounts for variant-specific yield percentage', () => {
      const result = performFullCalculation(
        {
          ...baseInput,
          batchSize: 10,
          ingredients: [{ id: '1', name: 'Ing 1', amount: 10, cost: 100 }], // Cost per unit = 10
          yieldPercentage: 100,
          hasVariants: true,
          variants: [
            {
              id: 'v1',
              name: 'Variant 1',
              batchSize: 5,
              ingredients: [],
              laborCost: 0,
              overhead: 0,
              yieldPercentage: 50, // 50% yield for variant
              pricingConfig: { strategy: 'markup', value: 0 },
            },
          ],
        },
        { strategy: 'markup', value: 0 }
      );

      const v1 = result.variantResults?.find((v) => v.id === 'v1');
      // Base cost per unit = 10.
      // Allocated base cost = 10 * 5 = 50.
      // Variant specific ingredients/labor/overhead = 0.
      // Variant total cost = 50.
      // Variant batch size = 5.
      // Yield 50% -> (50 / 5) / 0.5 = 10 / 0.5 = 20.
      expect(v1?.costPerUnit).toBe(20);
    });
  });
});
