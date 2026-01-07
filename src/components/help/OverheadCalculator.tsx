import React, { useState, useMemo } from 'react';
import { Info, HelpCircle, BookOpen } from 'lucide-react';
import { Input, Button, Tooltip, Modal } from '../shared';

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
  const [isGuideOpen, setIsGuideOpen] = useState(false);

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
      {/* Header with Guide Button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h4 className="text-sm font-bold text-ink-900">Overhead Breakdown</h4>
          <p className="text-xs text-ink-500">Calculate indirect costs for this batch</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsGuideOpen(true)}
          className="text-clay hover:bg-clay/5 h-8 px-3"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Guide
        </Button>
      </div>

      <div className="flex flex-col gap-lg">
        {/* Section 1: Monthly Costs */}
        <div className="bg-white/50 rounded-xl p-lg border border-border-subtle/60 space-y-lg shadow-sm">
          <div className="flex items-center justify-between border-b border-border-subtle pb-sm">
             <p className="text-[10px] font-bold text-ink-500 uppercase tracking-[0.2em] font-sans">
              1. Monthly Fixed Costs
            </p>
            <Tooltip content="Fixed bills you pay regardless of how many units you sell.">
               <HelpCircle className="w-3.5 h-3.5 text-ink-400" />
            </Tooltip>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
            <Input
              label="Monthly Rent"
              type="number"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              currency
              placeholder="0"
              tooltip="Space rental for kitchen, storage, or storefront."
            />
            <Input
              label="Monthly Utilities"
              type="number"
              value={utilities}
              onChange={(e) => setUtilities(e.target.value)}
              currency
              placeholder="0"
              tooltip="Electricity, water, gas, and internet used for the business."
            />
            <Input
              label="Marketing"
              type="number"
              value={marketing}
              onChange={(e) => setMarketing(e.target.value)}
              currency
              placeholder="0"
              tooltip="Social media ads, flyers, or website fees."
            />
            <Input
              label="Maintenance"
              type="number"
              value={maintenance}
              onChange={(e) => setMaintenance(e.target.value)}
              currency
              placeholder="0"
              tooltip="Equipment repairs or cleaning supplies."
            />
          </div>
          <div className="pt-sm">
            <Input
              label="Batches per Month"
              type="number"
              value={batchesPerMonth}
              onChange={(e) => setBatchesPerMonth(e.target.value)}
              placeholder="e.g. 20"
              helperText="Determines how fixed costs are divided."
            />
          </div>
        </div>

        {/* Section 2: Packaging Costs */}
        <div className="bg-white/50 rounded-xl p-lg border border-border-subtle/60 space-y-lg shadow-sm">
           <div className="flex items-center justify-between border-b border-border-subtle pb-sm">
            <p className="text-[10px] font-bold text-ink-500 uppercase tracking-[0.2em] font-sans">
              2. Packaging & Supplies
            </p>
             <Tooltip content="Variable costs that depend on your batch size.">
               <HelpCircle className="w-3.5 h-3.5 text-ink-400" />
            </Tooltip>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
            <Input
              label="Packaging per Unit"
              type="number"
              value={packagingPerUnit}
              onChange={(e) => setPackagingPerUnit(e.target.value)}
              currency
              placeholder="0.00"
              helperText="Box, jar, label, etc."
            />
            <Input
              label="Current Batch Size"
              type="number"
              value={initialBatchSize}
              onChange={() => {}}
              disabled
              placeholder="e.g. 50"
              helperText="From Product Details."
            />
          </div>
        </div>

        {/* Section 3: Result Breakdown */}
        <div className="bg-clay/5 rounded-xl p-lg border border-clay/20 space-y-lg shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-clay uppercase tracking-[0.2em] font-sans">
              3. Allocation Results
            </p>
          </div>
          
          <div className="space-y-sm">
            <div className="flex justify-between text-sm">
              <span className="text-ink-500">Fixed Cost / Batch</span>
              <span className="font-mono text-ink-900">₱{calculation.fixedPerBatch.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-500">Packaging / Batch</span>
              <span className="font-mono text-ink-900">₱{calculation.packagingTotal.toFixed(2)}</span>
            </div>
            <div className="pt-md mt-sm border-t border-clay/10 flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">Total Overhead</span>
                <span className="text-xs text-ink-400 italic font-medium">for this entire batch</span>
              </div>
              <span className="text-3xl font-bold text-clay tabular-nums leading-none">
                ₱
                {calculation.total.toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Button
        className="w-full h-14 font-bold tracking-tight shadow-md hover:shadow-lg transition-all text-lg"
        variant="primary"
        onClick={() => onApply(calculation.total)}
        disabled={calculation.total <= 0}
      >
        Apply to Overhead Cost
      </Button>

      {/* Guide Modal */}
      <Modal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        title="How to calculate your overhead"
      >
        <div className="space-y-xl py-md">
          <div className="flex gap-lg items-start">
             <div className="w-10 h-10 rounded-full bg-clay/10 flex items-center justify-center shrink-0">
                <Info className="w-6 h-6 text-clay" />
             </div>
             <div className="space-y-md">
                <p className="text-ink-700 leading-relaxed">
                  Overhead includes all indirect costs of running your business. This helper automatically allocates a portion of your monthly bills to this specific batch.
                </p>
                
                <div className="space-y-lg">
                  <div className="space-y-xs">
                    <h5 className="font-bold text-ink-900 flex items-center gap-xs">
                      <span className="w-5 h-5 rounded-full bg-ink-900 text-white text-[10px] flex items-center justify-center">1</span>
                      Sum Monthly Expenses
                    </h5>
                    <p className="text-sm text-ink-600 ml-7">
                      Combine fixed costs like rent, utilities (electricity for ovens), marketing, and maintenance.
                    </p>
                  </div>

                  <div className="space-y-xs">
                    <h5 className="font-bold text-ink-900 flex items-center gap-xs">
                      <span className="w-5 h-5 rounded-full bg-ink-900 text-white text-[10px] flex items-center justify-center">2</span>
                      Estimate Monthly Volume
                    </h5>
                    <p className="text-sm text-ink-600 ml-7">
                      Determine how many batches you typically produce in a month to distribute these fixed costs fairly.
                    </p>
                  </div>

                  <div className="space-y-xs">
                    <h5 className="font-bold text-ink-900 flex items-center gap-xs">
                      <span className="w-5 h-5 rounded-full bg-ink-900 text-white text-[10px] flex items-center justify-center">3</span>
                      Identify Packaging per Item
                    </h5>
                    <p className="text-sm text-ink-600 ml-7">
                      Enter the cost of individual packaging (boxes, jars, labels) for a single unit. This is multiplied by your batch size.
                    </p>
                  </div>
                </div>
             </div>
          </div>
          
          <div className="bg-surface p-lg rounded-xl border border-border-subtle">
             <p className="text-sm font-bold text-ink-900 mb-xs">Pro Tip:</p>
             <p className="text-sm text-ink-600 italic">
               "Even if you work from home, try to allocate a small percentage of your electricity and water bills to your business to ensure your prices cover your true costs."
             </p>
          </div>

          <div className="flex justify-end pt-md">
            <Button variant="primary" onClick={() => setIsGuideOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
