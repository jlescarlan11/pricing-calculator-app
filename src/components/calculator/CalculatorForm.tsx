import React, { useState, useEffect } from 'react';
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
import { useSessionStorage, useDebounce } from '../../hooks';
import { performFullCalculation } from '../../utils/calculations';
import { 
  validateProductName, 
  validateBatchSize, 
  validateIngredients, 
  validatePositiveNumber,
} from '../../utils/validation';
import type { 
  CalculationInput, 
  PricingConfig, 
  CalculationResult, 
  Ingredient 
} from '../../types/calculator';

const SESSION_STORAGE_KEY = 'pricing_calculator_draft';

const initialInput: CalculationInput = {
  productName: '',
  batchSize: 1,
  ingredients: [{ id: crypto.randomUUID(), name: '', amount: 0, cost: 0 }],
  laborCost: 0,
  overhead: 0,
};

const initialConfig: PricingConfig = {
  strategy: 'markup',
  value: 50,
};

interface CalculatorFormProps {
  onCalculate: (result: CalculationResult, input: CalculationInput, config: PricingConfig) => void;
  onReset?: () => void;
  initialInput?: CalculationInput;
  initialConfig?: PricingConfig;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({ 
  onCalculate,
  onReset,
  initialInput: propInitialInput,
  initialConfig: propInitialConfig
}) => {
  // Persistence using sessionStorage
  const [draft, setDraft] = useSessionStorage<{
    input: CalculationInput;
    config: PricingConfig;
  }>(SESSION_STORAGE_KEY, {
    input: initialInput,
    config: initialConfig,
  });

  // Use props if provided, otherwise draft (sessionStorage)
  const [input, setInput] = useState<CalculationInput>(propInitialInput || draft.input);
  const [config, setConfig] = useState<PricingConfig>(propInitialConfig || draft.config);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  // Auto-save to sessionStorage with a small delay to avoid loops
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDraft({ input, config });
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [input, config, setDraft]);

  // Debounced input for real-time background calculations (if we wanted to show previews)
  const debouncedInput = useDebounce(input, 500);
  const debouncedConfig = useDebounce(config, 500);

  // Handlers for Input
  const handleProductInfoChange = (field: 'productName' | 'batchSize' | 'businessName', value: string | number) => {
    setInput(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleIngredientUpdate = (id: string, field: keyof Ingredient, value: string | number) => {
    setInput(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => 
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    }));
    // Clear related error
    const errorKey = `ingredients.${id}.${field}`;
    if (errors[errorKey] || errors['ingredients']) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      delete newErrors['ingredients'];
      setErrors(newErrors);
    }
  };

  const handleAddIngredient = () => {
    setInput(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { id: crypto.randomUUID(), name: '', amount: 0, cost: 0 }
      ]
    }));
  };

  const handleRemoveIngredient = (id: string) => {
    setInput(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.id !== id)
    }));
  };

  const handleLaborChange = (value: number) => {
    setInput(prev => ({ ...prev, laborCost: value }));
    if (errors['laborCost']) {
      const newErrors = { ...errors };
      delete newErrors['laborCost'];
      setErrors(newErrors);
    }
  };

  const handleOverheadChange = (value: number) => {
    setInput(prev => ({ ...prev, overhead: value }));
    if (errors['overhead']) {
      const newErrors = { ...errors };
      delete newErrors['overhead'];
      setErrors(newErrors);
    }
  };

  const handlePricingChange = (strategy: PricingConfig['strategy'], value: number) => {
    setConfig({ strategy, value });
  };

  const handleCurrentPriceChange = (value?: number) => {
    setInput(prev => ({ ...prev, currentSellingPrice: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameErr = validateProductName(input.productName);
    if (nameErr) newErrors.productName = nameErr.message;

    const batchErr = validateBatchSize(input.batchSize);
    if (batchErr) newErrors.batchSize = batchErr.message;

    const ingErrs = validateIngredients(input.ingredients);
    ingErrs.forEach(err => {
      // Mapping field like "ingredients[0].name" to our local state keys
      // Extract index and field from "ingredients[index].field"
      const match = err.field.match(/ingredients\[(\d+)\]\.(\w+)/);
      if (match) {
        const index = parseInt(match[1]);
        const field = match[2];
        const id = input.ingredients[index].id;
        newErrors[`ingredients.${id}.${field}`] = err.message;
      } else {
        newErrors[err.field] = err.message;
      }
    });

    validatePositiveNumber(input.laborCost, 'Labor cost');
    // Note: Labor can be 0 if the owner doesn't pay themselves (though we advise against it)
    // The utility validatePositiveNumber checks > 0. If 0 is allowed, we'd need another utility.
    // For MVP, let's allow 0 but maybe warn. The utility currently returns error for 0.
    // Let's only validate if it's less than 0 or NaN.
    if (input.laborCost < 0 || isNaN(input.laborCost)) {
      newErrors.laborCost = 'Labor cost must be a valid number.';
    }

    if (input.overhead < 0 || isNaN(input.overhead)) {
      newErrors.overhead = 'Overhead must be a valid number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = async () => {
    if (!validateForm()) {
      // Scroll to first error? For now just stop.
      return;
    }

    setIsCalculating(true);
    
    // Skip artificial delay in test environment
    if (import.meta.env.MODE !== 'test') {
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    const result = performFullCalculation(input, config);
    onCalculate(result, input, config);
    setIsCalculating(false);
    
    // Smooth scroll to top or results area? 
    // Parent will handle showing results.
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear the form? This will remove all your progress.')) {
      setInput(initialInput);
      setConfig(initialConfig);
      setErrors({});
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      if (onReset) onReset();
    }
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
            onClick={handleReset} 
            className="flex-1 sm:flex-none flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Clear
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCalculate} 
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
                    onUpdate={handleIngredientUpdate}
                    onRemove={handleRemoveIngredient}
                    onAdd={handleAddIngredient}
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
                onClick={handleAddIngredient}
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
              performFullCalculation(debouncedInput, debouncedConfig).costPerUnit
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
              onClick={handleCalculate}
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
