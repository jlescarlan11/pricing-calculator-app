export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  cost: number;
}

export interface CalculationInput {
  businessName?: string;
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

export interface Preset {
  id: string;
  userId?: string;
  name: string;
  presetType: 'default' | 'variant';
  baseRecipe: CalculationInput;
  variants: any[];
  pricingConfig: PricingConfig;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt?: string | null;
}
