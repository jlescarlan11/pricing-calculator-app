import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, HelpCircle, AlertCircle } from 'lucide-react';
import { Input, Button, Tooltip, Card, Badge } from '../shared';
import { OverheadCalculator } from '../help';

interface OverheadCostProps {
  value: number;
  batchSize: number;
  onChange: (value: number) => void;
  error?: string;
}

export const OverheadCost: React.FC<OverheadCostProps> = ({
  value,
  batchSize,
  onChange,
  error,
}) => {
  const [isHelperOpen, setIsHelperOpen] = useState(false);

  const handleApplyOverhead = (calculatedTotal: number) => {
    onChange(calculatedTotal);
    setIsHelperOpen(false);
  };

  return (
    <Card className="p-lg space-y-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <h3 className="text-lg font-bold text-ink-900">Overhead Cost</h3>
          <Tooltip content={
            <div className="space-y-sm p-xs">
              <p className="font-medium text-ink-900">Overhead includes all indirect costs of running your business.</p>
              <p className="text-xs font-semibold text-ink-700 uppercase tracking-wider">Examples:</p>
              <ul className="text-xs list-disc pl-md space-y-xs text-ink-600">
                <li>Rent and Utilities (divided by batches)</li>
                <li>Packaging (pouches, jars, labels)</li>
                <li>Marketing (ads, flyers)</li>
                <li>Equipment maintenance</li>
              </ul>
            </div>
          }>
            <button
              type="button"
              className="text-ink-500 hover:text-clay cursor-help transition-colors"
              aria-label="More info about overhead cost"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
        <Button
          variant="ghost"
          onClick={() => setIsHelperOpen(!isHelperOpen)}
          className="text-clay hover:text-clay hover:bg-clay/10 py-xs px-md text-xs rounded-lg"
        >
          <Calculator className="w-4 h-4 mr-sm" />
          {isHelperOpen ? 'Hide Helper' : 'Overhead Helper'}
          {isHelperOpen ? <ChevronUp className="w-4 h-4 ml-xs" /> : <ChevronDown className="w-4 h-4 ml-xs" />}
        </Button>
      </div>

      <div className="space-y-sm">
        <Input
          label="Total Overhead Cost per Batch"
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
            <Badge variant="warning" className="flex items-center gap-xs text-[10px] py-xs px-sm uppercase tracking-wide">
              <AlertCircle className="w-3.5 h-3.5" />
              Overhead is zero. Are you sure?
            </Badge>
          </div>
        )}
      </div>

      {isHelperOpen && (
        <div className="bg-bg-main rounded-xl p-sm border border-border-subtle animate-in fade-in slide-in-from-top-2 duration-500 overflow-hidden">
          <OverheadCalculator 
            onApply={handleApplyOverhead}
            initialBatchSize={batchSize}
          />
        </div>
      )}
    </Card>
  );
};
