import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, Input } from '../shared';
import { IngredientRow, LaborCost, OverheadCost } from '../calculator';
import type { Ingredient } from '../../types/calculator';

export interface BaseRecipeFormData {
  productName: string;
  batchSize: number;
  ingredients: Ingredient[];
  laborCost: number;
  overheadCost: number;
}

interface BaseRecipeFormProps {
  data: BaseRecipeFormData;
  onChange: (data: BaseRecipeFormData) => void;
  errors?: {
    productName?: string;
    batchSize?: string;
    ingredients?: string;
    laborCost?: string;
    overheadCost?: string;
    [key: string]: string | undefined; // For indexed ingredient errors
  };
}

export const BaseRecipeForm: React.FC<BaseRecipeFormProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const handleProductChange = (field: 'productName' | 'batchSize', value: string | number) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleIngredientUpdate = (id: string, field: keyof Ingredient, value: string | number) => {
    const updatedIngredients = data.ingredients.map((ing) =>
      ing.id === id ? { ...ing, [field]: value } : ing
    );
    onChange({ ...data, ingredients: updatedIngredients });
  };

  const handleAddIngredient = () => {
    const newIngredient: Ingredient = {
      id: crypto.randomUUID(),
      name: '',
      amount: 0,
      cost: 0,
    };
    onChange({
      ...data,
      ingredients: [...data.ingredients, newIngredient],
    });
  };

  const handleRemoveIngredient = (id: string) => {
    onChange({
      ...data,
      ingredients: data.ingredients.filter((ing) => ing.id !== id),
    });
  };

  const handleLaborChange = (value: number) => {
    onChange({ ...data, laborCost: value });
  };

  const handleOverheadChange = (value: number) => {
    onChange({ ...data, overheadCost: value });
  };

  const ingredientsCost = data.ingredients.reduce((sum, ing) => sum + (ing.cost || 0), 0);
  const totalBaseCost = ingredientsCost + data.laborCost + data.overheadCost;

  return (
    <div className="flex flex-col space-y-xl">
      {/* Section 1: Product Details */}
      <Card title="Product Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <Input
            label="Product Name"
            value={data.productName}
            onChange={(e) => handleProductChange('productName', e.target.value)}
            placeholder="e.g. Chocolate Chip Cookies"
            error={errors.productName}
            required
          />
          <Input
            label="Total Batch Size"
            type="number"
            value={data.batchSize === 0 ? '' : data.batchSize}
            onChange={(e) => handleProductChange('batchSize', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 12"
            helperText="Total units this recipe makes"
            error={errors.batchSize}
            required
            min={1}
          />
        </div>
      </Card>

      <div className="h-px bg-border-subtle" role="separator" />

      {/* Section 2: Shared Ingredients */}
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="text-lg text-ink-900">Shared Ingredients</h3>
              <p className="text-sm text-ink-500 font-normal mt-xs">Ingredients used in all variants</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-ink-500 uppercase tracking-widest block">
                Subtotal
              </span>
              <span className="text-lg font-bold text-ink-900 tabular-nums">
                ₱{ingredientsCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
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
            {data.ingredients.map((ing, index) => (
              <IngredientRow
                key={ing.id}
                ingredient={ing}
                index={index}
                isOnlyRow={data.ingredients.length === 1}
                onUpdate={handleIngredientUpdate}
                onRemove={handleRemoveIngredient}
                onAdd={handleAddIngredient}
                autoFocus={index === data.ingredients.length - 1 && index > 0}
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
              onClick={handleAddIngredient}
              className="w-full flex items-center justify-center gap-sm text-ink-700 hover:text-clay hover:bg-clay/5 border-2 border-dashed border-border-base transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Add Shared Ingredient
            </Button>
          </div>
        </div>
      </Card>

      <div className="h-px bg-border-subtle" role="separator" />

      {/* Section 3: Shared Costs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <LaborCost
          value={data.laborCost}
          onChange={handleLaborChange}
          error={errors.laborCost}
        />
        <OverheadCost
          value={data.overheadCost}
          batchSize={data.batchSize}
          onChange={handleOverheadChange}
          error={errors.overheadCost}
        />
      </div>

      <div className="h-px bg-border-subtle" role="separator" />

      {/* Section 4: Total Base Cost */}
      <Card className="bg-surface-hover/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-md">
           <div className="space-y-xs">
             <h3 className="text-lg font-bold text-ink-900">Total Base Cost</h3>
             <p className="text-sm text-ink-500">Includes shared ingredients, labor, and overhead</p>
           </div>
           <div className="w-full md:w-auto min-w-[200px]">
             <Input
               label=""
               value={totalBaseCost}
               onChange={() => {}} // Read-only
               currency
               disabled
               className="pointer-events-none"
               inputClassName="bg-white/50 text-ink-900 font-bold text-lg border-clay/30"
             />
           </div>
        </div>
      </Card>
    </div>
  );
};
