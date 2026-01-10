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
  variantResults?: VariantResult[];
}

export interface VariantResult {
  id: string;
  name: string;
  totalCost: number;
  costPerUnit: number;
  recommendedPrice: number;
  profitMarginPercent: number;
  batchSize: number;
  currentSellingPrice?: number;
}

export interface AnalyzePricingRequest {
  input: CalculationInput;
  results: CalculationResult;
  competitors?: {
    competitorName: string;
    competitorPrice: number;
    updatedAt?: string;
  }[];
}

export interface VariantRecommendation {
  variantId: string;
  suggestedMarginValue: number;
}

export interface GeminiResponse {
  recommendations: string[];
  suggestedMarginValue: number;
  variantRecommendations?: VariantRecommendation[];
}
