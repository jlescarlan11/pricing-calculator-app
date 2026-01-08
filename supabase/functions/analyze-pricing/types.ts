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

export interface CalculationResult {
  totalCost: number;
  costPerUnit: number;
  recommendedPrice: number;
  profitMarginPercent: number;
  breakdown: {
    ingredients: number;
    labor: number;
    overhead: number;
  };
}

export interface AnalyzePricingRequest {
  input: CalculationInput;
  results: CalculationResult;
}

export interface GeminiResponse {
  recommendations: string[];
}
