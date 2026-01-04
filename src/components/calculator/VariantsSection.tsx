import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, Input } from '../shared';
import { IngredientRow } from './IngredientRow';
import type { VariantInput, VariantCalculation } from '../../types/variants';
import type { Ingredient } from '../../types/calculator';

interface VariantsSectionProps {
  variants: VariantInput[];
  variantResults: VariantCalculation[];
  onAddVariant: () => void;
  onUpdateVariant: (id: string, updates: Partial<VariantInput>) => void;
  onRemoveVariant: (id: string) => void;
  errors?: Record<string, string>;
}

export const VariantsSection: React.FC<VariantsSectionProps> = ({
  variants,
  variantResults,
  onAddVariant,
  onUpdateVariant,
  onRemoveVariant,
  errors = {},
}) => {
  const handleUpdateIngredient = (variantId: string, ingredientId: string, field: keyof Ingredient, value: string | number) => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;

    const updatedIngredients = variant.additionalIngredients.map(ing =>
      ing.id === ingredientId ? { ...ing, [field]: value } : ing
    );

    onUpdateVariant(variantId, { additionalIngredients: updatedIngredients });
  };

  const handleAddIngredient = (variantId: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;

    const newIngredient: Ingredient = {
      id: crypto.randomUUID?.() || Math.random().toString(36).substring(2),
      name: '',
      amount: 0,
      cost: 0,
    };

    onUpdateVariant(variantId, {
      additionalIngredients: [...variant.additionalIngredients, newIngredient],
    });
  };

  const handleRemoveIngredient = (variantId: string, ingredientId: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;

    const updatedIngredients = variant.additionalIngredients.filter(ing => ing.id !== ingredientId);
    onUpdateVariant(variantId, { additionalIngredients: updatedIngredients });
  };

  return (
    <div className="space-y-xl">
       <div className="flex items-center justify-between">
        <div>
           <h3 className="text-xl font-serif text-ink-900">Variants</h3>
           <p className="text-ink-500 text-sm mt-xs">
             Add different versions (e.g., sizes, flavors) based on your main recipe.
           </p>
        </div>
        <Button 
            variant="ghost" 
            onClick={onAddVariant}
            className="flex items-center gap-sm text-clay hover:text-clay hover:bg-clay/10"
        >
            <Plus className="w-4 h-4" />
            Add Variant
        </Button>
      </div>

      <div className="grid gap-lg">
        {variants.map((variant, index) => {
           const result = variantResults.find(r => r.variantId === variant.id);
           const variantErrors = {
               name: errors[`variants[${index}].name`],
               amount: errors[`variants[${index}].amount`],
               additionalLabor: errors[`variants[${index}].additionalLabor`],
           };

           return (
            <Card key={variant.id} className="relative overflow-hidden border-l-4 border-l-clay">
               <div className="flex flex-col gap-lg">
                 {/* Header & Basic Info */}
                 <div className="flex flex-col md:flex-row gap-md items-start md:items-center justify-between">
                    <div className="flex-1 w-full md:w-auto">
                        <Input
                            label="Variant Name"
                            value={variant.name}
                            onChange={(e) => onUpdateVariant(variant.id, { name: e.target.value })}
                            placeholder="e.g. Small Jar, Gift Pack"
                            error={variantErrors.name}
                        />
                    </div>
                    <div className="w-full md:w-32">
                         <Input
                            label="Base Units"
                            type="number"
                            value={variant.amount}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                onUpdateVariant(variant.id, { amount: isNaN(val) ? 0 : val });
                            }}
                            min={0}
                            step="any"
                            placeholder="1"
                            error={variantErrors.amount}
                            tooltip="How many units of the base batch are used for this variant?"
                        />
                    </div>
                    
                    {/* Delete Button */}
                    <button
                        onClick={() => onRemoveVariant(variant.id)}
                        className="text-ink-500 hover:text-rust transition-colors p-sm mt-6"
                        aria-label="Remove variant"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                 </div>

                 <div className="h-px bg-border-subtle" role="separator" />

                 {/* Additional Ingredients */}
                 <div>
                    <div className="flex items-center justify-between mb-sm">
                        <h4 className="text-sm font-medium text-ink-700">Additional Ingredients</h4>
                        <span className="text-xs text-ink-500">{variant.additionalIngredients.length} item(s)</span>
                    </div>
                    
                    <div className="space-y-sm">
                        {variant.additionalIngredients.map((ing, i) => (
                            <IngredientRow
                                key={ing.id}
                                ingredient={ing}
                                index={i}
                                isOnlyRow={false} // Allow removing all additional ingredients
                                onUpdate={(id, field, val) => handleUpdateIngredient(variant.id, id, field, val)}
                                onRemove={(id) => handleRemoveIngredient(variant.id, id)}
                                onAdd={() => handleAddIngredient(variant.id)}
                                // Pass specific errors if mapped
                            />
                        ))}
                         <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddIngredient(variant.id)}
                            className="w-full flex items-center justify-center gap-sm text-ink-500 border border-dashed border-border-base mt-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Add Ingredient
                          </Button>
                    </div>
                 </div>

                  <div className="h-px bg-border-subtle" role="separator" />

                  {/* Additional Labor */}
                  <div className="w-full md:w-1/2">
                      <Input
                        label="Additional Labor Cost"
                        type="number"
                        currency
                        value={variant.additionalLabor}
                        onChange={(e) => {
                             const val = parseFloat(e.target.value);
                             onUpdateVariant(variant.id, { additionalLabor: isNaN(val) ? 0 : val });
                        }}
                        min={0}
                        error={variantErrors.additionalLabor}
                      />
                  </div>

                  {/* Calculated Price Preview */}
                  {result && (
                       <div className="mt-md p-md bg-surface rounded-md flex justify-between items-center">
                           <span className="text-ink-700 font-medium">Recommended Price:</span>
                           <span className="text-xl font-bold text-ink-900">
                               {result.recommendedPrice.toFixed(2)}
                           </span>
                       </div>
                  )}

               </div>
            </Card>
           );
        })}
      </div>
      
       {variants.length === 0 && (
        <div className="text-center p-lg border-2 border-dashed border-border-base rounded-lg text-ink-500">
          <p>No variants added yet.</p>
          <Button variant="ghost" onClick={onAddVariant}>
            Add a variant
          </Button>
        </div>
      )}
    </div>
  );
};
