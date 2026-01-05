import React, { useState, useMemo } from 'react';
import { Info, HelpCircle } from 'lucide-react';
import { Input, Button, Tooltip } from '../shared';

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
  const [marketing, setMarketing] = useState<string>('');
  const [maintenance, setMaintenance] = useState<string>('');
  const [batchesPerMonth, setBatchesPerMonth] = useState<string>('');
  const [packagingPerUnit, setPackagingPerUnit] = useState<string>('');

  const calculation = useMemo(() => {
    const r = parseFloat(rent) || 0;
    const u = parseFloat(utilities) || 0;
    const m = parseFloat(marketing) || 0;
    const mt = parseFloat(maintenance) || 0;
    const bpm = Math.max(parseFloat(batchesPerMonth) || 1, 1);
    const ppu = parseFloat(packagingPerUnit) || 0;
    const bs = initialBatchSize;

    const fixedTotal = r + u + m + mt;
    const fixedPerBatch = fixedTotal / bpm;
    const packagingTotal = ppu * bs;
    const total = fixedPerBatch + packagingTotal;

    return {
      fixedPerBatch,
      packagingTotal,
      total,
    };
  }, [
    rent,
    utilities,
    marketing,
    maintenance,
    batchesPerMonth,
    packagingPerUnit,
    initialBatchSize,
  ]);

  return (
    <div className="space-y-xl p-xl">
      <div className="bg-surface p-lg rounded-lg border border-border-subtle animate-in fade-in duration-700">
        <div className="flex gap-md">
          <Info className="w-6 h-6 text-clay shrink-0 mt-xs" />
          <div className="text-sm text-ink-700">
            <p className="font-bold text-ink-900 mb-sm tracking-tight">
              How to calculate your overhead:
            </p>
            <ol className="space-y-sm list-decimal list-inside opacity-90 leading-relaxed font-medium">
              <li>
                <strong>Sum Monthly Expenses:</strong> Combine your fixed costs like rent,
                utilities, marketing, and maintenance.
              </li>
              <li>
                <strong>Estimate Monthly Volume:</strong> Determine how many batches you typically
                produce in a month to distribute these fixed costs fairly.
              </li>
              <li>
                <strong>Identify Packaging per Item:</strong> Enter the cost of individual packaging
                (boxes, jars, labels) for a single unit.
              </li>
            </ol>
            <p className="mt-sm opacity-70 text-xs font-medium italic">
              This helper automatically allocates a portion of your monthly bills to this specific
              batch and adds the exact cost of your packaging.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-xl">
        <div className="space-y-lg">
          <p className="text-[10px] font-bold text-ink-500 uppercase tracking-[0.2em] font-sans">
            Monthly Costs
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
            <Input
              label="Monthly Rent"
              type="number"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              currency
              placeholder="0"
              tooltip="Space rental for kitchen, storage, or storefront. If working from home, you can allocate a portion of your rent/mortgage."
            />
            <Input
              label="Monthly Utilities"
              type="number"
              value={utilities}
              onChange={(e) => setUtilities(e.target.value)}
              currency
              placeholder="0"
              tooltip="Electricity (ovens, fridges), water, gas, and internet/phone bills used for the business."
            />
            <Input
              label="Marketing"
              type="number"
              value={marketing}
              onChange={(e) => setMarketing(e.target.value)}
              currency
              placeholder="0"
              tooltip="Social media ads, printed flyers, packaging stickers, or website hosting fees."
            />
            <Input
              label="Maintenance"
              type="number"
              value={maintenance}
              onChange={(e) => setMaintenance(e.target.value)}
              currency
              placeholder="0"
              tooltip="Equipment repairs, pest control, cleaning supplies, or tool replacements."
            />
          </div>
          <Input
            label="Batches per Month"
            type="number"
            value={batchesPerMonth}
            onChange={(e) => setBatchesPerMonth(e.target.value)}
            placeholder="e.g. 20"
            helperText="How many batches you make in a month."
          />
        </div>

        <div className="space-y-lg">
          <p className="text-[10px] font-bold text-ink-500 uppercase tracking-[0.2em] font-sans">
            Packaging Costs
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
            <Input
              label="Packaging per Unit"
              type="number"
              value={packagingPerUnit}
              onChange={(e) => setPackagingPerUnit(e.target.value)}
              currency
              placeholder="0.00"
              helperText="Cost of packaging for each item"
            />
            <Input
              label="Current Batch Size"
              type="number"
              value={initialBatchSize}
              onChange={() => {}}
              disabled
              placeholder="e.g. 50"
              helperText="Synchronized with Product Details batch size."
            />
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-lg p-lg border border-border-subtle space-y-md">
        <p className="text-xs font-bold text-ink-500 uppercase tracking-widest font-sans">
          Breakdown (per Batch)
        </p>
        <div className="space-y-sm">
          <div className="flex justify-between text-sm font-medium">
            <div className="flex items-center gap-xs">
              <span className="text-ink-500">Allocated Fixed Costs</span>
              <Tooltip
                content={`Calculated as (Rent + Utilities + Marketing + Maintenance) ÷ Batches per Month (${batchesPerMonth || 1})`}
              >
                <button
                  type="button"
                  className="text-ink-500 hover:text-clay cursor-help transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>
            <span className="font-mono text-ink-900">₱{calculation.fixedPerBatch.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <div className="flex items-center gap-xs">
              <span className="text-ink-500">Total Packaging Cost</span>
              <Tooltip
                content={`Calculated as Packaging per Unit (₱${parseFloat(packagingPerUnit) || 0}) × Batch Size (${initialBatchSize})`}
              >
                <button
                  type="button"
                  className="text-ink-500 hover:text-clay cursor-help transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>
            <span className="font-mono text-ink-900">₱{calculation.packagingTotal.toFixed(2)}</span>
          </div>
          <div className="pt-md mt-sm border-t border-border-subtle flex justify-between items-end">
            <span className="text-sm font-bold text-ink-900">Total Batch Overhead</span>
            <span className="text-2xl font-bold text-clay">
              ₱
              {calculation.total.toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      <Button
        className="w-full py-lg rounded-sm font-bold tracking-tight transition-all"
        variant="primary"
        onClick={() => onApply(calculation.total)}
        disabled={calculation.total <= 0}
      >
        Apply to Overhead Cost
      </Button>
    </div>
  );
};
