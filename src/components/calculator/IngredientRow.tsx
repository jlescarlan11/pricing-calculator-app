import React, { useRef, useEffect, useState } from 'react';
import { Trash2, Calculator, Scale } from 'lucide-react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Select } from '../shared/Select';
import { Modal } from '../shared/Modal';
import {
  calculateIngredientCostFromPurchase,
  UNIT_OPTIONS,
} from '../../utils/calculations';
import type { Ingredient } from '../../types/calculator';

interface IngredientRowProps {
  ingredient: Ingredient;
  index: number;
  onUpdate: (id: string, field: keyof Ingredient, value: string | number) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  errors?: {
    name?: string;
    amount?: string;
    cost?: string;
  };
  isOnlyRow: boolean;
  autoFocus?: boolean;
}

export const IngredientRow: React.FC<IngredientRowProps> = ({
  ingredient,
  onUpdate,
  onRemove,
  onAdd,
  errors,
  isOnlyRow,
  autoFocus = false,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Derive mode from ingredient state or default to simple
  const isAdvanced = ingredient.measurementMode === 'advanced';

  useEffect(() => {
    if (autoFocus && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [autoFocus]);

  const handleDeleteClick = () => {
    if (isOnlyRow) {
      setShowDeleteModal(true);
    } else {
      setIsDeleting(true);
      // Wait for animation to finish before removing
      setTimeout(() => {
        onRemove(ingredient.id);
      }, 300);
    }
  };

  const confirmDelete = () => {
    setIsDeleting(true);
    setShowDeleteModal(false);
    setTimeout(() => {
      onRemove(ingredient.id);
    }, 300);
  };

  const handleChange = (field: keyof Ingredient, value: string | number) => {
    // Basic update first
    onUpdate(ingredient.id, field, value);

    // If in advanced mode and changing relevant fields, trigger recalculation
    if (isAdvanced) {
      // We need the *latest* values. The 'value' arg is the new value for 'field'.
      // We merge it with existing ingredient props to get the full picture.
      const updatedIngredient = { ...ingredient, [field]: value };

      if (
        ['purchaseQuantity', 'purchaseUnit', 'purchaseCost', 'recipeQuantity', 'recipeUnit'].includes(
          field
        )
      ) {
        const cost = calculateIngredientCostFromPurchase(
          Number(updatedIngredient.purchaseQuantity || 0),
          updatedIngredient.purchaseUnit || '',
          Number(updatedIngredient.purchaseCost || 0),
          Number(updatedIngredient.recipeQuantity || 0),
          updatedIngredient.recipeUnit || ''
        );

        if (cost !== null) {
          onUpdate(ingredient.id, 'cost', cost);
          // Also sync the main 'amount' field for display/consistency if needed,
          // though the UI might use recipeQuantity in advanced mode.
          // For compatibility, let's keep 'amount' synced with 'recipeQuantity'.
          if (field === 'recipeQuantity') {
            onUpdate(ingredient.id, 'amount', value);
          }
        } else {
          // If calculation fails (incomplete/invalid), reset cost to 0 to avoid stale data
          onUpdate(ingredient.id, 'cost', 0);
        }
      }
    } else {
       // In Simple Mode, specific validation for numeric fields
        if (field === 'amount' || field === 'cost') {
             // Allow empty string or numbers
            if (value === '' || /^\d*\.?\d*$/.test(String(value))) {
                onUpdate(ingredient.id, field, value);
            }
        }
    }
  };
  
  const handleModeToggle = () => {
    const newMode = isAdvanced ? 'simple' : 'advanced';
    onUpdate(ingredient.id, 'measurementMode', newMode);
    
    // If switching to Advanced for the first time, maybe init values?
    // For now, we leave them blank or let the user fill them.
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Only add on Enter if not in a textarea/select (standard form behavior)
      e.preventDefault(); 
      onAdd();
    } else if (e.key === 'Delete' && e.shiftKey) {
      e.preventDefault();
      handleDeleteClick();
    }
  };

  return (
    <div
      className={`
        relative transition-all duration-300
        ${isDeleting ? 'opacity-0 -translate-y-4' : 'opacity-100'}
        /* Mobile: Card Layout */
        flex flex-col gap-4 p-4 mb-4 rounded-xl border border-border-subtle bg-surface shadow-sm
        /* Desktop: Row Layout */
        md:flex-col md:gap-0 md:p-0 md:mb-0 md:rounded-none md:border-0 md:bg-transparent md:shadow-none md:py-md
      `}
      onKeyDown={handleKeyDown}
    >
      {/* Top Row: Name and Tools */}
      <div className="flex flex-col md:flex-row gap-md items-start md:items-center md:mb-sm">
        <div className="w-full md:flex-1 flex gap-sm items-end">
          <Input
            ref={nameInputRef}
            label="Ingredient Name"
            value={ingredient.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Flour"
            error={errors?.name}
            required
            className="flex-1 h-11 md:h-10"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleModeToggle}
            className={`
                mb-1 h-11 md:h-9 px-3 transition-colors
                ${isAdvanced ? 'text-clay bg-clay/10' : 'text-ink-500 hover:text-ink-700'}
            `}
            title={isAdvanced ? "Switch to Simple Mode" : "Switch to Unit Conversion Mode"}
          >
            {isAdvanced ? <Scale className="w-5 h-5 md:w-4 md:h-4 mr-1" /> : <Calculator className="w-5 h-5 md:w-4 md:h-4 mr-1" />}
            <span className="text-sm md:text-xs font-medium">{isAdvanced ? 'Smart' : 'Simple'}</span>
          </Button>
        </div>

        {/* Delete Button (Desktop Position) */}
        <div className="hidden md:block pt-6">
           <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 text-ink-500 hover:text-rust hover:bg-rust/5"
            onClick={handleDeleteClick}
            aria-label={`Remove ${ingredient.name || 'ingredient'}`}
            title="Remove ingredient (Shift+Delete)"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Input Area */}
      <div className={`
          rounded-lg transition-all duration-300 overflow-hidden
          ${isAdvanced ? 'md:bg-surface/50 md:border md:border-border-subtle md:p-md' : ''}
      `}>
        {isAdvanced ? (
          // --- ADVANCED MODE ---
          <div className="grid grid-cols-1 gap-6 md:gap-md animate-in fade-in slide-in-from-top-2">
             {/* Purchase Row */}
             <div className="grid grid-cols-2 md:grid-cols-12 gap-sm items-center">
                <span className="col-span-2 md:col-span-2 text-xs font-bold text-ink-500 uppercase tracking-wider mb-1 md:mb-0">
                  Purchase Details
                </span>
                
                <div className="col-span-1 md:col-span-3">
                    <Input
                        type="number"
                        placeholder="Qty"
                        value={ingredient.purchaseQuantity || ''}
                        onChange={(e) => handleChange('purchaseQuantity', e.target.value)}
                        min={0}
                        step="any"
                        className="h-11 md:h-9 text-sm"
                        label="Quantity"
                        hideLabel
                    />
                </div>
                
                <div className="col-span-1 md:col-span-3">
                     <Select
                        label="Unit" // Hidden visually but good for a11y
                        hideLabel
                        options={UNIT_OPTIONS}
                        value={ingredient.purchaseUnit || ''}
                        onChange={(e) => handleChange('purchaseUnit', e.target.value)}
                        placeholder="Unit"
                        className="h-11 md:h-9 text-sm"
                    />
                </div>
                
                <div className="col-span-2 md:col-span-4 md:pl-xs">
                     <Input
                        type="number"
                        placeholder="Total Cost"
                        value={ingredient.purchaseCost || ''}
                        onChange={(e) => handleChange('purchaseCost', e.target.value)}
                        min={0}
                        step="0.01"
                        currency
                        className="h-11 md:h-9 text-sm"
                        label="Cost"
                        hideLabel
                    />
                </div>
             </div>
             
             {/* Usage Row */}
             <div className="grid grid-cols-2 md:grid-cols-12 gap-sm items-center">
                <span className="col-span-2 md:col-span-2 text-xs font-bold text-ink-500 uppercase tracking-wider mb-1 md:mb-0">
                  Recipe Details
                </span>
                
                <div className="col-span-1 md:col-span-3">
                    <Input
                        type="number"
                        placeholder="Qty"
                        value={ingredient.recipeQuantity || ''}
                        onChange={(e) => handleChange('recipeQuantity', e.target.value)}
                        min={0}
                        step="any"
                        className="h-11 md:h-9 text-sm"
                        label="Quantity"
                        hideLabel
                    />
                </div>
                
                <div className="col-span-1 md:col-span-3">
                    <Select
                        label="Unit"
                        hideLabel
                        options={UNIT_OPTIONS}
                        value={ingredient.recipeUnit || ''}
                        onChange={(e) => handleChange('recipeUnit', e.target.value)}
                        placeholder="Unit"
                        className="h-11 md:h-9 text-sm"
                    />
                </div>

                <div className="col-span-2 md:col-span-4 md:pl-xs mt-2 md:mt-0">
                    <div className="flex items-center gap-xs px-3 py-2 bg-surface md:bg-white rounded border border-border-subtle shadow-sm h-11 md:h-auto">
                        <span className="text-xs text-ink-500 font-medium uppercase">Cost:</span>
                        <span className="font-mono font-medium text-ink-900 ml-auto">
                            {ingredient.cost ? `₱${Number(ingredient.cost).toFixed(2)}` : '---'}
                        </span>
                    </div>
                </div>
             </div>
          </div>
        ) : (
          // --- SIMPLE MODE ---
          <div className="grid grid-cols-2 gap-md animate-in fade-in">
            <Input
                label="Amount"
                type="number"
                value={ingredient.amount || ''}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="0"
                error={errors?.amount}
                required
                min={0}
                step="any"
                className="h-11 md:h-10"
            />
            <Input
                label="Cost"
                type="number"
                value={ingredient.cost || ''}
                onChange={(e) => handleChange('cost', e.target.value)}
                placeholder="0.00"
                currency
                error={errors?.cost}
                required
                min={0}
                step="0.01"
                className="h-11 md:h-10"
            />
          </div>
        )}
      </div>

       {/* Mobile Delete (Bottom) */}
       <div className="md:hidden flex justify-end mt-2 pt-4 border-t border-border-subtle">
          <Button
            variant="ghost"
            size="sm"
            className="text-rust hover:bg-rust/5 w-full justify-center h-11"
            onClick={handleDeleteClick}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove Ingredient
          </Button>
       </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Remove ingredient?"
        footer={
          <div className="flex justify-end gap-sm">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Keep
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Remove
            </Button>
          </div>
        }
      >
        <p className="text-ink-700">
          Removing this will leave your ingredient list empty. Shall we continue?
        </p>
      </Modal>
    </div>
  );
};
