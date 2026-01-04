import type { Ingredient, PricingStrategy, CalculationResult } from './calculator';

/**
 * Models user-defined variant configuration.
 * Includes identifiers, quantities, additional ingredients and labor,
 * and pricing strategy details.
 */
export interface VariantInput {
  id: string;
  name: string; // e.g., "Regular", "Large", "Sampler Pack"
  amount: number; // Multiplier or quantity relative to batch
  unit: string; // e.g., "pc", "box", "kg"
  additionalIngredients: Ingredient[];
  additionalLabor: number;
  currentSellingPrice: number | null;
}

/**
 * Represents the computed output for each variant.
 * Covers cost breakdowns, recommended pricing, profit values, and margin percentages.
 */
export interface VariantCalculation extends CalculationResult {
  variantId: string;
  baseCost: number; // Cost allocated from base recipe
  additionalCost: number; // Cost from variant-specific additions
}

/**
 * Common fields for all preset types, aligning with the database schema.
 */
export interface BasePreset {
  id: string;
  user_id: string;
  name: string;
  ingredients: Ingredient[];
  batch_size: number;
  labor_cost: number;
  overhead_cost: number;
  created_at: string | null;
  updated_at: string | null;
  last_synced_at: string | null;
}

/**
 * Unified Preset type for both single products and products with variants.
 * 'variants' is now an optional array. If empty or null, it treats the product as a single base product.
 * 'preset_type' is kept for database compatibility but is less strict in the application model.
 */
export interface Preset extends BasePreset {
  preset_type: 'single' | 'variants';
  pricing_strategy: PricingStrategy;
  pricing_value: number;
  current_selling_price: number | null;
  variants: VariantInput[];
}

