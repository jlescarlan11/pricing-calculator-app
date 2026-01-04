import React, { useState } from 'react';
import { Package, Layers, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';

export type PresetType = 'single' | 'variant';

interface PresetTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: PresetType) => void;
}

export const PresetTypeSelector: React.FC<PresetTypeSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [selectedType, setSelectedType] = useState<PresetType | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleContinue = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  const options = [
    {
      id: 'single' as const,
      title: 'Single Product',
      description: 'Best for items with one set price and recipe.',
      example: 'Example: "Signature Chocolate Cake"',
      icon: Package,
    },
    {
      id: 'variant' as const,
      title: 'Multiple Variants',
      description: 'Best for items with different sizes, flavors, or styles.',
      example: 'Example: "Cupcakes (Box of 6, Box of 12)"',
      icon: Layers,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Preset Type"
      maxWidth="max-w-[600px]"
      footer={
        <div className="flex justify-end gap-md w-full">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!selectedType}
            className="w-full sm:w-auto"
          >
            Continue
          </Button>
        </div>
      }
    >
      <div className="space-y-lg">
        <p className="text-ink-700">
          Select how you want to structure this product. You can&apos;t change this later.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md" role="radiogroup" aria-label="Preset Type Selection">
          {options.map((option) => (
            <div
              key={option.id}
              role="radio"
              aria-checked={selectedType === option.id}
              tabIndex={0}
              onClick={() => setSelectedType(option.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedType(option.id);
                }
              }}
              className={`
                relative p-lg rounded-lg border-2 cursor-pointer transition-all duration-200 outline-none
                ${
                  selectedType === option.id
                    ? 'border-clay bg-surface shadow-level-2'
                    : 'border-border-base bg-bg-main hover:border-clay/50 hover:bg-surface-hover'
                }
              `}
            >
              {selectedType === option.id && (
                <div className="absolute top-sm right-sm text-clay">
                  <CheckCircle2 size={20} />
                </div>
              )}
              
              <div className="flex flex-col items-center text-center space-y-md pt-sm">
                <div className={`
                  p-md rounded-full 
                  ${selectedType === option.id ? 'bg-clay/10 text-clay' : 'bg-surface-hover text-ink-500'}
                `}>
                  <option.icon size={32} />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-ink-900 mb-xs">
                    {option.title}
                  </h3>
                  <p className="text-sm text-ink-700 mb-md">
                    {option.description}
                  </p>
                  <div className="text-xs font-medium text-ink-500 bg-surface-hover py-xs px-sm rounded-md inline-block">
                    {option.example}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-border-subtle rounded-lg overflow-hidden">
          <button
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="w-full flex items-center justify-between p-md bg-surface-hover/50 hover:bg-surface-hover transition-colors text-left"
            aria-expanded={isDetailsOpen}
            aria-controls="details-content"
          >
            <span className="font-medium text-ink-900 flex items-center gap-sm">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-ink-900 text-bg-main text-xs font-bold">?</span>
              What&apos;s the difference?
            </span>
            {isDetailsOpen ? <ChevronUp size={20} className="text-ink-500" /> : <ChevronDown size={20} className="text-ink-500" />}
          </button>
          
          {isDetailsOpen && (
            <div id="details-content" className="p-md bg-bg-main border-t border-border-subtle animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-md text-sm text-ink-700">
                <div>
                  <strong className="text-ink-900 block mb-xs">Single Product</strong>
                  <p>Use this for simple items. You&apos;ll calculate costs for one batch and set one selling price. Ideal for bespoke orders or standalone items.</p>
                </div>
                <div>
                  <strong className="text-ink-900 block mb-xs">Multiple Variants</strong>
                  <p>Use this when you sell the same product in different ways (e.g., &quot;Small&quot;, &quot;Large&quot;). You&apos;ll share ingredients but can set different packaging costs and prices for each variant.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
