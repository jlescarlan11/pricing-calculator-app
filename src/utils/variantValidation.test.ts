import { describe, it, expect } from 'vitest';
import {
  validateVariantQuantities,
  validateVariantData,
  getQuantityAllocation,
} from './variantValidation';
import { VariantInput } from '../types/variants';
import { Ingredient } from '../types/calculator';

const mockIngredient: Ingredient = {
  id: '1',
  name: 'Sugar',
  amount: 100,
  cost: 50,
};

const createMockVariant = (overrides: Partial<VariantInput> = {}): VariantInput => ({
  id: 'v1',
  name: 'Regular',
  amount: 10,
  unit: 'pcs',
  additionalIngredients: [],
  additionalLabor: 0,
  pricingStrategy: 'markup',
  pricingValue: 50,
  currentSellingPrice: null,
  ...overrides,
});

describe('validateVariantQuantities', () => {
  it('should return error if variants array is empty', () => {
    const result = validateVariantQuantities([], 100);
    expect(result).toHaveLength(1);
    expect(result[0].field).toBe('variants');
  });

  it('should return valid for correct allocation', () => {
    const variants = [
      createMockVariant({ amount: 50 }),
      createMockVariant({ amount: 50 }),
    ];
    const result = validateVariantQuantities(variants, 100);
    expect(result).toHaveLength(0);
  });

  it('should return error for under-allocation', () => {
    const variants = [createMockVariant({ amount: 40 })];
    const result = validateVariantQuantities(variants, 100);
    expect(result).toHaveLength(1);
    expect(result[0].field).toBe('totalQuantity');
  });

  it('should return error for over-allocation', () => {
    const variants = [createMockVariant({ amount: 110 })];
    const result = validateVariantQuantities(variants, 100);
    expect(result).toHaveLength(1);
    expect(result[0].field).toBe('totalQuantity');
  });

  it('should validate individual variant quantities', () => {
    const variants = [createMockVariant({ amount: -5 })];
    const result = validateVariantQuantities(variants, 100);
    // Should have error for specific variant amount AND potentially total quantity mismatch
    // But implementation checks total only if individual quantities are numbers. 
    // -5 is a number, so it adds to total (-5). -5 != 100.
    // Error 1: amount < 0.01
    // Error 2: total mismatch
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some(e => e.field === 'variants[0].amount')).toBe(true);
  });

  it('should handle floating point tolerance', () => {
    // 0.1 + 0.2 = 0.30000000000000004
    const variants = [
      createMockVariant({ amount: 0.1 }),
      createMockVariant({ amount: 0.2 }),
    ];
    // batch size 0.3
    const result = validateVariantQuantities(variants, 0.3);
    expect(result).toHaveLength(0);
  });
});

describe('validateVariantData', () => {
  it('should return valid for correct data', () => {
    const variant = createMockVariant();
    const result = validateVariantData(variant, 0);
    expect(result).toHaveLength(0);
  });

  it('should validate name requirement', () => {
    const variant = createMockVariant({ name: '' });
    const result = validateVariantData(variant, 0);
    expect(result[0].field).toBe('variants[0].name');
  });

  it('should validate name length', () => {
    const variant = createMockVariant({ name: 'a'.repeat(51) });
    const result = validateVariantData(variant, 0);
    expect(result[0].field).toBe('variants[0].name');
  });

  it('should validate non-negative additional labor', () => {
    const variant = createMockVariant({ additionalLabor: -10 });
    const result = validateVariantData(variant, 0);
    expect(result[0].field).toBe('variants[0].additionalLabor');
  });

  it('should validate markup pricing', () => {
    const variant = createMockVariant({ pricingStrategy: 'markup', pricingValue: -10 });
    const result = validateVariantData(variant, 0);
    expect(result[0].field).toBe('variants[0].pricingValue');
  });

  it('should validate margin pricing', () => {
    const variant = createMockVariant({ pricingStrategy: 'margin', pricingValue: 100 });
    const result = validateVariantData(variant, 0);
    expect(result[0].field).toBe('variants[0].pricingValue');
  });

  it('should validate additional ingredients mapping', () => {
    const variant = createMockVariant({
      additionalIngredients: [
        { ...mockIngredient, name: '' }, // Invalid name
        { ...mockIngredient, cost: -5 }, // Invalid cost
      ],
    });
    const result = validateVariantData(variant, 1);
    
    // Expect errors for name and cost with correct path
    const nameError = result.find(e => e.field.includes('additionalIngredients[0].name'));
    const costError = result.find(e => e.field.includes('additionalIngredients[1].cost'));
    
    expect(nameError).toBeDefined();
    expect(nameError?.field).toBe('variants[1].additionalIngredients[0].name');
    expect(costError).toBeDefined();
    expect(costError?.field).toBe('variants[1].additionalIngredients[1].cost');
  });
});

describe('getQuantityAllocation', () => {
  it('should calculate correctly for partial allocation', () => {
    const variants = [createMockVariant({ amount: 30 })];
    const result = getQuantityAllocation(variants, 100);
    expect(result).toEqual({
      totalAllocated: 30,
      remaining: 70,
      isOverAllocated: false,
      isFullyAllocated: false,
    });
  });

  it('should calculate correctly for full allocation', () => {
    const variants = [createMockVariant({ amount: 100 })];
    const result = getQuantityAllocation(variants, 100);
    expect(result.isFullyAllocated).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('should calculate correctly for over allocation', () => {
    const variants = [createMockVariant({ amount: 120 })];
    const result = getQuantityAllocation(variants, 100);
    expect(result.isOverAllocated).toBe(true);
    expect(result.remaining).toBe(-20);
  });
  
  it('should handle floating point precision', () => {
      const variants = [
          createMockVariant({ amount: 0.1 }),
          createMockVariant({ amount: 0.2 })
      ];
      const result = getQuantityAllocation(variants, 0.3);
      expect(result.totalAllocated).toBe(0.3);
      expect(result.remaining).toBe(0);
      expect(result.isFullyAllocated).toBe(true);
  });
});
