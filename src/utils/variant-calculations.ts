import type { VariantInput, VariantCalculation } from '../types/variants';
import type { Ingredient, PricingStrategy } from '../types/calculator';
import {
  calculateTotalIngredientCost,
  calculateRecommendedPrice,
  calculateProfitMargin,
} from './calculations';

/**
 * Rounds a number to 2 decimal places.
 * Used for currency and consistent display.
 */
export const roundCurrency = (value: number): number => {
  return Number(Math.round(Number(value + 'e2')) + 'e-2');
};

/**
 * Allocates a share of the total base recipe cost to a variant
 * based on the variant's quantity relative to the base batch size.
 *
 * @param totalBaseCost - The total cost of the base recipe
 * @param batchSize - The total yield/size of the base recipe
 * @param variantAmount - The amount of base recipe used in this variant
 */
export const calculateBaseCostShare = (
  totalBaseCost: number,
  batchSize: number,
  variantAmount: number
): number => {
  if (batchSize <= 0) return 0;
  const baseCostPerUnit = totalBaseCost / batchSize;
  return roundCurrency(baseCostPerUnit * variantAmount);
};

/**
 * Calculates detailed costs, pricing, and profit for a single variant.
 * 
 * @param variant - The variant configuration
 * @param baseIngredients - Ingredients of the base recipe
 * @param baseLabor - Labor cost of the base recipe
 * @param baseOverhead - Overhead cost of the base recipe
 * @param batchSize - Total yield of the base recipe
 * @param pricingStrategy - The global pricing strategy
 * @param pricingValue - The global pricing value (markup or margin)
 */
export const calculateVariantCosts = (
  variant: VariantInput,
  baseIngredients: Ingredient[],
  baseLabor: number,
  baseOverhead: number,
  batchSize: number,
  pricingStrategy: PricingStrategy,
  pricingValue: number
): VariantCalculation => {
  // 1. Calculate Base Costs
  const totalBaseIngredientsCost = calculateTotalIngredientCost(baseIngredients);

  // 2. Allocate Base Cost Share to Variant
  // We calculate shares for each component to maintain breakdown accuracy
  const baseIngredientShare = calculateBaseCostShare(totalBaseIngredientsCost, batchSize, variant.amount);
  const baseLaborShare = calculateBaseCostShare(baseLabor, batchSize, variant.amount);
  const baseOverheadShare = calculateBaseCostShare(baseOverhead, batchSize, variant.amount);

  // 3. Calculate Additional Costs
  const additionalIngredientsCost = calculateTotalIngredientCost(variant.additionalIngredients);
  
  // 4. Sum Total Costs per Variant Unit
  const totalIngredientsCost = roundCurrency(baseIngredientShare + additionalIngredientsCost);
  const totalLaborCost = roundCurrency(baseLaborShare + variant.additionalLabor);
  const totalOverheadCost = roundCurrency(baseOverheadShare); // No additional overhead in current model

  const totalCostPerUnit = roundCurrency(totalIngredientsCost + totalLaborCost + totalOverheadCost);
  
  const baseCost = roundCurrency(baseIngredientShare + baseLaborShare + baseOverheadShare);
  const additionalCost = roundCurrency(additionalIngredientsCost + variant.additionalLabor);

  // 5. Calculate Pricing
  const recommendedPrice = calculateRecommendedPrice(
    totalCostPerUnit,
    pricingStrategy,
    pricingValue
  );

  // 6. Calculate Profits
  const profitPerUnit = roundCurrency(recommendedPrice - totalCostPerUnit);
  const profitMarginPercent = calculateProfitMargin(totalCostPerUnit, recommendedPrice);

  // Profit per Batch:
  // For the new model, "Profit per Batch" is ambiguous if we don't have allocation.
  // However, we can interpret it as "Profit if we sold a whole batch worth of THIS variant".
  // Or just "Profit per Unit" is what matters most now.
  // Let's keep the calculation as: profitPerUnit * (batchSize / variant.amount) 
  // This tells "If I converted my whole batch into this variant, how much would I make?"
  let profitPerBatch = 0;
  if (variant.amount > 0) {
    const unitsPerBatch = batchSize / variant.amount;
    profitPerBatch = roundCurrency(profitPerUnit * unitsPerBatch);
  }

  return {
    variantId: variant.id,
    baseCost,
    additionalCost,
    totalCost: totalCostPerUnit, // For variants, totalCost is per unit (the "unit" is the variant itself)
    costPerUnit: totalCostPerUnit,
    breakEvenPrice: totalCostPerUnit,
    recommendedPrice,
    profitPerUnit,
    profitMarginPercent,
    profitPerBatch,
    breakdown: {
      ingredients: totalIngredientsCost,
      labor: totalLaborCost,
      overhead: totalOverheadCost,
    },
  };
};

/**
 * Processes a list of variants and returns calculations for all of them.
 */
export const calculateAllVariants = (
  variants: VariantInput[],
  baseIngredients: Ingredient[],
  baseLabor: number,
  baseOverhead: number,
  batchSize: number,
  pricingStrategy: PricingStrategy,
  pricingValue: number
): VariantCalculation[] => {
  return variants.map((variant) =>
    calculateVariantCosts(variant, baseIngredients, baseLabor, baseOverhead, batchSize, pricingStrategy, pricingValue)
  );
};

/**
 * Sums the potential batch profit of all variants.
 * Note: This assumes the variants are alternative ways to sell the batch
 * and sums their potential (which might not be logically additive if they compete,
 * but satisfies the requirement to "return the summed profit").
 * 
 * If the intention is to sum the profit of a specific production plan (e.g. 5 of A, 10 of B),
 * that would require a different input structure (quantities of each variant).
 * Given the current types, this sums the "Profit Per Batch" metric calculated for each variant.
 */
export const getTotalBatchProfit = (calculations: VariantCalculation[]): number => {
  return calculations.reduce((sum, calc) => roundCurrency(sum + calc.profitPerBatch), 0);
};