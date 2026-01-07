import { describe, it, expect } from 'vitest';
import {
  validatePositiveNumber,
  validateBatchSize,
  validatePercentage,
  validateIngredients,
  validatePresetName,
} from './validation';

describe('Validation Utils', () => {
  describe('validatePositiveNumber', () => {
    it('should return null for valid positive numbers', () => {
      expect(validatePositiveNumber(10, 'Test Field')).toBeNull();
      expect(validatePositiveNumber(0.01, 'Test Field')).toBeNull();
    });

    it('should return error for zero', () => {
      expect(validatePositiveNumber(0, 'Test Field')).toEqual({
        field: 'Test Field',
        message: 'Test Field should be greater than zero.',
      });
    });

    it('should return error for negative numbers', () => {
      expect(validatePositiveNumber(-5, 'Test Field')).toEqual({
        field: 'Test Field',
        message: 'Test Field should be greater than zero.',
      });
    });

    it('should return error for NaN', () => {
      expect(validatePositiveNumber(NaN, 'Test Field')).toEqual({
        field: 'Test Field',
        message: 'Please enter a valid amount for test field.',
      });
    });
  });

  describe('validateBatchSize', () => {
    it('should return null for valid batch sizes', () => {
      expect(validateBatchSize(1)).toBeNull();
      expect(validateBatchSize(100)).toBeNull();
      expect(validateBatchSize(10000)).toBeNull();
    });

    it('should return error for non-integers', () => {
      expect(validateBatchSize(1.5)).toEqual({
        field: 'batchSize',
        message: 'Batch size should be a whole number.',
      });
    });

    it('should return error for values less than 1', () => {
      expect(validateBatchSize(0)).toEqual({
        field: 'batchSize',
        message: 'Batch size should be between 1 and 10000.',
      });
    });

    it('should return error for values greater than 10,000', () => {
      expect(validateBatchSize(10001)).toEqual({
        field: 'batchSize',
        message: 'Batch size should be between 1 and 10000.',
      });
    });

    it('should return error for NaN', () => {
      expect(validateBatchSize(NaN)).toEqual({
        field: 'batchSize',
        message: 'Please enter a valid batch size.',
      });
    });
  });

  describe('validatePercentage', () => {
    it('should return null for valid percentages within range', () => {
      expect(validatePercentage(50, 0, 100, 'Margin')).toBeNull();
      expect(validatePercentage(0, 0, 100, 'Margin')).toBeNull();
      expect(validatePercentage(100, 0, 100, 'Margin')).toBeNull();
    });

    it('should return error for values below minimum', () => {
      expect(validatePercentage(-1, 0, 100, 'Margin')).toEqual({
        field: 'Margin',
        message: 'Margin is usually between 0% and 100%.',
      });
    });

    it('should return error for values above maximum', () => {
      expect(validatePercentage(101, 0, 100, 'Margin')).toEqual({
        field: 'Margin',
        message: 'Margin is usually between 0% and 100%.',
      });
    });

    it('should return error for NaN', () => {
      expect(validatePercentage(NaN, 0, 100, 'Margin')).toEqual({
        field: 'Margin',
        message: 'Please enter a valid percentage for margin.',
      });
    });
  });

  describe('validateIngredients', () => {
    const validIngredient = { 
      id: '1', 
      name: 'Flour', 
      amount: 1000, 
      cost: 50,
      purchaseQuantity: 1000,
      purchaseUnit: 'g',
      purchaseCost: 50,
      recipeQuantity: 1000,
      recipeUnit: 'g',
      useFullQuantity: false
    };

    it('should return empty array for valid ingredients', () => {
      expect(validateIngredients([validIngredient])).toEqual([]);
    });

    it('should return error for empty list', () => {
      expect(validateIngredients([])).toEqual([
        { field: 'ingredients', message: 'Add at least one ingredient to begin the calculation.' },
      ]);
    });

    it('should return error for empty name', () => {
      const invalidIngredient = { ...validIngredient, name: '' };
      expect(validateIngredients([invalidIngredient])).toEqual([
        { field: 'ingredients[0].name', message: 'Please name ingredient #1.' },
      ]);
    });

    it('should return error for name with only whitespace', () => {
      const invalidIngredient = { ...validIngredient, name: '   ' };
      expect(validateIngredients([invalidIngredient])).toEqual([
        { field: 'ingredients[0].name', message: 'Please name ingredient #1.' },
      ]);
    });

    it('should return error for zero purchase quantity', () => {
      const invalidIngredient = { ...validIngredient, purchaseQuantity: 0 };
      expect(validateIngredients([invalidIngredient])).toEqual([
        { field: 'ingredients[0].purchaseQuantity', message: 'Enter quantity.' },
      ]);
    });

    it('should return error for zero recipe quantity when not using full quantity', () => {
      const invalidIngredient = { ...validIngredient, recipeQuantity: 0, useFullQuantity: false };
      expect(validateIngredients([invalidIngredient])).toEqual([
        { field: 'ingredients[0].recipeQuantity', message: 'Enter usage.' },
      ]);
    });

    it('should collect multiple errors', () => {
      const invalid1 = { ...validIngredient, name: '' };
      const invalid2 = { ...validIngredient, purchaseCost: -1 };
      expect(validateIngredients([invalid1, invalid2])).toEqual([
        { field: 'ingredients[0].name', message: 'Please name ingredient #1.' },
        { field: 'ingredients[1].purchaseCost', message: 'Enter cost.' },
      ]);
    });
  });

  describe('validatePresetName', () => {
    const existingNames = ['Brownie', 'Cookie'];

    it('should return null for valid name', () => {
      expect(validatePresetName('Cake', existingNames)).toBeNull();
    });

    it('should return error for short name', () => {
      expect(validatePresetName('Hi', existingNames)).toEqual({
        field: 'name',
        message: 'Try a name between 3 and 50 characters.',
      });
    });

    it('should return error for long name', () => {
      const longName = 'a'.repeat(51);
      expect(validatePresetName(longName, existingNames)).toEqual({
        field: 'name',
        message: 'Try a name between 3 and 50 characters.',
      });
    });

    it('should return error for duplicate name (case insensitive)', () => {
      expect(validatePresetName('brownie', existingNames)).toEqual({
        field: 'name',
        message: 'You already have a preset with this name.',
      });
    });

    it('should return error for invalid control characters', () => {
      // using a control character (null byte in the middle)
      expect(validatePresetName('Ca\x00ke', existingNames)).toEqual({
        field: 'name',
        message: "Oops, that name has characters we can't use.",
      });
    });
  });
});
