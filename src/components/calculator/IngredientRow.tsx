import React, { useRef, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Modal } from '../shared/Modal';
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

  const handleChange = (field: keyof Ingredient, value: string) => {
    if (field === 'amount' || field === 'cost') {
      // Allow empty string or numbers
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        onUpdate(ingredient.id, field, value);
      }
    } else {
      onUpdate(ingredient.id, field, value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission if inside a form
      onAdd();
    } else if (e.key === 'Delete' && e.shiftKey) {
      // Shift+Delete to remove row, avoiding conflict with text deletion
      e.preventDefault();
      handleDeleteClick();
    }
  };

  return (
    <div 
      className={`
        grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-md items-start md:items-center py-md
        animate-in fade-in duration-400
        ${isDeleting ? 'opacity-0 -translate-y-4 transition-all duration-300 ease-in-out' : ''}
      `}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full">
        <Input
          ref={nameInputRef}
          label="Ingredient Name"
          value={ingredient.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g. Flour"
          error={errors?.name}
          required
        />
      </div>

      <div className="w-full">
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
        />
      </div>

      <div className="w-full">
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
        />
      </div>

      <div className="flex justify-end md:justify-center md:pt-6">
        <button
          type="button"
          className="w-[36px] h-[36px] rounded-[50%] flex items-center justify-center text-[#8B8680] hover:text-[#B85C38] hover:bg-[rgba(184,92,56,0.05)] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] focus-visible:ring-offset-2 cursor-pointer"
          onClick={handleDeleteClick}
          aria-label={`Remove ${ingredient.name || 'ingredient'}`}
          title="Remove ingredient (Shift+Delete)"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Remove Last Ingredient?"
        footer={
          <div className="flex justify-end gap-sm">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Remove
            </Button>
          </div>
        }
      >
        <p className="text-ink-700">
          This is the last ingredient in your list. Are you sure you want to remove it?
        </p>
      </Modal>
    </div>
  );
};
