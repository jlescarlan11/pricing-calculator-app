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
      setError('Try a slightly longer name.');
      return;
    }
    if (trimmedName.length > 50) {
      setError('Try a shorter name.');
      return;
    }
    
    const isDuplicate = presets.some(
      p => p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (isDuplicate) {
      setError('You already have a product with this name.');
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
      setError(err instanceof Error ? err.message : 'Oops, we couldn\'t save that. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const results = performFullCalculation(input, config);

  const footer = (
    <div className="flex gap-sm justify-end">
      {!isSuccess && (
        <>
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={isSaving}
          >
            Back
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave} 
            isLoading={isSaving}
          >
            Save
          </Button>
        </>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<span className="text-ink-900">Save calculation</span>}
      footer={footer}
    >
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-2xl text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="rounded-round bg-moss/10 p-lg mb-lg animate-bounce border border-moss/20">
            <CheckCircle2 className="w-12 h-12 text-moss" />
          </div>
          <h3 className="text-2xl font-bold text-ink-900 tracking-tight">Saved</h3>
          <p className="text-ink-500 mt-sm font-medium">
            &quot;{name}&quot; is now available in your saved products.
          </p>
        </div>
      ) : (
        <div className="space-y-xl">
          <p className="text-sm text-ink-500 leading-relaxed font-medium">
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

          <div className="bg-surface rounded-md p-lg border border-border-subtle">
            <h4 className="text-[10px] font-bold text-clay uppercase tracking-[0.2em] mb-md">
              Calculation Summary
            </h4>
            <div className="grid grid-cols-2 gap-y-lg gap-x-md">
              <div>
                <p className="text-[10px] text-ink-500 uppercase font-bold tracking-wider mb-xs">Total Cost</p>
                <p className="text-base font-bold text-ink-900">
                  {formatCurrency(results.totalCost)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-ink-500 uppercase font-bold tracking-wider mb-xs">Batch Size</p>
                <p className="text-base font-bold text-ink-900">
                  {input.batchSize} {input.batchSize === 1 ? 'unit' : 'units'}
                </p>
              </div>
              <div className="col-span-2 pt-md border-t border-border-subtle">
                <p className="text-[10px] text-ink-500 uppercase font-bold tracking-wider mb-xs">Recommended Price</p>
                <p className="text-2xl font-bold text-clay tracking-tight">
                  {formatCurrency(results.recommendedPrice)}
                  <span className="text-xs font-medium text-ink-500 ml-sm tracking-normal uppercase">
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
