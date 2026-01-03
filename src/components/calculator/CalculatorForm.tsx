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
    <div className="flex flex-col gap-3xl w-full pb-4xl">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-lg px-lg sm:px-0">
        <div>
          <h2 className="text-2xl text-ink-900">Calculator</h2>
          <p className="text-sm text-ink-500 font-medium">Define your production costs with intention.</p>
        </div>
        <div className="flex items-center gap-sm w-full sm:w-auto">
          <SavePresetButton 
            input={input}
            config={config}
            disabled={!isFormValid}
            className="flex-1 sm:flex-none"
          />
          <Button 
            variant="secondary" 
            onClick={onReset} 
            className="flex-1 sm:flex-none flex items-center gap-sm"
          >
            <RefreshCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button 
            variant="primary" 
            onClick={onCalculate} 
            isLoading={isCalculating}
            className="flex-1 sm:flex-none flex items-center gap-sm"
          >
            <Calculator className="w-4 h-4" />
            Calculate
          </Button>
        </div>
      </div>

                  <div className="flex flex-col space-y-xl">

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

            

                    <div className="h-px bg-border-subtle" role="separator" />

            

                    {/* Section 2: Ingredients */}

                    <Card 

                      title={

                        <div className="flex items-center justify-between w-full">

                          <h3 className="text-lg text-ink-900">Ingredients</h3>

                          <span className="text-xs font-bold text-ink-500 uppercase tracking-widest">

                            {input.ingredients.length} item{input.ingredients.length !== 1 ? 's' : ''}

                          </span>

                        </div>

                      }

                    >

                      <div className="space-y-lg">

                        {errors.ingredients && (

                          <div className="p-md bg-rust/10 text-rust text-sm rounded-md border border-rust/20 flex items-center gap-sm animate-in fade-in slide-in-from-left-2">

                            <Trash2 className="w-4 h-4" />

                            <span className="font-medium">{errors.ingredients}</span>

                          </div>

                        )}

                        

                                                <div className="flex flex-col divide-y divide-[#E6E4E1]">

                        

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

                        

                                    

                        

                                                <div className="pt-lg">

                        

                          <Button
                            variant="ghost"
                            onClick={onAddIngredient}
                            className="w-full flex items-center justify-center gap-sm text-ink-700 hover:text-clay hover:bg-clay/5 border-2 border-dashed border-border-base transition-all duration-300"
                          >
                            <Plus className="w-5 h-5" />
                            Add Item
                          </Button>

                        

                                                </div>

                        

                        

                      </div>

                    </Card>

            

                    <div className="h-px bg-border-subtle" role="separator" />

            

                    {/* Section 3: Costs */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">

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

            

                    <div className="h-px bg-border-subtle" role="separator" />

            

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

            

                    <div className="h-px bg-border-subtle" role="separator" />

            

                    {/* Section 5: Current Price Comparison */}

                    <CurrentPrice 

                      value={input.currentSellingPrice}

                      onChange={handleCurrentPriceChange}

                    />

            

                    {/* Floating Mobile Action */}

                    <div className="fixed bottom-lg right-lg lg:hidden z-30">

                      <Button

                        variant="primary"

                        onClick={onCalculate}

                        isLoading={isCalculating}

                        className="rounded-round w-16 h-16 shadow-level-3 flex items-center justify-center p-0"

                        aria-label="Calculate Results"

                      >

                        <Calculator className="w-8 h-8" />

                      </Button>

                    </div>

                  </div>
    </div>
  );
};