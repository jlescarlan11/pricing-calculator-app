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
        message: 'Test Field must be greater than zero.',
      });
    });

    it('should return error for negative numbers', () => {
      expect(validatePositiveNumber(-5, 'Test Field')).toEqual({
        field: 'Test Field',
        message: 'Test Field must be greater than zero.',
      });
    });

    it('should return error for NaN', () => {
      expect(validatePositiveNumber(NaN, 'Test Field')).toEqual({
        field: 'Test Field',
        message: 'Test Field must be a valid number.',
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
        message: 'Batch size must be a whole number.',
      });
    });

    it('should return error for values less than 1', () => {
      expect(validateBatchSize(0)).toEqual({
        field: 'batchSize',
        message: 'Batch size must be between 1 and 10,000.',
      });
    });

    it('should return error for values greater than 10,000', () => {
      expect(validateBatchSize(10001)).toEqual({
        field: 'batchSize',
        message: 'Batch size must be between 1 and 10,000.',
      });
    });

    it('should return error for NaN', () => {
        expect(validateBatchSize(NaN)).toEqual({
            field: 'batchSize',
            message: 'Batch size must be a valid number.',
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
        message: 'Margin must be between 0% and 100%.',
      });
    });

    it('should return error for values above maximum', () => {
      expect(validatePercentage(101, 0, 100, 'Margin')).toEqual({
        field: 'Margin',
        message: 'Margin must be between 0% and 100%.',
      });
    });
    
     it('should return error for NaN', () => {
        expect(validatePercentage(NaN, 0, 100, 'Margin')).toEqual({
            field: 'Margin',
            message: 'Margin must be a valid number.',
        });
    });
  });

  describe('validateIngredients', () => {
    const validIngredient = { id: '1', name: 'Flour', amount: 1000, cost: 50 };

    it('should return empty array for valid ingredients', () => {
      expect(validateIngredients([validIngredient])).toEqual([]);
    });

    it('should return error for empty list', () => {
      expect(validateIngredients([])).toEqual([
        { field: 'ingredients', message: 'At least one ingredient is required.' },
      ]);
    });

    it('should return error for empty name', () => {
      const invalidIngredient = { ...validIngredient, name: '' };
      expect(validateIngredients([invalidIngredient])).toEqual([
        { field: 'ingredients[0].name', message: 'Ingredient #1 name cannot be empty.' },
      ]);
    });

    it('should return error for name with only whitespace', () => {
        const invalidIngredient = { ...validIngredient, name: '   ' };
        expect(validateIngredients([invalidIngredient])).toEqual([
          { field: 'ingredients[0].name', message: 'Ingredient #1 name cannot be empty.' },
        ]);
      });

    it('should return error for zero cost', () => {
      const invalidIngredient = { ...validIngredient, cost: 0 };
      expect(validateIngredients([invalidIngredient])).toEqual([
        { field: 'ingredients[0].cost', message: 'Ingredient #1 cost must be greater than zero.' },
      ]);
    });

    it('should return error for negative cost', () => {
      const invalidIngredient = { ...validIngredient, cost: -10 };
      expect(validateIngredients([invalidIngredient])).toEqual([
        { field: 'ingredients[0].cost', message: 'Ingredient #1 cost must be greater than zero.' },
      ]);
    });
    
    it('should collect multiple errors', () => {
        const invalid1 = { ...validIngredient, name: '' };
        const invalid2 = { ...validIngredient, cost: 0 };
        expect(validateIngredients([invalid1, invalid2])).toEqual([
            { field: 'ingredients[0].name', message: 'Ingredient #1 name cannot be empty.' },
            { field: 'ingredients[1].cost', message: 'Ingredient #2 cost must be greater than zero.' }
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
        message: 'Preset name must be between 3 and 50 characters.',
      });
    });

    it('should return error for long name', () => {
      const longName = 'a'.repeat(51);
      expect(validatePresetName(longName, existingNames)).toEqual({
        field: 'name',
        message: 'Preset name must be between 3 and 50 characters.',
      });
    });

    it('should return error for duplicate name (case insensitive)', () => {
      expect(validatePresetName('brownie', existingNames)).toEqual({
        field: 'name',
        message: 'Preset name already exists.',
      });
    });

    it('should return error for invalid control characters', () => {
       // using a control character (null byte in the middle)
      expect(validatePresetName('Ca\x00ke', existingNames)).toEqual({
        field: 'name',
        message: 'Preset name contains invalid characters.',
      });
    });
  });
});
