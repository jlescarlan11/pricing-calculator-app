import type { VariantInput } from '../types/variants';
import { validateIngredients, type ValidationError } from './validation';

/**
 * Validates that all variants have valid positive quantities.
 */
export const validateVariantQuantities = (
  variants: VariantInput[]
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!variants) {
    return errors;
  }

  variants.forEach((variant, index) => {
    if (variant.amount === null || variant.amount === undefined || isNaN(variant.amount)) {
      errors.push({
        field: `variants[${index}].amount`,
        message: 'Please enter a valid quantity.',
      });
    } else if (variant.amount < 0.01) {
      errors.push({
        field: `variants[${index}].amount`,
        message: 'Quantity must be at least 0.01.',
      });
    }
  });

  return errors;
};

/**
 * Validates individual variant data integrity including name
 * and additional costs.
 */
export const validateVariantData = (variant: VariantInput, index: number): ValidationError[] => {
  const errors: ValidationError[] = [];

  // 1. Validate Name
  if (!variant.name || variant.name.trim() === '') {
    errors.push({
      field: `variants[${index}].name`,
      message: 'Please name this variant.',
    });
  } else if (variant.name.trim().length > 50) {
    errors.push({
      field: `variants[${index}].name`,
      message: 'Variant name should be under 50 characters.',
    });
  }

  // 2. Validate Additional Labor
  if (variant.additionalLabor < 0) {
    errors.push({
      field: `variants[${index}].additionalLabor`,
      message: 'Additional labor cost cannot be negative.',
    });
  }

  // 3. Validate Additional Ingredients
  if (variant.additionalIngredients && variant.additionalIngredients.length > 0) {
      const ingredientErrors = validateIngredients(variant.additionalIngredients);
      // Remap errors to include variant index context
      ingredientErrors.forEach(err => {
          // validateIngredients returns fields like 'ingredients[0].name' or 'ingredients'
          // We want 'variants[index].additionalIngredients[0].name'
          
          let newField = err.field;
          if (newField.startsWith('ingredients')) {
              newField = newField.replace('ingredients', `variants[${index}].additionalIngredients`);
          } else {
             // Fallback
              newField = `variants[${index}].additionalIngredients.${err.field}`;
          }

          errors.push({
              field: newField,
              message: err.message
          });
      });
  }

  return errors;
};

