import React, { useState } from 'react';
import { Calculator, HelpCircle, AlertCircle } from 'lucide-react';
import { Input, Button, Badge, Modal } from '../shared';
import { OverheadCalculator } from '../help';

interface OverheadCostProps {
  value: number;
  batchSize: number;
  onChange: (value: number) => void;
  error?: string;
  label?: string;
}

export const OverheadCost: React.FC<OverheadCostProps> = ({
  value,
  batchSize,
  onChange,
  error,
  label,
}) => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isHelperOpen, setIsHelperOpen] = useState(false);

  const handleApplyOverhead = (calculatedTotal: number) => {
    onChange(calculatedTotal);
    setIsCalculatorOpen(false);
  };

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-xs">
          <div className="flex items-center gap-sm">
            <h3 className="text-lg font-bold text-ink-900 leading-tight">
              {label || 'Overhead Cost'}
            </h3>
          </div>
          <p className="text-xs text-ink-500">Rent, utilities, and packaging</p>
        </div>
        <div className="flex items-center gap-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHelperOpen(true)}
            className="text-ink-400 hover:text-clay hover:bg-clay/5 p-xs h-auto"
            title="Overhead Guide"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCalculatorOpen(true)}
            className="text-clay hover:text-clay hover:bg-clay/10 py-xs px-md text-xs rounded-sm h-auto flex items-center gap-sm"
          >
            <Calculator className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Calculator</span>
          </Button>
        </div>
      </div>

      <div className="space-y-sm">
        <Input
          label={label ? `Total ${label}` : 'Total Overhead Cost'}
          type="number"
          value={value === 0 ? '' : value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          currency
          placeholder="0.00"
          error={error}
          min={0}
          step="0.01"
        />
        {value === 0 && (
          <div className="flex items-center gap-sm mt-sm">
            <Badge
              variant="warning"
              className="flex items-center gap-xs text-[10px] py-xs px-sm uppercase tracking-wide"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Zero overhead? Rare but possible.
            </Badge>
          </div>
        )}
      </div>

      {/* Helper Modal */}
      <Modal
        isOpen={isHelperOpen}
        onClose={() => setIsHelperOpen(false)}
        title="Overhead Cost Guide"
        maxWidth="max-w-[500px]"
      >
        <div className="space-y-xl py-md">
          <div className="space-y-md">
            <p className="text-ink-700 leading-relaxed">
              Overhead includes all indirect costs of running your business. These are bills you pay
              regardless of how many units you sell.
            </p>

            <div className="space-y-lg">
              <div className="space-y-xs">
                <h5 className="font-bold text-ink-900 flex items-center gap-xs">
                  Examples of Fixed Costs:
                </h5>
                <ul className="text-sm list-disc pl-md space-y-xs text-ink-600">
                  <li>Rent for your workspace</li>
                  <li>Electricity, water, and internet</li>
                  <li>Marketing and advertisement fees</li>
                  <li>Equipment maintenance and repairs</li>
                </ul>
              </div>

              <div className="space-y-xs">
                <h5 className="font-bold text-ink-900 flex items-center gap-xs">
                  Packaging & Supplies:
                </h5>
                <p className="text-sm text-ink-600">
                  Don&apos;t forget individual packaging costs like boxes, jars, labels, and pouches
                  which are often overlooked.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface p-lg rounded-xl border border-border-subtle">
            <p className="text-sm font-bold text-ink-900 mb-xs">Pro Tip:</p>
            <p className="text-sm text-ink-600 italic">
              &quot;Divide your monthly bills by the average number of batches you make to find the
              fair overhead share for each batch.&quot;
            </p>
          </div>

          <div className="flex justify-end pt-md">
            <Button variant="primary" onClick={() => setIsHelperOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>

      {/* Calculator Modal */}
      <Modal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        title="Overhead Calculator"
        maxWidth="max-w-[600px]"
      >
        <OverheadCalculator onApply={handleApplyOverhead} initialBatchSize={batchSize} />
      </Modal>
    </div>
  );
};
