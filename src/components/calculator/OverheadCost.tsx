import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, HelpCircle, AlertCircle } from 'lucide-react';
import { Input, Button, Tooltip, Card, Badge } from '../shared';

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

  // Helper states
  const [monthlyRent, setMonthlyRent] = useState<string>('');
  const [batchesPerMonth, setBatchesPerMonth] = useState<string>('');
  const [monthlyUtilities, setMonthlyUtilities] = useState<string>('');
  const [packagingPerUnit, setPackagingPerUnit] = useState<string>('');
  const [marketingAllocation, setMarketingAllocation] = useState<string>('');

  const rentPerBatch = (parseFloat(monthlyRent) || 0) / (parseFloat(batchesPerMonth) || 1);
  const utilitiesPerBatch = (parseFloat(monthlyUtilities) || 0) / (parseFloat(batchesPerMonth) || 1);
  const packagingTotal = (parseFloat(packagingPerUnit) || 0) * batchSize;
  const marketingTotal = parseFloat(marketingAllocation) || 0;

  const calculatedTotal = rentPerBatch + utilitiesPerBatch + packagingTotal + marketingTotal;

  const applyCalculated = () => {
    onChange(calculatedTotal);
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
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-6 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rent & Utilities Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 border-b pb-1">Facility Costs</h4>
              <Input
                label="Monthly Rent"
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                currency
                placeholder="0.00"
              />
              <Input
                label="Monthly Utilities"
                type="number"
                value={monthlyUtilities}
                onChange={(e) => setMonthlyUtilities(e.target.value)}
                currency
                placeholder="0.00"
              />
              <Input
                label="Batches per Month"
                type="number"
                value={batchesPerMonth}
                onChange={(e) => setBatchesPerMonth(e.target.value)}
                placeholder="e.g. 20"
              />
              <div className="text-[11px] text-gray-500 italic">
                Allocated Rent + Utilities: ₱{(rentPerBatch + utilitiesPerBatch).toFixed(2)}
              </div>
            </div>

            {/* Packaging & Marketing Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 border-b pb-1">Variable & Other</h4>
              <Input
                label="Packaging per Unit"
                type="number"
                value={packagingPerUnit}
                onChange={(e) => setPackagingPerUnit(e.target.value)}
                currency
                placeholder="0.00"
              />
              <div className="text-[11px] text-gray-500 px-1">
                Batch Size: {batchSize} units
              </div>
              <Input
                label="Marketing Allocation"
                type="number"
                value={marketingAllocation}
                onChange={(e) => setMarketingAllocation(e.target.value)}
                currency
                placeholder="0.00"
                helperText="Ads, flyers, promos per batch"
              />
              <div className="pt-2 text-[11px] text-gray-500 italic">
                Allocated Packaging + Marketing: ₱{(packagingTotal + marketingTotal).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total Calculated: </span>
              <span className="font-bold text-gray-900 dark:text-white text-lg">
                ₱{calculatedTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <Button
              variant="primary"
              onClick={applyCalculated}
              type="button"
            >
              Apply to Overhead
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
