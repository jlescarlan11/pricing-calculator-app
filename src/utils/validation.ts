import { MAX_BATCH_SIZE } from '../constants';
import type { Ingredient } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export const validatePositiveNumber = (value: number, fieldName: string): ValidationError | null => {
  if (value === null || value === undefined || isNaN(value)) {
    return { field: fieldName, message: `Oops, ${fieldName} needs to be a valid number.` };
  }
  if (value <= 0) {
    return { field: fieldName, message: `Oops, ${fieldName} should be more than zero.` };
  }
  return null;
};

export const validateBatchSize = (value: number): ValidationError | null => {
  const fieldName = 'Batch size';
  if (value === null || value === undefined || isNaN(value)) {
    return { field: 'batchSize', message: `Oops, ${fieldName} needs to be a valid number.` };
  }
  if (!Number.isInteger(value)) {
    return { field: 'batchSize', message: `Oops, ${fieldName} should be a whole number.` };
  }
  if (value < 1 || value > MAX_BATCH_SIZE) {
    return { field: 'batchSize', message: `Oops, batch size must be at least 1.` };
  }
  return null;
};

export const validateProductName = (name: string): ValidationError | null => {
  if (!name || name.trim() === '') {
    return { field: 'productName', message: 'Please name your product to continue.' };
  }
  if (name.trim().length < 2) {
    return { field: 'productName', message: 'Try a slightly longer name for your product.' };
  }
  return null;
};

export const validatePercentage = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationError | null => {
  if (value === null || value === undefined || isNaN(value)) {
    return { field: fieldName, message: `Oops, ${fieldName} needs to be a valid number.` };
  }
  if (value < min || value > max) {
    return { field: fieldName, message: `Oops, ${fieldName} should be between ${min}% and ${max}%.` };
  }
  return null;
};

export const validateIngredients = (ingredients: Ingredient[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!ingredients || ingredients.length === 0) {
    errors.push({ field: 'ingredients', message: 'Try adding at least one ingredient to start.' });
    return errors;
  }

  ingredients.forEach((ing, index) => {
    if (!ing.name || ing.name.trim() === '') {
      errors.push({
        field: `ingredients[${index}].name`,
        message: `Please name ingredient #${index + 1}.`,
      });
    }

    if (ing.cost === null || ing.cost === undefined || isNaN(ing.cost) || ing.cost <= 0) {
      errors.push({
        field: `ingredients[${index}].cost`,
        message: `Oops, ingredient #${index + 1} needs a cost.`,
      });
    }
  });

  return errors;
};

export const validatePresetName = (name: string, existingNames: string[]): ValidationError | null => {
  if (!name) {
     return { field: 'name', message: 'Please give your preset a name.' };
  }
  
  const trimmedName = name.trim();
  const fieldName = 'Preset name';

  if (trimmedName.length < 3 || trimmedName.length > 50) {
    return { field: 'name', message: `Try a name between 3 and 50 characters.` };
  }

  // Check for control characters (0-31) and 127 (DEL)
  // These are generally unsafe for storage/serialization keys or plain display
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F\x7F]/.test(trimmedName)) {
    return { field: 'name', message: `Oops, that name has characters we can't use.` };
  }

  const isDuplicate = existingNames.some(
    (existing) => existing.toLowerCase() === trimmedName.toLowerCase()
  );

  if (isDuplicate) {
    return { field: 'name', message: `You already have a preset with this name.` };
  }

  return null;
};
