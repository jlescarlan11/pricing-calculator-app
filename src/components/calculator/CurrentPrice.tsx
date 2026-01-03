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
    <Card>
      <div className="space-y-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <Tag className="w-5 h-5 text-clay" />
            <h3 className="text-lg font-bold text-ink-900 tracking-tight">Current Price</h3>
          </div>
          <Button
            variant="ghost"
            onClick={toggleVisibility}
            className="text-clay hover:text-clay hover:bg-clay/10 py-xs px-md text-xs rounded-lg transition-all duration-300"
          >
            {isVisible ? 'Remove Comparison' : 'Compare Current'}
            {isVisible ? <ChevronUp className="w-4 h-4 ml-xs" /> : <ChevronDown className="w-4 h-4 ml-xs" />}
          </Button>
        </div>

        {isVisible && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-500">
            <Input
              label="Current Selling Price"
              type="number"
              value={value ?? ''}
              onChange={handleInputChange}
              currency
              placeholder="0.00"
              error={error}
              helperText="Compare what you currently charge against the recommended price."
              min={0}
              step="0.01"
            />
          </div>
        )}
      </div>
    </Card>
  );
};
