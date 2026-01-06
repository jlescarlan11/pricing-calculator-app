import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Input, Button, Tooltip, Card } from '../shared';

interface LaborCostProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  label?: string;
}

export const LaborCost: React.FC<LaborCostProps> = ({ value, onChange, error, label }) => {
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

  const HelperButton = ({ className = '' }: { className?: string }) => (
    <Button
      variant="ghost"
      onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
      className={`text-clay hover:text-clay hover:bg-clay/10 py-xs px-md text-xs rounded-sm h-auto ${className}`}
    >
      <Calculator className="w-4 h-4 mr-sm shrink-0" />
      <span className="whitespace-nowrap">
        {isCalculatorOpen ? 'Hide Calculator' : 'Open Calculator'}
      </span>
      {isCalculatorOpen ? (
        <ChevronUp className="w-4 h-4 ml-xs shrink-0" />
      ) : (
        <ChevronDown className="w-4 h-4 ml-xs shrink-0" />
      )}
    </Button>
  );

  return (
    <Card>
      <div className="space-y-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <h3 className="text-lg font-bold text-ink-900 leading-tight">
              {label || 'Labor Cost'}
            </h3>
            <Tooltip content="Total cost of labor for this batch. You can enter a fixed amount or use the calculator below.">
              <button
                type="button"
                className="text-ink-500 hover:text-clay cursor-help transition-colors shrink-0"
                aria-label="More info about labor cost"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
          <HelperButton className="hidden md:flex" />
        </div>

        <div className="space-y-sm">
          <Input
            label={label ? `Total ${label}` : 'Total Labor Cost'}
            type="number"
            value={value === 0 ? '' : value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            currency
            placeholder="0.00"
            error={error}
            min={0}
            step="0.01"
          />
          <div className="flex justify-end md:hidden">
            <HelperButton />
          </div>
        </div>

        {isCalculatorOpen && (
          <div className="bg-surface-hover rounded-xl p-lg space-y-lg border border-border-subtle animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="space-y-sm text-sm text-ink-700">
              <p className="font-medium text-ink-900">
                Your time is valuable—include it in labor costs.
              </p>
              <p>Labor Cost = Time Spent × Hourly Rate</p>
              <div className="bg-surface p-sm rounded-sm border border-border-subtle text-xs font-mono text-ink-500">
                Example: 4 hours × ₱100/hour = ₱400
              </div>
            </div>

            <div className="grid grid-cols-2 gap-lg">
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

            <div className="flex items-center justify-between pt-lg border-t border-border-subtle">
              <div className="text-sm">
                <span className="text-ink-500">Calculated: </span>
                <span className="font-bold text-ink-900 text-xl tracking-tight">
                  ₱
                  {calculatedTotal.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <Button
                variant="primary"
                onClick={calculateAndApply}
                disabled={!hours || !rate}
                type="button"
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
