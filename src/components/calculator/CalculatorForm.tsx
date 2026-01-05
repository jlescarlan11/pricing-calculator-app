import React, { useMemo } from 'react';
import { Plus, Calculator, Trash2, RefreshCcw, Package } from 'lucide-react';
import {
  ProductInfo,
  IngredientRow,
  LaborCost,
  OverheadCost,
  PricingStrategy,
  CurrentPrice,
} from './index';
import { VariantBlock } from './VariantBlock';
import { SavePresetButton } from '../presets/SavePresetButton';
import { Button, Card, Switch } from '../shared';
import { performFullCalculation } from '../../utils/calculations';
import type { CalculationInput, PricingConfig, Ingredient, Variant } from '../../types/calculator';

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
  onOpenPresets: () => void;

  // Variant Actions
  onSetHasVariants: (enabled: boolean) => void;
  onAddVariant: () => void;
  onRemoveVariant: (id: string) => void;
  onUpdateVariant: (id: string, updates: Partial<Variant>) => void;
  onUpdateVariantIngredient: (
    variantId: string,
    ingredientId: string,
    field: keyof Ingredient,
    value: string | number
  ) => void;
  onAddVariantIngredient: (variantId: string) => void;
  onRemoveVariantIngredient: (variantId: string, ingredientId: string) => void;
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
  onOpenPresets,
  onSetHasVariants,
  onAddVariant,
  onRemoveVariant,
  onUpdateVariant,
  onUpdateVariantIngredient,
  onAddVariantIngredient,
  onRemoveVariantIngredient,
}) => {
  // Local state for UI only (like which ingredient is being focused, or hover states)
  // But business logic state is now passed as props.

  const handleProductInfoChange = (
    field: 'productName' | 'batchSize' | 'businessName',
    value: string | number
  ) => {
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
    (input?.productName?.trim()?.length || 0) >= 3 &&
    (input?.batchSize || 0) >= 1 &&
    (input?.ingredients?.length || 0) > 0 &&
    input?.ingredients?.every((ing) => (ing?.name?.trim() || '') !== '' && (ing?.cost || 0) > 0);

  const getValidationFeedback = () => {
    if (isFormValid) return { message: 'Ready to calculate', color: 'text-moss' };

    const hasName = (input?.productName?.trim()?.length || 0) >= 3;
    const hasIngredients = (input?.ingredients?.length || 0) > 0;
    const ingredientsComplete =
      hasIngredients &&
      input?.ingredients?.every((ing) => (ing?.name?.trim() || '') !== '' && (ing?.cost || 0) > 0);
    const hasBatchSize = (input?.batchSize || 0) >= 1;

    if (hasName && hasIngredients && !ingredientsComplete)
      return { message: 'Almost there! Complete your ingredients', color: 'text-clay' };
    if (hasName && !hasIngredients)
      return { message: 'Looking good! Add some ingredients', color: 'text-clay' };
    if (!hasName) return { message: 'Start by naming your product', color: 'text-ink-500' };
    if (!hasBatchSize) return { message: 'Set your batch size', color: 'text-clay' };

    return { message: 'Almost there...', color: 'text-ink-500' };
  };

  const feedback = getValidationFeedback();

  // Calculate remaining batch for variants
  const totalVariantBatch = input?.variants?.reduce((sum, v) => sum + v.batchSize, 0) || 0;
  const rawRemainingBatch = (input?.batchSize || 0) - totalVariantBatch;
  const remainingBatch = Math.max(0, rawRemainingBatch);

  // Perform calculation to get live previews for variants
  const calculationResult = useMemo(
    () => performFullCalculation(input, config),
    [input, config]
  );

  return (
    <div className="flex flex-col gap-2xl w-full pb-4xl">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-lg px-lg sm:px-0">
        <div>
          <h2 className="text-2xl text-ink-900">Calculator</h2>
          <div className="flex items-center gap-sm mt-xs">
            <div
              className={`w-2 h-2 rounded-full ${isFormValid ? 'bg-moss' : 'bg-border-base'} transition-colors duration-500`}
            />
            <p className={`text-sm font-medium transition-colors duration-500 ${feedback.color}`}>
              {feedback.message}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-sm w-full sm:w-auto">
          <Button
            variant="ghost"
            onClick={onOpenPresets}
            className="flex-1 sm:flex-none flex items-center gap-sm text-clay hover:bg-clay/5"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Saved Products</span>
            <span className="sm:hidden">Presets</span>
          </Button>
          <div className="hidden sm:block h-6 w-px bg-border-subtle mx-xs" />
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
          businessName={input?.businessName}
          productName={input?.productName || ''}
          batchSize={input?.batchSize || 0}
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
                {input?.ingredients?.length || 0} item{input?.ingredients?.length !== 1 ? 's' : ''}
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
              {input?.ingredients?.map((ing, index) => (
                <IngredientRow
                  key={ing.id}
                  ingredient={ing}
                  index={index}
                  isOnlyRow={input?.ingredients?.length === 1}
                  onUpdate={onUpdateIngredient}
                  onRemove={onRemoveIngredient}
                  onAdd={onAddIngredient}
                  autoFocus={index === (input?.ingredients?.length || 0) - 1 && index > 0}
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
                variant="dashed"
                onClick={onAddIngredient}
                className="w-full flex items-center justify-center gap-sm"
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
            value={input?.laborCost || 0}
            onChange={handleLaborChange}
            error={errors.laborCost}
          />

          <OverheadCost
            value={input?.overhead || 0}
            batchSize={input?.batchSize || 1}
            onChange={handleOverheadChange}
            error={errors.overhead}
          />
        </div>

        <div className="h-px bg-border-subtle" role="separator" />

        {/* Section 4: Base Pricing Strategy & Current Price (Always Visible) */}
        <PricingStrategy
          strategy={config.strategy}
          value={config.value}
          costPerUnit={calculationResult?.costPerUnit || 0}
          onChange={handlePricingChange}
        />

        <div className="h-px bg-border-subtle" role="separator" />

        <CurrentPrice value={input.currentSellingPrice} onChange={handleCurrentPriceChange} />

        <div className="h-px bg-border-subtle" role="separator" />

        {/* Section 5: Variants Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-ink-900">Variants</h3>
            <p className="text-sm text-ink-500">Create product variations from this base recipe</p>
          </div>
          <Switch
            checked={!!input.hasVariants}
            onChange={onSetHasVariants}
            label="Enable Variants"
          />
        </div>

        {errors.variants && (
          <div className="p-md bg-rust/10 text-rust text-sm rounded-md border border-rust/20">
            {errors.variants}
          </div>
        )}

        {input.hasVariants && (
          <div className="space-y-xl animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Base Variant Block (Read Only) with Visual Allocation */}
            <Card className="bg-surface/50 border-border-subtle">
              <div className="flex flex-col gap-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-ink-900">
                      {input.productName || 'Base Product'} (Base)
                    </h4>
                    <p className="text-sm text-ink-500">Remaining Base Batch</p>
                  </div>
                  <div className="text-2xl font-bold text-ink-900 tabular-nums">
                    {remainingBatch} <span className="text-sm font-normal text-ink-500">units</span>
                  </div>
                </div>

                {/* Visual Allocation Bar */}
                <div className="space-y-sm">
                  <div className="flex justify-between text-[10px] font-bold text-ink-500 uppercase tracking-widest">
                    <span>Batch Allocation</span>
                    <span>
                      {totalVariantBatch} / {input.batchSize} Units allocated
                    </span>
                  </div>
                  <div className="h-4 w-full bg-border-subtle rounded-lg overflow-hidden flex border border-border-subtle shadow-inner">
                    <div
                      className="h-full bg-clay transition-all duration-500 flex items-center justify-center text-[8px] text-white font-bold"
                      style={{ width: `${(remainingBatch / (input.batchSize || 1)) * 100}%` }}
                    >
                      {remainingBatch > 0 && 'BASE'}
                    </div>
                    {input.variants?.map((v, i) => (
                      <div
                        key={v.id}
                        className={`h-full transition-all duration-500 flex items-center justify-center text-[8px] text-white font-bold border-l border-white/20 ${i % 2 === 0 ? 'bg-moss' : 'bg-ink-700'}`}
                        style={{ width: `${(v.batchSize / (input.batchSize || 1)) * 100}%` }}
                      >
                        {v.batchSize > (input.batchSize || 0) * 0.1 && `V${i + 1}`}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-md items-center text-[10px] font-medium text-ink-500">
                    <div className="flex items-center gap-xs">
                      <div className="w-2 h-2 rounded-full bg-clay" />
                      <span>Base ({remainingBatch})</span>
                    </div>
                    {input.variants?.map((v, i) => (
                      <div key={v.id} className="flex items-center gap-xs">
                        <div
                          className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-moss' : 'bg-ink-700'}`}
                        />
                        <span>
                          {v.name || `Variant ${i + 1}`} ({v.batchSize})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Variants List */}
            {input.variants?.map((variant, index) => {
              const variantResult = calculationResult.variantResults?.find(
                (r) => r.id === variant.id
              );
              const variantCostPerUnit = variantResult?.costPerUnit || 0;

              return (
                <VariantBlock
                  key={variant.id}
                  variant={variant}
                  index={index}
                  remainingBatch={rawRemainingBatch}
                  costPerUnit={variantCostPerUnit}
                  onUpdate={onUpdateVariant}
                  onRemove={onRemoveVariant}
                  onUpdateIngredient={onUpdateVariantIngredient}
                  onAddIngredient={onAddVariantIngredient}
                  onRemoveIngredient={onRemoveVariantIngredient}
                  errors={errors}
                />
              );
            })}

            {/* Add Variant Button */}
            <Button
              variant="dashed"
              onClick={onAddVariant}
              disabled={remainingBatch <= 0}
              className="w-full py-lg flex items-center justify-center gap-sm"
            >
              <Plus className="w-5 h-5" />
              {remainingBatch > 0 ? 'Add Variant' : 'No Batch Capacity Remaining'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
