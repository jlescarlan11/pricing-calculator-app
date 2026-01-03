import type { Ingredient, PricingStrategy } from '../types/calculator';

/**
 * Rounds a number to a specified number of decimal places.
 * Used internally to ensure consistent currency formatting.
 * 
 * @param value - The number to round
 * @param decimals - The number of decimal places (default 2)
 * @returns The rounded number
 */
const round = (value: number, decimals: number = 2): number => {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
};

/**
 * Calculates the total cost of all ingredients.
 * Safely handles empty arrays and validates that costs are non-negative.
 * 
 * @param ingredients - Array of ingredients
 * @returns Total cost of ingredients, rounded to 2 decimals
 */
export const calculateTotalIngredientCost = (ingredients: Ingredient[]): number => {
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return 0;
  }

  const total = ingredients.reduce((sum, ingredient) => {
    const cost = Number(ingredient.cost);
    if (isNaN(cost) || cost < 0) {
      return sum; // Skip invalid or negative costs
    }
    return sum + cost;
  }, 0);

  return round(total);
};

/**
 * Calculates the cost per unit by dividing total cost by batch size.
 * Handles division by zero and negative batch sizes.
 * 
 * @param totalCost - The total cost of production
 * @param batchSize - The number of units in the batch
 * @returns Cost per unit, rounded to 2 decimals
 */
export const calculateCostPerUnit = (totalCost: number, batchSize: number): number => {
  if (batchSize <= 0) {
    return 0; // Avoid division by zero or negative batch size
  }
  if (totalCost < 0) {
    return 0;
  }
  return round(totalCost / batchSize);
};

/**
 * Calculates the selling price based on Markup percentage.
 * Formula: Cost * (1 + Markup% / 100)
 * 
 * @param costPerUnit - The cost to produce one unit
 * @param markupPercent - The desired markup percentage
 * @returns Recommended selling price, rounded to 2 decimals
 */
export const calculateMarkupPrice = (costPerUnit: number, markupPercent: number): number => {
  if (costPerUnit < 0 || markupPercent < 0) {
    return 0;
  }
  const price = costPerUnit * (1 + markupPercent / 100);
  return round(price);
};

/**
 * Calculates the selling price based on Profit Margin percentage.
 * Formula: Cost / (1 - Margin% / 100)
 * 
 * @param costPerUnit - The cost to produce one unit
 * @param marginPercent - The desired profit margin percentage
 * @returns Recommended selling price, rounded to 2 decimals. Returns 0 if margin is >= 100.
 */
export const calculateMarginPrice = (costPerUnit: number, marginPercent: number): number => {
  if (costPerUnit < 0 || marginPercent < 0) {
    return 0;
  }
  if (marginPercent >= 100) {
    // Impossible to achieve 100% or more margin (cost would need to be 0 or price infinite)
    // Returning 0 or handling as error. Per instructions: "explicitly guarded against"
    return 0;
  }
  const price = costPerUnit / (1 - marginPercent / 100);
  return round(price);
};

/**
 * Calculates the recommended selling price based on the selected strategy.
 * 
 * @param costPerUnit - The cost to produce one unit
 * @param strategy - The pricing strategy ('markup' or 'margin')
 * @param value - The percentage value for the strategy
 * @returns Recommended selling price, rounded to 2 decimals
 */
export const calculateRecommendedPrice = (
  costPerUnit: number,
  strategy: PricingStrategy,
  value: number
): number => {
  if (strategy === 'markup') {
    return calculateMarkupPrice(costPerUnit, value);
  } else if (strategy === 'margin') {
    return calculateMarginPrice(costPerUnit, value);
  }
  return 0;
};

/**
 * Calculates the actual profit margin percentage given a cost and selling price.
 * Formula: ((Selling Price - Cost) / Selling Price) * 100
 * 
 * @param costPerUnit - The cost to produce one unit
 * @param sellingPrice - The actual selling price
 * @returns Profit margin percentage, rounded to 2 decimals
 */
export const calculateProfitMargin = (costPerUnit: number, sellingPrice: number): number => {
  if (sellingPrice <= 0) {
    return 0;
  }
  // Formula: ((Selling Price - Cost) / Selling Price) * 100
  const margin = ((sellingPrice - costPerUnit) / sellingPrice) * 100;
  return round(margin);
};

/**
 * Performs a complete calculation based on all inputs and configuration.
 * 
 * @param input - The calculation inputs (ingredients, labor, overhead, batch size)
 * @param config - The pricing strategy configuration
 * @returns A complete CalculationResult object
 */
export const performFullCalculation = (
  input: import('../types/calculator').CalculationInput,
  config: import('../types/calculator').PricingConfig
): import('../types/calculator').CalculationResult => {
  const ingredientCost = calculateTotalIngredientCost(input.ingredients);
  const totalCost = round(ingredientCost + input.laborCost + input.overhead);
  const costPerUnit = calculateCostPerUnit(totalCost, input.batchSize);
  
  const recommendedPrice = calculateRecommendedPrice(
    costPerUnit,
    config.strategy,
    config.value
  );

  const profitPerUnit = round(recommendedPrice - costPerUnit);
  const profitPerBatch = round(profitPerUnit * input.batchSize);
  const profitMarginPercent = calculateProfitMargin(costPerUnit, recommendedPrice);

  return {
    totalCost,
    costPerUnit,
    breakEvenPrice: costPerUnit, // At 0% profit, price equals cost per unit
    recommendedPrice,
    profitPerBatch,
    profitPerUnit,
    profitMarginPercent,
    breakdown: {
      ingredients: ingredientCost,
      labor: input.laborCost,
      overhead: input.overhead,
    },
  };
};
