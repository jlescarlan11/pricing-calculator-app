import { describe, it, expect } from 'vitest';
import {
  calculateTotalIngredientCost,
  calculateCostPerUnit,
  calculateMarkupPrice,
  calculateMarginPrice,
  calculateRecommendedPrice,
  calculateProfitMargin,
} from './calculations';
import { Ingredient } from '../types/calculator';

describe('Calculation Utils', () => {
  describe('calculateTotalIngredientCost', () => {
    it('should sum the costs of all ingredients', () => {
      const ingredients: Ingredient[] = [
        { id: '1', name: 'Flour', amount: 1, cost: 10.50 },
        { id: '2', name: 'Sugar', amount: 1, cost: 5.25 },
        { id: '3', name: 'Eggs', amount: 1, cost: 2.00 },
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
});
