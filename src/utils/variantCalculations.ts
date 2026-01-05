import type {
  CalculationInput,
  CalculationResult
} from '../types/calculator';
import {
  calculateTotalIngredientCost,
  calculateCostPerUnit,
  calculateRecommendedPrice,
  calculateProfitMargin
} from './calculations';

// Helper for rounding to 2 decimal places to match existing conventions
const round = (value: number, decimals: number = 2): number => {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
};

/**
 * Calculates a proportional cost based on the ratio of variant batch size to base batch size.
 * Formula: (baseTotal / baseBatchSize) * variantBatchSize
 * 
 * @param baseTotal - The total cost in the base recipe
 * @param baseBatchSize - The total batch size of the base recipe
 * @param variantBatchSize - The portion of the batch allocated to this variant
 * @returns The allocated cost for the variant, rounded to 2 decimals
 */
export const calculateProportionalCosts = (
  baseTotal: number,
  baseBatchSize: number,
  variantBatchSize: number
): number => {
  if (baseBatchSize <= 0) return 0;
  // Calculate unit cost from base, then multiply by variant size
  // (baseTotal / baseBatchSize) * variantBatchSize
  return round((baseTotal / baseBatchSize) * variantBatchSize);
};

export interface VariantCalculationResult extends CalculationResult {
  variantId: string;
  variantName: string;
}

/**
 * Performs cost and pricing calculations for all variants attached to a base product.
 * 
 * Logic:
 * 1. Validates that total variant batch sizes do not exceed base batch size.
 * 2. Allocates base costs (ingredients, labor, overhead) to each variant proportionally.
 * 3. Adds variant-specific costs.
 * 4. Computes per-unit results based on variant's specific pricing config.
 * 
 * @param input - The complete calculation input including base and variants
 * @returns Array of calculation results for each variant
 * @throws Error if total variant batch size exceeds base batch size
 */
export const performVariantCalculation = (
  input: CalculationInput
): VariantCalculationResult[] => {
  // Return empty if no variants enabled or present
  if (!input.hasVariants || !input.variants || input.variants.length === 0) {
    return [];
  }

  // Safety check for base batch size to avoid division by zero
  if (input.batchSize <= 0) {
    return [];
  }

  // Validate: Sum of variant batch sizes <= Base batch size
  const totalVariantBatchSize = input.variants.reduce((sum, v) => sum + v.batchSize, 0);
  
  // Using a small epsilon for floating point comparison safety, though batch sizes should be integers/whole numbers usually.
  // Assuming strict inequality for safety.
  if (totalVariantBatchSize > input.batchSize) {
    throw new Error(`Total variant batch size (${totalVariantBatchSize}) exceeds base batch size (${input.batchSize}).`);
  }

  // 1. Compute total shared base costs
  const baseIngredientCost = calculateTotalIngredientCost(input.ingredients);
  const baseLaborCost = input.laborCost;
  const baseOverheadCost = input.overhead;

  return input.variants.map(variant => {
    // 2. Allocate base costs proportionally
    const allocatedIngredients = calculateProportionalCosts(baseIngredientCost, input.batchSize, variant.batchSize);
    const allocatedLabor = calculateProportionalCosts(baseLaborCost, input.batchSize, variant.batchSize);
    const allocatedOverhead = calculateProportionalCosts(baseOverheadCost, input.batchSize, variant.batchSize);

    // 3. Add variant-specific costs
    const variantSpecificIngredients = calculateTotalIngredientCost(variant.ingredients);
    const variantSpecificLabor = variant.laborCost;
    const variantSpecificOverhead = variant.overhead;

    const totalIngredients = round(allocatedIngredients + variantSpecificIngredients);
    const totalLabor = round(allocatedLabor + variantSpecificLabor);
    const totalOverhead = round(allocatedOverhead + variantSpecificOverhead);
    
    const totalCost = round(totalIngredients + totalLabor + totalOverhead);

    // 4. Calculate per-unit cost, recommended selling price, and profit
    // Note: Variant batch size is used as the divisor for its specific total cost
    const costPerUnit = calculateCostPerUnit(totalCost, variant.batchSize);
    
    const recommendedPrice = calculateRecommendedPrice(
      costPerUnit,
      variant.pricingConfig.strategy,
      variant.pricingConfig.value
    );

    const profitPerUnit = round(recommendedPrice - costPerUnit);
    const profitPerBatch = round(profitPerUnit * variant.batchSize);
    const profitMarginPercent = calculateProfitMargin(costPerUnit, recommendedPrice);
    
    // 5. Return structured result
    return {
      variantId: variant.id,
      variantName: variant.name,
      totalCost,
      costPerUnit,
      breakEvenPrice: costPerUnit, // Break-even is the cost per unit
      recommendedPrice,
      profitPerBatch,
      profitPerUnit,
      profitMarginPercent,
      breakdown: {
        ingredients: totalIngredients,
        labor: totalLabor,
        overhead: totalOverhead
      }
    };
  });
};
