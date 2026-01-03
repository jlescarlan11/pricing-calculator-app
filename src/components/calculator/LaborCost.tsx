import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Input, Button, Tooltip, Card } from '../shared';

interface LaborCostProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export const LaborCost: React.FC<LaborCostProps> = ({
  value,
  onChange,
  error,
}) => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [hours, setHours] = useState<string>('');
  const [rate, setRate] = useState<string>('');

  const calculateAndApply = () => {
    const h = parseFloat(hours);
    const r = parseFloat(rate);
    if (!isNaN(h) && !isNaN(r)) {
      onChange(h * r);
    }
  };

  const calculatedTotal = (parseFloat(hours) || 0) * (parseFloat(rate) || 0);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Labor Cost</h3>
          <Tooltip content="Total cost of labor for this batch. You can enter a fixed amount or use the calculator below.">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 cursor-help"
              aria-label="More info about labor cost"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
        <Button
          variant="ghost"
          onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-1 px-3 text-xs"
        >
          <Calculator className="w-4 h-4 mr-2" />
          {isCalculatorOpen ? 'Hide Calculator' : 'Labor Calculator'}
          {isCalculatorOpen ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
        </Button>
      </div>

      <Input
        label="Total Labor Cost"
        type="number"
        value={value === 0 ? '' : value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        currency
        placeholder="0.00"
        error={error}
        min={0}
        step="0.01"
      />

      {isCalculatorOpen && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p className="font-medium text-gray-900 dark:text-white">How to calculate:</p>
            <p>Labor Cost = Time Spent × Hourly Rate</p>
            <div className="bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700 text-xs font-mono">
              Example: 4 hours × ₱100/hour = ₱400
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hours Worked"
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g. 4"
              min={0}
              step="0.5"
            />
            <Input
              label="Hourly Rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              currency
              placeholder="e.g. 100"
              min={0}
              step="0.01"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Calculated: </span>
              <span className="font-bold text-gray-900 dark:text-white text-lg">
                ₱{calculatedTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <Button
              variant="primary"
              onClick={calculateAndApply}
              disabled={!hours || !rate}
              type="button"
            >
              Apply to Total
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
