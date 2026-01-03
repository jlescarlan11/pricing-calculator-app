import type { Ingredient } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export const validatePositiveNumber = (value: number, fieldName: string): ValidationError | null => {
  if (value === null || value === undefined || isNaN(value)) {
    return { field: fieldName, message: `${fieldName} must be a valid number.` };
  }
  if (value <= 0) {
    return { field: fieldName, message: `${fieldName} must be greater than zero.` };
  }
  return null;
};

export const validateBatchSize = (value: number): ValidationError | null => {
  const fieldName = 'Batch size';
  if (value === null || value === undefined || isNaN(value)) {
    return { field: 'batchSize', message: `${fieldName} must be a valid number.` };
  }
  if (!Number.isInteger(value)) {
    return { field: 'batchSize', message: `${fieldName} must be a whole number.` };
  }
  if (value < 1 || value > 10000) {
    return { field: 'batchSize', message: `${fieldName} must be between 1 and 10,000.` };
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
    return { field: fieldName, message: `${fieldName} must be a valid number.` };
  }
  if (value < min || value > max) {
    return { field: fieldName, message: `${fieldName} must be between ${min}% and ${max}%.` };
  }
  return null;
};

export const validateIngredients = (ingredients: Ingredient[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!ingredients || ingredients.length === 0) {
    errors.push({ field: 'ingredients', message: 'At least one ingredient is required.' });
    return errors;
  }

  ingredients.forEach((ing, index) => {
    if (!ing.name || ing.name.trim() === '') {
      errors.push({
        field: `ingredients[${index}].name`,
        message: `Ingredient #${index + 1} name cannot be empty.`,
      });
    }

    if (ing.cost === null || ing.cost === undefined || isNaN(ing.cost) || ing.cost <= 0) {
      errors.push({
        field: `ingredients[${index}].cost`,
        message: `Ingredient #${index + 1} cost must be greater than zero.`,
      });
    }
  });

  return errors;
};

export const validatePresetName = (name: string, existingNames: string[]): ValidationError | null => {
  if (!name) {
     return { field: 'name', message: 'Preset name is required.' };
  }
  
  const trimmedName = name.trim();
  const fieldName = 'Preset name';

  if (trimmedName.length < 3 || trimmedName.length > 50) {
    return { field: 'name', message: `${fieldName} must be between 3 and 50 characters.` };
  }

  // Check for control characters (0-31) and 127 (DEL)
  // These are generally unsafe for storage/serialization keys or plain display
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F\x7F]/.test(trimmedName)) {
    return { field: 'name', message: `${fieldName} contains invalid characters.` };
  }

  const isDuplicate = existingNames.some(
    (existing) => existing.toLowerCase() === trimmedName.toLowerCase()
  );

  if (isDuplicate) {
    return { field: 'name', message: `${fieldName} already exists.` };
  }

  return null;
};
