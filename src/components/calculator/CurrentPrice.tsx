import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { Input, Button, Card } from '../shared';

interface CurrentPriceProps {
  value?: number;
  onChange: (value?: number) => void;
  error?: string;
  embedded?: boolean;
}

export const CurrentPrice: React.FC<CurrentPriceProps> = ({
  value,
  onChange,
  error,
  embedded = false,
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

  if (embedded) {
    return (
      <div className="space-y-sm" data-testid="current-price-section">
        <div className="flex items-center justify-between mb-xs">
          <h4 className="text-sm font-medium text-ink-900 uppercase tracking-wide">
            Current Price
          </h4>
          <Button
            variant="ghost"
            onClick={toggleVisibility}
            className="text-clay hover:text-clay hover:bg-clay/10 py-xs px-sm h-auto text-xs font-medium rounded transition-all duration-300 flex items-center gap-xs"
          >
            {isVisible ? 'Hide' : 'Compare'}
            {isVisible ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </div>
        {isVisible && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-300">
            <Input
              type="number"
              value={value ?? ''}
              onChange={handleInputChange}
              currency
              placeholder="0.00"
              error={error}
              min={0}
              step="0.01"
              className="w-full"
              autoFocus
            />
          </div>
        )}
      </div>
    );
  }

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
            {isVisible ? 'Hide' : 'Compare'}
            {isVisible ? (
              <ChevronUp className="w-4 h-4 ml-xs" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-xs" />
            )}
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
              helperText="See how your current price compares to our recommendation."
              min={0}
              step="0.01"
            />
          </div>
        )}
      </div>
    </Card>
  );
};
