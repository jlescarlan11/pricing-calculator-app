import { describe, it, expect } from 'vitest';
import {
  validateVariantQuantities,
  validateVariantData,
} from './variantValidation';
import type { VariantInput } from '../types/variants';
import type { Ingredient } from '../types/calculator';

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
  currentSellingPrice: null,
  ...overrides,
});

describe('validateVariantQuantities', () => {
  it('should be valid if variants array is empty (implicit base)', () => {
    const result = validateVariantQuantities([]);
    expect(result).toHaveLength(0);
  });

  it('should return valid for any amount', () => {
    const variants = [
      createMockVariant({ amount: 50 }),
      createMockVariant({ amount: 50 }),
    ];
    const result = validateVariantQuantities(variants);
    expect(result).toHaveLength(0);
  });

  it('should validate individual variant quantities', () => {
    const variants = [createMockVariant({ amount: -5 })];
    const result = validateVariantQuantities(variants);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some(e => e.field === 'variants[0].amount')).toBe(true);
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
