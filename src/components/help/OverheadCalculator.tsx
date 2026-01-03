import React, { useState, useMemo } from 'react';
import { Info } from 'lucide-react';
import { Input, Button } from '../shared';

interface OverheadCalculatorProps {
  onApply: (total: number) => void;
  initialBatchSize: number;
}

/**
 * OverheadCalculator provides a guided way for users to determine their 
 * total overhead costs by breaking down monthly expenses and packaging.
 */
export const OverheadCalculator: React.FC<OverheadCalculatorProps> = ({
  onApply,
  initialBatchSize,
}) => {
  const [rent, setRent] = useState<string>('');
  const [utilities, setUtilities] = useState<string>('');
  const [batchesPerMonth, setBatchesPerMonth] = useState<string>('');
  const [packagingPerUnit, setPackagingPerUnit] = useState<string>('');
  const [batchSize, setBatchSize] = useState<string>(initialBatchSize.toString());

  const calculation = useMemo(() => {
    const r = parseFloat(rent) || 0;
    const u = parseFloat(utilities) || 0;
    const bpm = Math.max(parseFloat(batchesPerMonth) || 1, 1);
    const ppu = parseFloat(packagingPerUnit) || 0;
    const bs = parseFloat(batchSize) || 0;

    const rentPerBatch = r / bpm;
    const utilitiesPerBatch = u / bpm;
    const packagingTotal = ppu * bs;
    const total = rentPerBatch + utilitiesPerBatch + packagingTotal;

    return {
      rentPerBatch,
      utilitiesPerBatch,
      packagingTotal,
      total,
    };
  }, [rent, utilities, batchesPerMonth, packagingPerUnit, batchSize]);

  return (
    <div className="space-y-xl p-sm">
      <div className="bg-surface p-lg rounded-2xl border border-border-subtle animate-in fade-in duration-700">
        <div className="flex gap-md">
          <Info className="w-6 h-6 text-clay shrink-0 mt-xs" />
          <div className="text-sm text-ink-700">
            <p className="font-bold text-ink-900 mb-sm tracking-tight">How it&apos;s calculated:</p>
            <p className="opacity-90 leading-relaxed font-medium">
              Formula: <code className="bg-bg-main px-sm py-[2px] rounded border border-border-subtle font-mono text-[11px] text-clay">((Rent + Utilities) / Batches) + (Packaging × Batch Size)</code>
            </p>
            <p className="mt-sm opacity-70 text-xs font-medium italic">
              This distributes your monthly fixed costs across your production volume and adds the direct packaging costs for this batch.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
        <div className="space-y-lg">
          <p className="text-[10px] font-bold text-ink-500 uppercase tracking-[0.2em] font-sans">Fixed Monthly Costs</p>
          <Input
            label="Monthly Rent"
            type="number"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
            currency
            placeholder="0.00"
            helperText="Total rent for your production space"
          />
          <Input
            label="Monthly Utilities"
            type="number"
            value={utilities}
            onChange={(e) => setUtilities(e.target.value)}
            currency
            placeholder="0.00"
            helperText="Electricity, water, gas, etc."
          />
          <Input
            label="Batches per Month"
            type="number"
            value={batchesPerMonth}
            onChange={(e) => setBatchesPerMonth(e.target.value)}
            placeholder="e.g. 20"
            helperText="Total batches made in a month"
          />
        </div>

        <div className="space-y-lg">
          <p className="text-[10px] font-bold text-ink-500 uppercase tracking-[0.2em] font-sans">Batch Variable Costs</p>
          <Input
            label="Packaging per Unit"
            type="number"
            value={packagingPerUnit}
            onChange={(e) => setPackagingPerUnit(e.target.value)}
            currency
            placeholder="0.00"
            helperText="Jars, labels, boxes per item"
          />
          <Input
            label="Current Batch Size"
            type="number"
            value={batchSize}
            onChange={(e) => setBatchSize(e.target.value)}
            placeholder="e.g. 50"
            helperText="Units in this specific batch"
          />
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-lg border border-border-subtle space-y-md">
        <p className="text-xs font-bold text-ink-500 uppercase tracking-widest font-sans">Overhead Breakdown (per Batch)</p>
        <div className="space-y-sm">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-ink-500">Allocated Rent</span>
            <span className="font-mono text-ink-900">₱{calculation.rentPerBatch.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-ink-500">Allocated Utilities</span>
            <span className="font-mono text-ink-900">₱{calculation.utilitiesPerBatch.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-ink-500">Total Packaging</span>
            <span className="font-mono text-ink-900">₱{calculation.packagingTotal.toFixed(2)}</span>
          </div>
          <div className="pt-md mt-sm border-t border-border-subtle flex justify-between items-end">
            <span className="text-sm font-bold text-ink-900">Estimated Total Overhead</span>
            <span className="text-2xl font-bold text-clay">
              ₱{calculation.total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <Button
        className="w-full py-lg rounded-xl font-bold tracking-tight"
        variant="primary"
        onClick={() => onApply(calculation.total)}
        disabled={calculation.total <= 0}
      >
        Apply to Overhead Cost
      </Button>
    </div>
  );
};
