import React, { useMemo, useState, useEffect } from 'react';
import { Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { VariantForm } from './VariantForm';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import type { VariantInput, VariantCalculation } from '../../types/variants';

interface VariantsListProps {
  variants: VariantInput[];
  totalBatchSize: number;
  onVariantsUpdate: (variants: VariantInput[]) => void;
  calculations: Record<string, VariantCalculation>;
}

export const VariantsList: React.FC<VariantsListProps> = ({
  variants,
  totalBatchSize,
  onVariantsUpdate,
  calculations,
}) => {
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  // Allocation Logic
  const totalAllocated = useMemo(() => 
    variants.reduce((sum, v) => sum + (v.amount || 0), 0),
    [variants]
  );

  const remaining = totalBatchSize - totalAllocated;
  const allocationPercent = totalBatchSize > 0 ? (totalAllocated / totalBatchSize) * 100 : 0;
  
  // Determine Status
  let status: 'exact' | 'over' | 'under' | 'near-full';
  if (Math.abs(remaining) < 0.01) { // Floating point tolerance
    status = 'exact';
  } else if (remaining < 0) {
    status = 'over';
  } else if (allocationPercent >= 90) {
    status = 'near-full';
  } else {
    status = 'under';
  }

  // Styles based on status
  const getStatusStyles = () => {
    switch (status) {
      case 'exact':
        return { color: 'text-moss', bg: 'bg-moss', border: 'border-moss', icon: CheckCircle2 };
      case 'over':
        return { color: 'text-rust', bg: 'bg-rust', border: 'border-rust', icon: AlertTriangle };
      case 'near-full':
        return { color: 'text-clay', bg: 'bg-clay', border: 'border-clay', icon: AlertTriangle };
      case 'under':
      default:
        // Using ink-500/clay for neutral/under state
        return { color: 'text-ink-700', bg: 'bg-ink-500', border: 'border-ink-500', icon: null };
    }
  };

  const statusStyles = getStatusStyles();
  const StatusIcon = statusStyles.icon;

  // Handlers
  const handleUpdate = (id: string, updates: Partial<VariantInput>) => {
    const updatedVariants = variants.map(v => 
      v.id === id ? { ...v, ...updates } : v
    );
    onVariantsUpdate(updatedVariants);
  };

  const handleDelete = (id: string) => {
    if (variants.length <= 1) return;
    const updatedVariants = variants.filter(v => v.id !== id);
    onVariantsUpdate(updatedVariants);
  };

  const handleAddVariant = () => {
    const newId = crypto.randomUUID();
    const newVariant: VariantInput = {
      id: newId,
      name: '',
      amount: Math.max(0, remaining), // Default to remaining
      unit: variants[0]?.unit || 'pc', // Copy unit from first variant or default
      additionalIngredients: [],
      additionalLabor: 0,
      pricingStrategy: 'markup',
      pricingValue: 50, // Default markup
      currentSellingPrice: null,
    };
    
    setNewlyAddedId(newId);
    onVariantsUpdate([...variants, newVariant]);
  };

  // Reset newlyAddedId after render to avoid focusing on subsequent updates
  useEffect(() => {
    if (newlyAddedId) {
      const timer = setTimeout(() => setNewlyAddedId(null), 500);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedId]);

  return (
    <div className="space-y-xl">
      {/* Allocation Tracker */}
      <Card className="bg-surface sticky top-4 z-10 shadow-sm border-border-subtle" padding="lg">
        <div className="flex flex-col gap-sm">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">
                Batch Allocation
              </h3>
              <p className={`text-sm font-medium ${statusStyles.color} flex items-center gap-xs mt-xs`}>
                {StatusIcon && <StatusIcon className="w-4 h-4" />}
                {status === 'exact' && "Perfectly allocated"}
                {status === 'over' && `${Math.abs(remaining)} units over limit`}
                {status === 'near-full' && `${remaining} units remaining`}
                {status === 'under' && `${remaining} units remaining`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-ink-900 tabular-nums">
                {totalAllocated}
              </span>
              <span className="text-ink-500 text-sm ml-xs">
                / {totalBatchSize}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3 w-full bg-bg-main rounded-full overflow-hidden border border-border-subtle">
            <div 
              className={`h-full transition-all duration-500 ease-out ${statusStyles.bg}`}
              style={{ width: `${Math.min(allocationPercent, 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Variants List */}
      <div className="space-y-lg">
        {variants.map((variant, index) => (
          <VariantForm
            key={variant.id}
            index={index}
            variant={variant}
            totalBatchSize={totalBatchSize}
            isOnlyVariant={variants.length === 1}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            calculation={calculations[variant.id] || {
              // Fallback if calculation not found (shouldn't happen ideally)
              variantId: variant.id,
              baseCost: 0,
              additionalCost: 0,
              totalCost: 0,
              recommendedPrice: 0,
              profitMarginPercent: 0,
              profitPerUnit: 0,
              profitPerBatch: 0,
              breakEvenPrice: 0,
            }}
            autoFocusName={variant.id === newlyAddedId}
          />
        ))}
      </div>

      {/* Add Button */}
      <Button
        variant="secondary"
        onClick={handleAddVariant}
        disabled={remaining <= 0}
        className="w-full border-dashed border-clay text-clay hover:bg-clay/5 hover:border-solid py-lg"
        icon={<Plus className="w-5 h-5" />}
      >
        Add Another Variant
      </Button>
    </div>
  );
};
