import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { Input, Button, Card } from '../shared';

interface CurrentPriceProps {
  value?: number;
  onChange: (value?: number) => void;
  error?: string;
}

export const CurrentPrice: React.FC<CurrentPriceProps> = ({
  value,
  onChange,
  error,
}) => {
  const [isVisible, setIsVisible] = useState(value !== undefined && value > 0);

  const toggleVisibility = () => {
    if (isVisible) {
      // Clear value when hiding to avoid accidental price comparison
      onChange(undefined);
    }
    setIsVisible(!isVisible);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(isNaN(val) ? undefined : val);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Price</h3>
        </div>
        <Button
          variant="ghost"
          onClick={toggleVisibility}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-1 px-3 text-xs"
        >
          {isVisible ? 'Remove Comparison' : 'Compare with Current Price'}
          {isVisible ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
        </Button>
      </div>

      {isVisible && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <Input
            label="Current Selling Price (optional)"
            type="number"
            value={value ?? ''}
            onChange={handleInputChange}
            currency
            placeholder="0.00"
            error={error}
            helperText="Enter what you currently charge to compare it against the calculated recommended price."
            min={0}
            step="0.01"
          />
        </div>
      )}
    </Card>
  );
};
