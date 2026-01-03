import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Modal, Input, Button } from '../shared';
import { usePresets } from '../../hooks/use-presets';
import { performFullCalculation } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import type { CalculationInput, PricingConfig } from '../../types/calculator';

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: CalculationInput;
  config: PricingConfig;
}

/**
 * Modal component for saving the current calculation as a preset.
 * Includes validation for name length and duplicates, and shows a data preview.
 */
export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  isOpen,
  onClose,
  input,
  config,
}) => {
  const { addPreset, presets } = usePresets();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(input.productName || '');
      setError(null);
      setIsSuccess(false);
      setIsSaving(false);
    }
  }, [isOpen, input.productName]);

  const handleSave = async () => {
    const trimmedName = name.trim();

    // Validation
    if (trimmedName.length < 3) {
      setError('Name must be at least 3 characters.');
      return;
    }
    if (trimmedName.length > 50) {
      setError('Name must be less than 50 characters.');
      return;
    }
    
    const isDuplicate = presets.some(
      p => p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (isDuplicate) {
      setError('A product with this name already exists in your presets.');
      return;
    }

    setIsSaving(true);
    try {
      // Artificial delay for better UX (feedback that something is happening)
      // Skip in test mode for faster execution
      if (import.meta.env.MODE !== 'test') {
        await new Promise(resolve => setTimeout(resolve, 600));
      }
      
      addPreset({
        name: trimmedName,
        input,
        config,
      });
      
      setIsSuccess(true);
      // Auto close after showing success message
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preset. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const results = performFullCalculation(input, config);

  const footer = (
    <div className="flex gap-3 justify-end">
      {!isSuccess && (
        <>
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave} 
            isLoading={isSaving}
          >
            Save Product
          </Button>
        </>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save as Preset"
      footer={footer}
    >
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-green-100 p-3 mb-4 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Saved Successfully!</h3>
          <p className="text-gray-500 mt-2">
            &quot;{name}&quot; has been added to your saved products.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">
            Give this calculation a name to save it to your presets. You can load it later to update costs or prices.
          </p>

          <Input
            label="Product Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g., Artisan Sourdough Bread"
            error={error || undefined}
            required
            disabled={isSaving}
          />

          <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">
              Calculation Summary
            </h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Total Cost</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(results.totalCost)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Batch Size</p>
                <p className="text-sm font-medium text-gray-900">
                  {input.batchSize} {input.batchSize === 1 ? 'unit' : 'units'}
                </p>
              </div>
              <div className="col-span-2 pt-2 border-t border-blue-100">
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Recommended Price</p>
                <p className="text-lg font-bold text-blue-700">
                  {formatCurrency(results.recommendedPrice)}
                  <span className="text-xs font-normal text-blue-500 ml-1">
                    per unit
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
