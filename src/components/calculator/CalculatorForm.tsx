import React from 'react';
import { Plus, Calculator, Trash2, RefreshCcw } from 'lucide-react';
import { 
  ProductInfo, 
  IngredientRow, 
  LaborCost, 
  OverheadCost, 
  PricingStrategy, 
  CurrentPrice 
} from './index';
import { SavePresetButton } from '../presets/SavePresetButton';
import { Button, Card } from '../shared';
import { performFullCalculation } from '../../utils/calculations';
import type { 
  CalculationInput, 
  PricingConfig, 
  Ingredient 
} from '../../types/calculator';

interface CalculatorFormProps {
  input: CalculationInput;
  config: PricingConfig;
  errors: Record<string, string>;
  isCalculating: boolean;
  onUpdateInput: (updates: Partial<CalculationInput>) => void;
  onUpdateIngredient: (id: string, field: keyof Ingredient, value: string | number) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (id: string) => void;
  onUpdateConfig: (updates: Partial<PricingConfig>) => void;
  onCalculate: () => void;
  onReset: () => void;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({ 
  input,
  config,
  errors,
  isCalculating,
  onUpdateInput,
  onUpdateIngredient,
  onAddIngredient,
  onRemoveIngredient,
  onUpdateConfig,
  onCalculate,
  onReset,
}) => {
  // Local state for UI only (like which ingredient is being focused, or hover states)
  // But business logic state is now passed as props.

  const handleProductInfoChange = (field: 'productName' | 'batchSize' | 'businessName', value: string | number) => {
    onUpdateInput({ [field]: value });
  };

  const handleLaborChange = (value: number) => {
    onUpdateInput({ laborCost: value });
  };

  const handleOverheadChange = (value: number) => {
    onUpdateInput({ overhead: value });
  };

  const handlePricingChange = (strategy: PricingConfig['strategy'], value: number) => {
    onUpdateConfig({ strategy, value });
  };

  const handleCurrentPriceChange = (value?: number) => {
    onUpdateInput({ currentSellingPrice: value });
  };

  const isFormValid = 
    input.productName.trim().length >= 3 && 
    input.batchSize >= 1 && 
    input.ingredients.length > 0 && 
    input.ingredients.every(ing => ing.name.trim() !== '' && ing.cost > 0);

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-20">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 sm:px-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cost Calculator</h2>
          <p className="text-sm text-gray-500">Enter your production details below to calculate profitability.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SavePresetButton 
            input={input}
            config={config}
            disabled={!isFormValid}
            className="flex-1 sm:flex-none"
          />
          <Button 
            variant="secondary" 
            onClick={onReset} 
            className="flex-1 sm:flex-none flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Clear
          </Button>
          <Button 
            variant="primary" 
            onClick={onCalculate} 
            isLoading={isCalculating}
            className="flex-1 sm:flex-none flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            <Calculator className="w-4 h-4" />
            Calculate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Product Info */}
          <ProductInfo 
            businessName={input.businessName}
            productName={input.productName}
            batchSize={input.batchSize}
            onChange={handleProductInfoChange}
            errors={{
              businessName: errors.businessName,
              productName: errors.productName,
              batchSize: errors.batchSize,
            }}
          />

          {/* Section 2: Ingredients */}
          <Card 
            title={
              <div className="flex items-center justify-between w-full">
                <h3 className="text-lg font-bold text-gray-900">Ingredients</h3>
                <span className="text-sm font-normal text-gray-500">
                  {input.ingredients.length} item(s)
                </span>
              </div>
            }
          >
            <div className="space-y-4">
              {errors.ingredients && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  {errors.ingredients}
                </div>
              )}
              
              <div className="space-y-4">
                {input.ingredients.map((ing, index) => (
                  <IngredientRow
                    key={ing.id}
                    ingredient={ing}
                    index={index}
                    isOnlyRow={input.ingredients.length === 1}
                    onUpdate={onUpdateIngredient}
                    onRemove={onRemoveIngredient}
                    onAdd={onAddIngredient}
                    autoFocus={index === input.ingredients.length - 1 && index > 0}
                    errors={{
                      name: errors[`ingredients.${ing.id}.name`],
                      amount: errors[`ingredients.${ing.id}.amount`],
                      cost: errors[`ingredients.${ing.id}.cost`],
                    }}
                  />
                ))}
              </div>

              <Button
                variant="secondary"
                onClick={onAddIngredient}
                className="w-full mt-4 border-dashed border-2 py-4 flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-600 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Ingredient
              </Button>
            </div>
          </Card>

          {/* Section 3: Costs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LaborCost 
              value={input.laborCost} 
              onChange={handleLaborChange}
              error={errors.laborCost}
            />
            <OverheadCost 
              value={input.overhead} 
              batchSize={input.batchSize}
              onChange={handleOverheadChange}
              error={errors.overhead}
            />
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          {/* Section 4: Pricing Strategy */}
          <PricingStrategy 
            strategy={config.strategy}
            value={config.value}
            costPerUnit={
              // Background calculation for preview
              performFullCalculation(input, config).costPerUnit
            }
            onChange={handlePricingChange}
          />

          {/* Section 5: Current Price Comparison */}
          <CurrentPrice 
            value={input.currentSellingPrice}
            onChange={handleCurrentPriceChange}
          />

          {/* Floating Mobile Action */}
          <div className="fixed bottom-6 right-6 lg:hidden z-30">
            <Button
              variant="primary"
              onClick={onCalculate}
              isLoading={isCalculating}
              className="rounded-full w-16 h-16 shadow-2xl flex items-center justify-center p-0"
              aria-label="Calculate Results"
            >
              <Calculator className="w-8 h-8" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};