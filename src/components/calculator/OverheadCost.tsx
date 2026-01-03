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
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overhead Cost</h3>
          <Tooltip content={
            <div className="space-y-2">
              <p>Overhead includes all indirect costs of running your business.</p>
              <p className="text-xs font-medium">Examples:</p>
              <ul className="text-xs list-disc pl-4 space-y-1">
                <li>Rent and Utilities (divided by batches)</li>
                <li>Packaging (pouches, jars, labels)</li>
                <li>Marketing (ads, flyers)</li>
                <li>Equipment maintenance</li>
              </ul>
            </div>
          }>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 cursor-help"
              aria-label="More info about overhead cost"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
        <Button
          variant="ghost"
          onClick={() => setIsHelperOpen(!isHelperOpen)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-1 px-3 text-xs"
        >
          <Calculator className="w-4 h-4 mr-2" />
          {isHelperOpen ? 'Hide Helper' : 'Overhead Helper'}
          {isHelperOpen ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
        </Button>
      </div>

      <div className="space-y-2">
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
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="warning" className="flex items-center gap-1 text-[10px] py-0">
              <AlertCircle className="w-3 h-3" />
              Overhead is zero. Are you sure?
            </Badge>
          </div>
        )}
      </div>

      {isHelperOpen && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <OverheadCalculator 
            onApply={handleApplyOverhead}
            initialBatchSize={batchSize}
          />
        </div>
      )}
    </Card>
  );
};
