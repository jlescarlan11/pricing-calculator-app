import { VariantInput } from '../types/variants';
import { ValidationError, validateIngredients } from './validation';

/**
 * Validates that the sum of variant quantities matches the batch size
 * and that all variants have valid positive quantities.
 */
export const validateVariantQuantities = (
  variants: VariantInput[],
  batchSize: number
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!variants || variants.length === 0) {
    errors.push({
      field: 'variants',
      message: 'At least one variant is required.',
    });
    return errors;
  }

  let totalQuantity = 0;

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
    } else {
      totalQuantity += variant.amount;
    }
  });

  // Only check total if individual quantities are valid numbers
  // Floating point tolerance of 0.01
  if (Math.abs(totalQuantity - batchSize) > 0.01) {
    errors.push({
      field: 'totalQuantity',
      message: `Total variant quantity (${totalQuantity.toFixed(2)}) must match batch size (${batchSize}).`,
    });
  }

  return errors;
};

/**
 * Validates individual variant data integrity including name, pricing,
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

  // 3. Validate Pricing
  if (variant.pricingValue === null || variant.pricingValue === undefined || isNaN(variant.pricingValue)) {
     errors.push({
      field: `variants[${index}].pricingValue`,
      message: 'Please enter a pricing value.',
    });
  } else {
    if (variant.pricingStrategy === 'markup') {
        if (variant.pricingValue < 0) {
            errors.push({
                field: `variants[${index}].pricingValue`,
                message: 'Markup cannot be negative.',
            });
        }
    } else if (variant.pricingStrategy === 'margin') {
        if (variant.pricingValue < 0 || variant.pricingValue >= 100) {
             errors.push({
                field: `variants[${index}].pricingValue`,
                message: 'Margin must be between 0% and 100%.',
            });
        }
    }
  }

  // 4. Validate Additional Ingredients
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

interface QuantityAllocation {
  totalAllocated: number;
  remaining: number;
  isOverAllocated: boolean;
  isFullyAllocated: boolean;
}

/**
 * Computes allocation status for UI feedback.
 */
export const getQuantityAllocation = (
  variants: VariantInput[],
  batchSize: number
): QuantityAllocation => {
  const totalAllocated = variants.reduce((sum, v) => sum + (v.amount || 0), 0);
  // Round to avoid floating point issues
  const roundedTotal = Math.round(totalAllocated * 100) / 100;
  const roundedBatch = Math.round(batchSize * 100) / 100;
  
  const remaining = roundedBatch - roundedTotal;
  
  return {
    totalAllocated: roundedTotal,
    remaining: Math.round(remaining * 100) / 100,
    isOverAllocated: roundedTotal > roundedBatch,
    isFullyAllocated: Math.abs(roundedTotal - roundedBatch) < 0.01
  };
};
