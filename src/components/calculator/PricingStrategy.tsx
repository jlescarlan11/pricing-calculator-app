import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { formatCurrency } from '../../utils/formatters';
import { calculateRecommendedPrice } from '../../utils/calculations';
import type { PricingStrategy as StrategyType } from '../../types/calculator';

interface PricingStrategyProps {
  strategy: StrategyType;
  value: number;
  costPerUnit: number;
  onChange: (strategy: StrategyType, value: number) => void;
}

export const PricingStrategy: React.FC<PricingStrategyProps> = ({
  strategy,
  value,
  costPerUnit,
  onChange,
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleStrategyChange = (newStrategy: StrategyType) => {
    // When switching to margin, ensure value is within valid range (0-99.9)
    let newValue = value;
    if (newStrategy === 'margin' && value >= 100) {
      newValue = 25; // Default sensible margin
    }
    onChange(newStrategy, newValue);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    const validatedValue = strategy === 'margin' ? Math.min(99.9, newValue) : newValue;
    onChange(strategy, validatedValue);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(strategy, parseFloat(e.target.value));
  };

  const recommendedPrice = calculateRecommendedPrice(costPerUnit, strategy, value);
  const profit = recommendedPrice - costPerUnit;

  // Static example to help visualize
  const exampleCost = 100;
  const examplePrice = calculateRecommendedPrice(exampleCost, strategy, value);
  const exampleProfit = examplePrice - exampleCost;

  return (
    <Card 
      title={
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-bold text-gray-900">Pricing Strategy</h3>
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium transition-colors"
            aria-label="Help with pricing strategies"
          >
            <HelpCircle className="h-4 w-4" />
            <span>How to choose?</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Strategy Selection - Tabs/Radio style */}
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => handleStrategyChange('markup')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
              strategy === 'markup' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Markup
          </button>
          <button
            type="button"
            onClick={() => handleStrategyChange('margin')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
              strategy === 'margin' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Profit Margin
          </button>
        </div>

        {/* Visual Explanation */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          {strategy === 'markup' ? (
            <div className="space-y-2">
              <p className="text-sm text-blue-800 font-medium">
                Add <span className="text-blue-600">{value}%</span> to your cost
              </p>
              <p className="text-xs text-blue-600/80">
                Example: If your cost is {formatCurrency(exampleCost)}, 
                adding {value}% markup results in a price of {formatCurrency(examplePrice)} 
                ({formatCurrency(exampleProfit)} profit).
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-blue-800 font-medium">
                Keep <span className="text-blue-600">{value}%</span> of sale price as profit
              </p>
              <p className="text-xs text-blue-600/80">
                Example: To earn a {value}% margin on a {formatCurrency(exampleCost)} cost, 
                your price should be {formatCurrency(examplePrice)} 
                ({formatCurrency(exampleProfit)} profit).
              </p>
            </div>
          )}
        </div>

        {/* Value Inputs */}
        <div className="space-y-4">
          <Input
            label={`${strategy === 'markup' ? 'Markup' : 'Margin'} Percentage`}
            type="number"
            value={value}
            onChange={handleValueChange}
            suffix="%"
            min={0}
            max={strategy === 'margin' ? 99.9 : undefined}
            step="0.1"
          />

          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max={strategy === 'margin' ? "95" : "300"}
              step="1"
              value={value}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 font-medium">
              <span>0%</span>
              <span>{strategy === 'margin' ? '95%' : '300%'}</span>
            </div>
          </div>
        </div>

        {/* Real-time Result */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Recommended Price</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(recommendedPrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Profit per Unit</p>
              <p className="text-sm font-bold text-green-600">+{formatCurrency(profit)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Understanding Pricing Strategies"
      >
        <div className="space-y-6">
          <section>
            <h4 className="font-bold text-gray-900 mb-2">What is Markup?</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Markup is the percentage added to the cost price to determine the selling price. 
              It&apos;s the most common way small businesses think about profit.
            </p>
            <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-100">
              <p className="text-xs text-gray-500 italic">
                Formula: Selling Price = Cost × (1 + Markup %)
              </p>
            </div>
          </section>

          <section>
            <h4 className="font-bold text-gray-900 mb-2">What is Profit Margin?</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Profit Margin is the percentage of the <strong>selling price</strong> that is profit. 
              Retailers often use this to understand how much of their total revenue is actually theirs to keep.
            </p>
            <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-100">
              <p className="text-xs text-gray-500 italic">
                Formula: Selling Price = Cost ÷ (1 - Margin %)
              </p>
            </div>
          </section>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="text-sm font-bold text-blue-900 mb-2">Important Distinction</h4>
            <p className="text-sm text-blue-800">
              A 25% Markup is NOT the same as a 25% Margin. To get a 25% Margin, you actually need a 33.3% Markup!
            </p>
          </div>
          
          <Button onClick={() => setIsHelpOpen(false)} className="w-full">
            I Understand
          </Button>
        </div>
      </Modal>
    </Card>
  );
};
