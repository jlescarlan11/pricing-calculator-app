import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, HelpCircle, AlertCircle } from 'lucide-react';
import { Input, Button, Tooltip, Card, Badge } from '../shared';
import { OverheadCalculator } from '../help';

interface OverheadCostProps {
  value: number;
  batchSize: number;
  onChange: (value: number) => void;
  error?: string;
  label?: string;
}

interface HelperButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

const HelperButton: React.FC<HelperButtonProps> = ({ isOpen, onClick, className = '' }) => (
  <Button
    variant="ghost"
    onClick={onClick}
    className={`text-clay hover:text-clay hover:bg-clay/10 py-xs px-md text-xs rounded-sm h-auto ${className}`}
  >
    <Calculator className="w-4 h-4 mr-sm shrink-0" />
    <span className="whitespace-nowrap">
      {isOpen ? 'Hide Helper' : 'Open Helper'}
    </span>
    {isOpen ? (
      <ChevronUp className="w-4 h-4 ml-xs shrink-0" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-xs shrink-0" />
    )}
  </Button>
);

export const OverheadCost: React.FC<OverheadCostProps> = ({
  value,
  batchSize,
  onChange,
  error,
  label,
}) => {
  const [isHelperOpen, setIsHelperOpen] = useState(false);

  const handleApplyOverhead = (calculatedTotal: number) => {
    onChange(calculatedTotal);
    setIsHelperOpen(false);
  };

  return (
    <Card>
      <div className="space-y-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <h3 className="text-lg font-bold text-ink-900 leading-tight">
              {label || 'Overhead Cost'}
            </h3>
            <Tooltip
              content={
                <div className="space-y-sm p-xs">
                  <p className="font-medium text-ink-900">
                    Overhead includes all indirect costs of running your business.
                  </p>
                  <p className="text-xs font-semibold text-ink-700 uppercase tracking-wider">
                    Examples:
                  </p>
                  <ul className="text-xs list-disc pl-md space-y-xs text-ink-600">
                    <li>Rent and Utilities (divided by batches)</li>
                    <li>Packaging (pouches, jars, labels)</li>
                    <li>Marketing (ads, flyers)</li>
                    <li>Equipment maintenance</li>
                  </ul>
                </div>
              }
            >
              <button
                type="button"
                className="text-ink-500 hover:text-clay cursor-help transition-colors shrink-0"
                aria-label="More info about overhead cost"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
          <div className="hidden md:block">
            <HelperButton 
              isOpen={isHelperOpen} 
              onClick={() => setIsHelperOpen(!isHelperOpen)} 
            />
          </div>
        </div>

        <div className="space-y-sm">
          <Input
            label={label ? `Total ${label} per Batch` : 'Total Overhead Cost per Batch'}
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
                Zero overhead? This is rare but possible.
              </Badge>
            </div>
          )}
          <div className="flex justify-end md:hidden">
            <HelperButton 
              isOpen={isHelperOpen} 
              onClick={() => setIsHelperOpen(!isHelperOpen)} 
            />
          </div>
        </div>

        {isHelperOpen && (
          <div className="-mx-xl -mb-xl border-t border-border-subtle bg-surface-hover animate-in fade-in slide-in-from-top-2 duration-500">
            <OverheadCalculator onApply={handleApplyOverhead} initialBatchSize={batchSize} />
          </div>
        )}
      </div>
    </Card>
  );
};