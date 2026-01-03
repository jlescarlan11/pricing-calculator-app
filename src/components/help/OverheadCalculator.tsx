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
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 animate-in fade-in duration-500">
        <div className="flex gap-2">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-1">How it&apos;s calculated:</p>
            <p className="opacity-90">
              Formula: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded font-mono text-xs">( (Rent + Utilities) / Batches ) + (Packaging × Batch Size)</code>
            </p>
            <p className="mt-1 opacity-90 text-xs">
              This distributes your monthly fixed costs across your production volume and adds the direct packaging costs for this batch.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fixed Monthly Costs</h4>
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

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Batch Variable Costs</h4>
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

      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Overhead Breakdown (per Batch)</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Allocated Rent</span>
            <span className="font-mono font-medium">₱{calculation.rentPerBatch.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Allocated Utilities</span>
            <span className="font-mono font-medium">₱{calculation.utilitiesPerBatch.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Packaging</span>
            <span className="font-mono font-medium">₱{calculation.packagingTotal.toFixed(2)}</span>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-end">
            <span className="text-sm font-bold text-gray-900 dark:text-white">Estimated Total Overhead</span>
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              ₱{calculation.total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <Button
        className="w-full"
        variant="primary"
        onClick={() => onApply(calculation.total)}
        disabled={calculation.total <= 0}
      >
        Apply to Overhead Cost
      </Button>
    </div>
  );
};
