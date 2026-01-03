export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  cost: number;
}

export interface CalculationInput {
  productName: string;
  batchSize: number;
  ingredients: Ingredient[];
  laborCost: number;
  overhead: number;
  currentSellingPrice?: number;
}

export type PricingStrategy = 'markup' | 'margin';

export interface PricingConfig {
  strategy: PricingStrategy;
  value: number;
}

export interface CalculationResult {
  totalCost: number;
  costPerUnit: number;
  breakEvenPrice: number;
  recommendedPrice: number;
  profitPerBatch: number;
  profitPerUnit: number;
  profitMarginPercent: number;
  breakdown: {
    ingredients: number;
    labor: number;
    overhead: number;
  };
}

export interface SavedPreset {
  id: string;
  name: string;
  input: CalculationInput;
  config: PricingConfig;
  lastModified: number;
}
