import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { IngredientRow } from '../calculator/IngredientRow';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { calculateTotalIngredientCost } from '../../utils/calculations';
import type { VariantInput, VariantCalculation } from '../../types/variants';
import type { Ingredient } from '../../types/calculator';

interface VariantFormProps {
  variant: VariantInput;
  index: number;
  totalBatchSize: number;
  isOnlyVariant: boolean;
  onUpdate: (id: string, updates: Partial<VariantInput>) => void;
  onDelete: (id: string) => void;
  calculation: VariantCalculation;
  autoFocusName?: boolean;
}

export const VariantForm: React.FC<VariantFormProps> = ({
  variant,
  index,
  totalBatchSize,
  isOnlyVariant,
  onUpdate,
  onDelete,
  calculation,
  autoFocusName,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Helper to update specific fields
  const updateField = <K extends keyof VariantInput>(field: K, value: VariantInput[K]) => {
    onUpdate(variant.id, { [field]: value });
  };

  // Ingredient Handlers
  const handleIngredientUpdate = (ingredientId: string, field: keyof Ingredient, value: string | number) => {
    const updatedIngredients = variant.additionalIngredients.map((ing) =>
      ing.id === ingredientId ? { ...ing, [field]: value } : ing
    );
    updateField('additionalIngredients', updatedIngredients);
  };

  const handleIngredientRemove = (ingredientId: string) => {
    const updatedIngredients = variant.additionalIngredients.filter((ing) => ing.id !== ingredientId);
    updateField('additionalIngredients', updatedIngredients);
  };

  const handleIngredientAdd = () => {
    const newIngredient: Ingredient = {
      id: crypto.randomUUID(),
      name: '',
      amount: 0,
      amountUnit: 'g', // Default unit
      cost: 0,
      costUnit: 'kg', // Default unit
    };
    updateField('additionalIngredients', [...variant.additionalIngredients, newIngredient]);
  };

  // Derived Values
  const percentageOfBatch = totalBatchSize > 0 
    ? (variant.amount / totalBatchSize) * 100 
    : 0;

  const additionalIngredientsCost = calculateTotalIngredientCost(variant.additionalIngredients);

  // Margin Health Color
  const getMarginColor = (margin: number) => {
    if (margin >= 25) return 'success';
    if (margin >= 15) return 'warning';
    return 'danger';
  };

  return (
    <Card 
      className={`transition-all duration-300 ${isCollapsed ? 'opacity-80' : 'opacity-100'}`}
      noPadding
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-lg border-b border-border-subtle cursor-pointer hover:bg-surface-hover transition-colors rounded-t-lg"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-md">
          <button 
            type="button"
            className="text-ink-500 hover:text-ink-900 transition-colors"
            aria-label={isCollapsed ? "Expand variant" : "Collapse variant"}
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
          
          <div>
            <h3 className="text-lg font-heading text-ink-900 font-semibold">
              {variant.name || `Variant ${index + 1}`}
            </h3>
            {isCollapsed && (
              <p className="text-sm text-ink-500">
                {formatPercent(percentageOfBatch)} of batch • {formatCurrency(calculation.recommendedPrice)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-sm">
          <Badge variant={getMarginColor(calculation.profitMarginPercent)}>
            {formatPercent(calculation.profitMarginPercent)} Margin
          </Badge>
          
          {!isOnlyVariant && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(variant.id);
              }}
              className="p-sm text-ink-500 hover:text-rust hover:bg-rust/10 rounded-full transition-colors"
              aria-label="Delete variant"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {!isCollapsed && (
        <div className="p-lg space-y-xl animate-in slide-in-from-top-2 duration-200">
          
          {/* Main Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <Input
              label="Variant Name"
              placeholder="e.g. With Cheese"
              value={variant.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
              autoFocus={autoFocusName}
            />
            <div className="relative">
              <Input
                label="Quantity / Yield"
                type="number"
                value={variant.amount || ''}
                onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min={0}
                required
                helperText={`Represents ${formatPercent(percentageOfBatch)} of the total batch.`}
              />
            </div>
          </div>

          {/* Additional Ingredients */}
          <div className="space-y-md bg-surface p-md rounded-md border border-border-subtle">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-ink-700">Ingredients only for this variant</h4>
              <span className="text-sm text-ink-500">
                Subtotal: <span className="font-semibold text-ink-900">{formatCurrency(additionalIngredientsCost)}</span>
              </span>
            </div>
            
            <div className="space-y-sm">
              {variant.additionalIngredients.map((ing, idx) => (
                <IngredientRow
                  key={ing.id}
                  index={idx}
                  ingredient={ing}
                  onUpdate={handleIngredientUpdate}
                  onRemove={handleIngredientRemove}
                  onAdd={handleIngredientAdd}
                  isOnlyRow={false} // Always allow removing from this list
                />
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleIngredientAdd}
              icon={<Plus className="w-4 h-4" />}
              className="w-full border-dashed border-clay text-clay hover:bg-clay/5 hover:border-solid"
            >
              Add Ingredient
            </Button>
          </div>

          {/* Additional Labor */}
          <div>
            <Input
              label="Additional Labor Cost"
              type="number"
              value={variant.additionalLabor || ''}
              onChange={(e) => updateField('additionalLabor', parseFloat(e.target.value) || 0)}
              currency
              placeholder="0.00"
              helperText="Extra time/cost needed specifically for this variant."
            />
          </div>

          {/* Pricing Strategy */}
          <div className="space-y-sm">
            <label className="text-sm font-medium text-ink-700 block">Pricing Strategy</label>
            <div className="bg-surface p-md rounded-md border border-border-subtle flex flex-col md:flex-row gap-lg items-start md:items-center">
              
              <div className="flex bg-main rounded-md border border-border-subtle p-xs w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => updateField('pricingStrategy', 'markup')}
                  className={`flex-1 md:flex-none px-lg py-sm text-sm font-medium rounded-sm transition-all ${
                    variant.pricingStrategy === 'markup'
                      ? 'bg-clay text-white shadow-sm'
                      : 'text-ink-500 hover:text-ink-900'
                  }`}
                >
                  Markup
                </button>
                <button
                  type="button"
                  onClick={() => updateField('pricingStrategy', 'margin')}
                  className={`flex-1 md:flex-none px-lg py-sm text-sm font-medium rounded-sm transition-all ${
                    variant.pricingStrategy === 'margin'
                      ? 'bg-clay text-white shadow-sm'
                      : 'text-ink-500 hover:text-ink-900'
                  }`}
                >
                  Margin
                </button>
              </div>

              <div className="w-full md:w-48">
                 <Input
                  label=""
                  value={variant.pricingValue}
                  onChange={(e) => updateField('pricingValue', parseFloat(e.target.value) || 0)}
                  type="number"
                  suffix="%"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md bg-surface p-md rounded-md border border-border-subtle">
             {/* Cost Column */}
             <div className="space-y-xs col-span-2 md:col-span-1">
                <p className="text-xs text-ink-500 uppercase tracking-wider font-bold">Cost / Unit</p>
                <div className="flex justify-between text-xs">
                    <span className="text-ink-500">Base:</span>
                    <span className="text-ink-900">{formatCurrency(calculation.baseCost)}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-ink-500">Added:</span>
                    <span className="text-ink-900">{formatCurrency(calculation.additionalCost)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-border-subtle pt-xs mt-xs">
                    <span className="text-ink-900">Total:</span>
                    <span className="text-ink-900">{formatCurrency(calculation.totalCost)}</span>
                </div>
             </div>

             {/* Price */}
             <div className="col-span-2 md:col-span-1 border-l-0 md:border-l border-border-subtle pl-0 md:pl-md">
                <p className="text-xs text-ink-500 uppercase tracking-wider font-bold mb-xs">Recommended Price</p>
                <p className="text-2xl font-bold text-ink-900">{formatCurrency(calculation.recommendedPrice)}</p>
             </div>

             {/* Profit */}
             <div className="col-span-1 md:col-span-1 border-t md:border-t-0 border-border-subtle pt-md md:pt-0">
                <p className="text-xs text-ink-500 uppercase tracking-wider font-bold mb-xs">Profit / Unit</p>
                <p className="text-lg font-semibold text-moss">{formatCurrency(calculation.profitPerUnit)}</p>
             </div>

             {/* Total Profit */}
             <div className="col-span-1 md:col-span-1 border-t md:border-t-0 border-border-subtle pt-md md:pt-0">
                <p className="text-xs text-ink-500 uppercase tracking-wider font-bold mb-xs">Total Batch Profit</p>
                <p className="text-lg font-semibold text-moss">{formatCurrency(calculation.profitPerBatch)}</p>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end pt-md">
            <Button
                variant="secondary"
                onClick={() => setIsCollapsed(true)}
            >
                Done
            </Button>
          </div>

        </div>
      )}
    </Card>
  );
};
