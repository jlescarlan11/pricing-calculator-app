import type { Ingredient, PricingStrategy } from './calculator';
import type { Preset } from './variants';

/**
 * Represents the legacy preset format used in Phase 1.
 * This structure was used before the introduction of variants and the flattened schema.
 * It encapsulates inputs and configuration into nested objects.
 */
export interface Phase1Preset {
  /** Unique identifier for the preset */
  id: string;
  /** User-defined name for the saved calculation */
  name: string;
  /** Core calculation inputs */
  input: {
    /** Optional business name */
    businessName?: string;
    /** Name of the product being priced */
    productName: string;
    /** Total number of units produced in a batch */
    batchSize: number;
    /** List of ingredients and their costs */
    ingredients: Ingredient[];
    /** Total labor cost for the batch */
    laborCost: number;
    /** Total overhead/operating costs for the batch */
    overhead: number;
    /** The price the user is currently selling the product at, if any */
    currentSellingPrice?: number;
  };
  /** Pricing strategy configuration */
  config: {
    /** Whether to use markup or profit margin calculation */
    strategy: PricingStrategy;
    /** The percentage value for the chosen strategy */
    value: number;
  };
  /** Unix timestamp of the last time this preset was modified */
  lastModified: number;
}

/**
 * Reports the outcome of a migration run from Phase 1 to Phase 2 schema.
 * Provides detailed statistics and the resulting data for verification.
 */
export interface MigrationResult {
  /** Indicates if the overall migration process was completed without fatal errors */
  success: boolean;
  /** Total number of presets successfully transformed to the Phase 2 schema */
  migratedCount: number;
  /** Total number of presets that could not be migrated due to validation errors or corruption */
  failedCount: number;
  /** Collection of human-readable error messages detailing why specific presets failed to migrate */
  errors: string[];
  /** The collection of fully migrated presets in the modern Preset union type format */
  migratedPresets: Preset[];
}
