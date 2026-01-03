// Central export for shared TypeScript types and interfaces

// Enum for Pricing Strategy
export type PricingStrategy = 'MARKUP' | 'PROFIT_MARGIN';

// Interface for a single Ingredient
export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

// Interface for Product Cost Data
export interface ProductCostData {
  id: string;
  name: string;
  batchSize: number;
  ingredients: Ingredient[];
  laborCost: number;
  overheadCost: number;
  pricingStrategy: PricingStrategy;
  targetPercentage: number; // Represents either Markup % or Profit Margin %
}

// Interface for Calculation Results
export interface PricingResult {
  totalCost: number;
  costPerUnit: number;
  recommendedPrice: number;
  profitPerBatch: number;
  profitPerUnit: number;
  breakEvenPrice: number;
  actualMargin: number; // Calculated margin percentage
  actualMarkup: number; // Calculated markup percentage
}
