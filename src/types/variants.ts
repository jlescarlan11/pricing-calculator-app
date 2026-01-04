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
  pricingStrategy: PricingStrategy;
  pricingValue: number;
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
 * Preset for a single product with a direct pricing strategy.
 * Enforces preset_type: 'single', contains no variants, and requires valid pricing.
 */
export interface SinglePreset extends BasePreset {
  preset_type: 'single';
  pricing_strategy: PricingStrategy;
  pricing_value: number;
  current_selling_price: number | null;
  variants: null;
}

/**
 * Preset with multiple variants, each with its own pricing strategy.
 * Enforces preset_type: 'variants', contains a list of VariantInput, 
 * and sets all single-product pricing fields to null.
 */
export interface VariantsPreset extends BasePreset {
  preset_type: 'variants';
  pricing_strategy: null;
  pricing_value: null;
  current_selling_price: null;
  variants: VariantInput[];
}

/**
 * Discriminated union for all preset types.
 */
export type Preset = SinglePreset | VariantsPreset;

/**
 * Type-safe guard to check if a preset is a SinglePreset.
 */
export function isSinglePreset(preset: Preset): preset is SinglePreset {
  return preset.preset_type === 'single';
}

/**
 * Type-safe guard to check if a preset is a VariantsPreset.
 */
export function isVariantsPreset(preset: Preset): preset is VariantsPreset {
  return preset.preset_type === 'variants';
}