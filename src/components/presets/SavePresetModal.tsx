import React, { useState, useEffect } from 'react';
import { CheckCircle2, Cloud, CloudOff, Loader2, AlertCircle, Package, Layers } from 'lucide-react';
import { Modal, Input, Button, Badge } from '../shared';
import { usePresets } from '../../hooks/use-presets';
import { useSync } from '../../hooks/useSync';
import { performFullCalculation } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import type { CalculationInput, PricingConfig } from '../../types/calculator';

interface PreviewData {
  totalCost?: number;
  batchSize?: number;
  recommendedPrice?: number;
  variantsCount?: number;
  topVariants?: { name: string; recommendedPrice: number }[];
}

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** @deprecated use onSave and previewData/presetType for Phase 2 */
  input?: CalculationInput;
  /** @deprecated use onSave and previewData/presetType for Phase 2 */
  config?: PricingConfig;
  onSave?: (name: string) => Promise<void>;
  initialName?: string;
  presetType?: 'single' | 'variants';
  previewData?: PreviewData;
}

/**
 * Modal component for saving calculations as presets.
 * Supports Phase 2 features including variant presets, sync status, and data previews.
 */
export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  isOpen,
  onClose,
  input,
  config,
  onSave,
  initialName,
  presetType = 'single',
  previewData,
}) => {
  const { addPreset, presets } = usePresets();
  const { isOnline } = useSync();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'offline-saved'>('idle');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(initialName || input?.productName || '');
      setError(null);
      setSaveStatus('idle');
    }
  }, [isOpen, initialName, input?.productName]);

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

    setSaveStatus('saving');
    setError(null);

    try {
      // Artificial delay for better UX
      if (import.meta.env.MODE !== 'test') {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      if (onSave) {
        await onSave(trimmedName);
      } else if (input && config) {
        await addPreset({
          name: trimmedName,
          input,
          config,
        } as any);
      }
      
      if (isOnline) {
        setSaveStatus('success');
      } else {
        setSaveStatus('offline-saved');
      }

      // Auto close after showing success message
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err) {
      setSaveStatus('idle');
      setError(err instanceof Error ? err.message : 'Oops, we couldn\'t save that. Please try again.');
    }
  };

  const isSaving = saveStatus === 'saving';
  const isSuccess = saveStatus === 'success' || saveStatus === 'offline-saved';

  // Fallback for Phase 1 inputs
  const p1Results = input && config ? performFullCalculation(input, config) : null;
  const effectivePreview: PreviewData = previewData || (p1Results ? {
    totalCost: p1Results.totalCost,
    batchSize: input?.batchSize,
    recommendedPrice: p1Results.recommendedPrice,
  } : {});

  const footer = (
    <div className="flex gap-sm justify-end items-center w-full">
      {isSaving && (
        <div className="flex items-center gap-sm text-ink-500 mr-auto animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Saving...</span>
        </div>
      )}
      
      {!isSaving && !isSuccess && (
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
            disabled={isSaving}
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
          <div className={`rounded-round ${saveStatus === 'success' ? 'bg-moss/10 border-moss/20' : 'bg-sakura/20 border-sakura/30'} p-lg mb-lg animate-bounce border`}>
            {saveStatus === 'success' ? (
              <CheckCircle2 className="w-12 h-12 text-moss" />
            ) : (
              <CloudOff className="w-12 h-12 text-ink-700" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-ink-900 tracking-tight">
            {saveStatus === 'success' ? 'Saved & Synced' : 'Saved Locally'}
          </h3>
          <p className="text-ink-500 mt-sm font-medium max-w-[280px]">
            {saveStatus === 'success' 
              ? `"${name}" is now backed up to your account.`
              : `"${name}" is saved on this device and will sync when you're back online.`}
          </p>
          
          <div className="mt-xl flex items-center gap-xs text-xs font-bold uppercase tracking-widest text-ink-500">
            {saveStatus === 'success' ? (
              <>
                <Cloud className="w-3 h-3 text-moss" />
                <span>Cloud Sync Active ✓</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-clay" />
                <span>Waiting for Connection</span>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500 leading-relaxed font-medium">
              Give this calculation a name to save it to your presets.
            </p>
            <Badge variant="info" className="flex items-center gap-xs">
              {presetType === 'single' ? <Package className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
              {presetType === 'single' ? 'Single' : 'Variants'}
            </Badge>
          </div>

          <Input
            label="Preset Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g., Artisan Sourdough Bread"
            error={error || undefined}
            required
            disabled={isSaving}
            autoFocus
          />

          {(effectivePreview.totalCost !== undefined || effectivePreview.variantsCount !== undefined) && (
            <div className="bg-surface rounded-md p-lg border border-border-subtle overflow-hidden relative">
              {/* Subtle background icon */}
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none">
                {presetType === 'single' ? <Package size={120} /> : <Layers size={120} />}
              </div>

              <h4 className="text-[10px] font-bold text-clay uppercase tracking-[0.2em] mb-md flex items-center gap-sm">
                <span>Data Preview</span>
                <span className="h-px flex-1 bg-border-subtle" />
              </h4>

              {presetType === 'single' ? (
                <div className="grid grid-cols-2 gap-y-lg gap-x-md relative z-10">
                  <div>
                    <p className="text-[10px] text-ink-500 uppercase font-bold tracking-wider mb-xs">Total Cost</p>
                    <p className="text-base font-bold text-ink-900">
                      {formatCurrency(effectivePreview.totalCost || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-500 uppercase font-bold tracking-wider mb-xs">Batch Size</p>
                    <p className="text-base font-bold text-ink-900">
                      {effectivePreview.batchSize} {effectivePreview.batchSize === 1 ? 'unit' : 'units'}
                    </p>
                  </div>
                  <div className="col-span-2 pt-md border-t border-border-subtle">
                    <p className="text-[10px] text-ink-500 uppercase font-bold tracking-wider mb-xs">Recommended Price</p>
                    <p className="text-2xl font-bold text-clay tracking-tight">
                      {formatCurrency(effectivePreview.recommendedPrice || 0)}
                      <span className="text-xs font-medium text-ink-500 ml-sm tracking-normal uppercase">
                        per unit
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-md relative z-10">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-ink-500 uppercase font-bold tracking-wider mb-xs">Variant Count</p>
                      <p className="text-lg font-bold text-ink-900">
                        {effectivePreview.variantsCount} Variations
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-ink-500 uppercase font-bold tracking-wider mb-xs">Base Batch</p>
                      <p className="text-lg font-bold text-ink-900">
                        {effectivePreview.batchSize} units
                      </p>
                    </div>
                  </div>
                  
                  {effectivePreview.topVariants && effectivePreview.topVariants.length > 0 && (
                    <div className="pt-md border-t border-border-subtle space-y-sm">
                      <p className="text-[10px] text-ink-500 uppercase font-bold tracking-wider">Top Variants</p>
                      <div className="grid grid-cols-1 gap-xs">
                        {effectivePreview.topVariants.slice(0, 2).map((v, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="text-ink-700 font-medium">{v.name}</span>
                            <span className="text-clay font-bold">{formatCurrency(v.recommendedPrice)}</span>
                          </div>
                        ))}
                        {(effectivePreview.variantsCount || 0) > 2 && (
                          <p className="text-[10px] text-ink-500 italic mt-xs">
                            + {(effectivePreview.variantsCount || 0) - 2} more variants
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-sm text-xs font-medium text-ink-500 pt-sm">
            {isOnline ? (
              <Cloud className="w-3 h-3 text-moss" />
            ) : (
              <CloudOff className="w-3 h-3 text-clay" />
            )}
            <span>{isOnline ? 'Connection secure - syncing enabled' : 'Currently offline - saving locally'}</span>
          </div>
        </div>
      )}
    </Modal>
  );
};
