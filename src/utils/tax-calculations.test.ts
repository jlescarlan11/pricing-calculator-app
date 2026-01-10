import { describe, it, expect } from 'vitest';
import { calculatePriceWithTax, performFullCalculation } from './calculations';

describe('Tax Calculations', () => {
  describe('calculatePriceWithTax', () => {
    it('calculates price with tax correctly', () => {
      expect(calculatePriceWithTax(100, 12)).toBe(112);
      expect(calculatePriceWithTax(50, 5)).toBe(52.5);
    });

    it('rounds to 2 decimal places', () => {
      // 10.99 * 1.07 = 11.7593 -> 11.76
      expect(calculatePriceWithTax(10.99, 7)).toBe(11.76);
    });

    it('returns base price if tax is 0', () => {
      expect(calculatePriceWithTax(100, 0)).toBe(100);
    });

    it('handles negative inputs gracefully', () => {
      expect(calculatePriceWithTax(-100, 12)).toBe(0);
      expect(calculatePriceWithTax(100, -12)).toBe(100);
    });
  });

  describe('performFullCalculation with Tax', () => {
    const baseInput = {
      productName: 'Test Product',
      batchSize: 10,
      ingredients: [{ id: '1', name: 'Ing 1', amount: 10, cost: 100 }], // Total Ing Cost = 100, Unit Cost = 10
      laborCost: 0,
      overhead: 0,
      hasVariants: false,
      variants: [],
      yieldPercentage: 100,
    };

    it('populates recommendedPriceInclTax when includeTax is true', () => {
      const result = performFullCalculation(baseInput, {
        strategy: 'markup',
        value: 50,
        includeTax: true,
        taxRate: 12,
      });

      // Unit Cost = 10
      // Recommended Price (50% markup) = 15
      // Recommended Price Incl Tax (12%) = 15 * 1.12 = 16.8
      expect(result.recommendedPrice).toBe(15);
      expect(result.recommendedPriceInclTax).toBe(16.8);
    });

    it('sets recommendedPriceInclTax equal to recommendedPrice when includeTax is false', () => {
      const result = performFullCalculation(baseInput, {
        strategy: 'markup',
        value: 50,
        includeTax: false,
        taxRate: 12,
      });

      expect(result.recommendedPrice).toBe(15);
      expect(result.recommendedPriceInclTax).toBe(15);
    });

    it('handles variants with tax', () => {
      const result = performFullCalculation(
        {
          ...baseInput,
          hasVariants: true,
          variants: [
            {
              id: 'v1',
              name: 'Variant 1',
              batchSize: 5,
              ingredients: [],
              laborCost: 0,
              overhead: 0,
              yieldPercentage: 100,
              pricingConfig: {
                strategy: 'margin',
                value: 50,
                includeTax: true,
                taxRate: 10,
              },
            },
          ],
        },
        { strategy: 'markup', value: 50, includeTax: true, taxRate: 12 }
      );

      // Base (leftover 5):
      // Unit Cost = 10
      // Recommended Price (50% markup) = 15
      // Recommended Price Incl Tax (12%) = 16.8
      const baseVariant = result.variantResults?.find(v => v.id === 'base-original');
      expect(baseVariant?.recommendedPrice).toBe(15);
      expect(baseVariant?.recommendedPriceInclTax).toBe(16.8);

      // Variant v1:
      // Unit Cost = 10
      // Recommended Price (50% margin) = 10 / (1 - 0.5) = 20
      // Recommended Price Incl Tax (10%) = 20 * 1.1 = 22
      const v1 = result.variantResults?.find(v => v.id === 'v1');
      expect(v1?.recommendedPrice).toBe(20);
      expect(v1?.recommendedPriceInclTax).toBe(22);
    });
  });
});
