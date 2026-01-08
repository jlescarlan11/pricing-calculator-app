import { MAX_BATCH_SIZE } from '../constants';
import type { Ingredient } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export const validatePositiveNumber = (
  value: number,
  fieldName: string
): ValidationError | null => {
  if (value === null || value === undefined || isNaN(value)) {
    return {
      field: fieldName,
      message: `Please enter a valid amount for ${fieldName.toLowerCase()}.`,
    };
  }
  if (value <= 0) {
    return { field: fieldName, message: `${fieldName} should be greater than zero.` };
  }
  return null;
};

export const validateBatchSize = (value: number): ValidationError | null => {
  if (value === null || value === undefined || isNaN(value)) {
    return { field: 'batchSize', message: 'Please enter a valid batch size.' };
  }
  if (!Number.isInteger(value)) {
    return { field: 'batchSize', message: 'Batch size should be a whole number.' };
  }
  if (value < 1 || value > MAX_BATCH_SIZE) {
    return { field: 'batchSize', message: `Batch size should be between 1 and ${MAX_BATCH_SIZE}.` };
  }
  return null;
};

export const validateProductName = (name: string): ValidationError | null => {
  if (!name || name.trim() === '') {
    return { field: 'productName', message: 'Please provide a name for your product.' };
  }
  if (name.trim().length < 2) {
    return { field: 'productName', message: 'A slightly longer name would be more descriptive.' };
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
    return {
      field: fieldName,
      message: `Please enter a valid percentage for ${fieldName.toLowerCase()}.`,
    };
  }
  if (value < min || value > max) {
    return { field: fieldName, message: `${fieldName} is usually between ${min}% and ${max}%.` };
  }
  return null;
};

export const validateIngredients = (ingredients: Ingredient[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!ingredients || ingredients.length === 0) {
    errors.push({
      field: 'ingredients',
      message: 'Add at least one ingredient to begin the calculation.',
    });
    return errors;
  }

  ingredients.forEach((ing, index) => {
    if (!ing.name || ing.name.trim() === '') {
      errors.push({
        field: `ingredients[${index}].name`,
        message: `Please name ingredient #${index + 1}.`,
      });
    }

    if (
      ing.purchaseQuantity === null ||
      ing.purchaseQuantity === undefined ||
      isNaN(ing.purchaseQuantity) ||
      ing.purchaseQuantity <= 0
    ) {
      errors.push({
        field: `ingredients[${index}].purchaseQuantity`,
        message: 'Enter quantity.',
      });
    }

    if (
      ing.purchaseCost === null ||
      ing.purchaseCost === undefined ||
      isNaN(ing.purchaseCost) ||
      ing.purchaseCost < 0
    ) {
      errors.push({
        field: `ingredients[${index}].purchaseCost`,
        message: 'Enter cost.',
      });
    }

    if (!ing.useFullQuantity) {
      if (
        ing.recipeQuantity === null ||
        ing.recipeQuantity === undefined ||
        isNaN(ing.recipeQuantity) ||
        ing.recipeQuantity <= 0
      ) {
        errors.push({
          field: `ingredients[${index}].recipeQuantity`,
          message: 'Enter usage.',
        });
      }
    }

    if (ing.cost === null || ing.cost === undefined || isNaN(ing.cost) || ing.cost <= 0) {
      // General cost error if the calculation failed but fields might have their own errors
      if (!errors.some((e) => e.field.startsWith(`ingredients[${index}]`))) {
        errors.push({
          field: `ingredients[${index}].cost`,
          message: `Check details for ingredient #${index + 1}.`,
        });
      }
    }
  });

  return errors;
};

export const validatePresetName = (
  name: string,
  existingNames: string[]
): ValidationError | null => {
  if (!name) {
    return { field: 'name', message: 'Please give your preset a name.' };
  }

  const trimmedName = name.trim();

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
