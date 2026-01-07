import React, { useState } from 'react';
import { Calculator, HelpCircle, Info } from 'lucide-react';
import { Input, Button, Modal } from '../shared';

interface LaborCostProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  label?: string;
}

export const LaborCost: React.FC<LaborCostProps> = ({ value, onChange, error, label }) => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isHelperOpen, setIsHelperOpen] = useState(false);
  const [hours, setHours] = useState<string>('');
  const [rate, setRate] = useState<string>('');

  const calculateAndApply = () => {
    const h = parseFloat(hours);
    const r = parseFloat(rate);
    if (!isNaN(h) && !isNaN(r)) {
      onChange(h * r);
      setIsCalculatorOpen(false);
    }
  };

  const calculatedTotal = (parseFloat(hours) || 0) * (parseFloat(rate) || 0);

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-xs">
          <div className="flex items-center gap-sm">
            <h3 className="text-lg font-bold text-ink-900 leading-tight">
              {label || 'Labor Cost'}
            </h3>
          </div>
          <p className="text-xs text-ink-500">Pay yourself or your staff</p>
        </div>
        <div className="flex items-center gap-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHelperOpen(true)}
            className="text-ink-400 hover:text-clay hover:bg-clay/5 p-xs h-auto"
            title="Labor Guide"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCalculatorOpen(true)}
            className="text-clay hover:bg-clay/10 py-xs px-md text-xs rounded-sm h-auto flex items-center gap-sm"
          >
            <Calculator className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Calculator</span>
          </Button>
        </div>
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
      </div>

      {/* Helper Modal */}
      <Modal
        isOpen={isHelperOpen}
        onClose={() => setIsHelperOpen(false)}
        title="Labor Cost Guide"
        maxWidth="max-w-[450px]"
      >
        <div className="space-y-xl py-md">
          <div className="flex gap-lg items-start">
            <div className="w-10 h-10 rounded-full bg-clay/10 flex items-center justify-center shrink-0">
              <Info className="w-6 h-6 text-clay" />
            </div>
            <div className="space-y-md">
              <p className="text-ink-700 leading-relaxed">
                Labor cost represents the value of time spent preparing this batch. Even if you are the only worker, you should pay yourself a fair hourly wage.
              </p>
              
              <div className="space-y-lg">
                <div className="space-y-xs">
                  <h5 className="font-bold text-ink-900">Why calculate labor?</h5>
                  <p className="text-sm text-ink-600">
                    If you don&apos;t include labor, you&apos;re only covering your ingredients, not your effort. Proper labor pricing allows you to eventually hire staff.
                  </p>
                </div>
                
                <div className="space-y-xs">
                  <h5 className="font-bold text-ink-900">How to calculate:</h5>
                  <p className="text-sm text-ink-600 font-mono bg-surface p-sm rounded-md border border-border-subtle">
                    Time Spent (hrs) × Hourly Rate = Labor Cost
                  </p>
                </div>
              </div>
            </div>
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
        title="Labor Calculator"
        maxWidth="max-w-[450px]"
      >
        <div className="space-y-xl py-md">
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

          <div className="bg-clay/5 rounded-xl p-lg border border-clay/20 space-y-md shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">
                Calculated Labor
              </span>
              <div className="font-bold text-clay text-3xl tracking-tight">
                ₱
                {calculatedTotal.toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={calculateAndApply}
            disabled={!hours || !rate}
            type="button"
            className="w-full h-14 font-bold"
          >
            Apply to Labor Cost
          </Button>
        </div>
      </Modal>
    </div>
  );
};