import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';
import { Switch } from '../shared/Switch';
import { PricingExplainerModal } from '../help';
import { formatCurrency, getMarginColor } from '../../utils/formatters';
import {
  calculateRecommendedPrice,
  calculateEquivalentMargin,
  calculateEquivalentMarkup,
  calculateProfitFromPercentage,
  calculateMarginFromProfit,
  calculateMarkupFromProfit,
  getMarginFromStrategyValue,
} from '../../utils/calculations';
import type { PricingStrategy as StrategyType } from '../../types/calculator';

interface PricingStrategyProps {
  strategy: StrategyType;
  value: number;
  inputMode?: 'percentage' | 'profit';
  costPerUnit: number;
  includeTax?: boolean;
  taxRate?: number;
  onChange: (strategy: StrategyType, value: number) => void;
  onInputModeChange?: (mode: 'percentage' | 'profit') => void;
  onTaxChange?: (includeTax: boolean, taxRate: number) => void;
  embedded?: boolean;
}

export const PricingStrategy: React.FC<PricingStrategyProps> = ({
  strategy,
  value,
  inputMode = 'percentage',
  costPerUnit,
  includeTax = false,
  taxRate = 12,
  onChange,
  onInputModeChange,
  onTaxChange,
  embedded = false,
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleStrategyChange = (newStrategy: StrategyType) => {
    if (newStrategy === strategy) return;

    let newValue: number;
    if (newStrategy === 'margin') {
      newValue = calculateEquivalentMargin(value);
    } else {
      newValue = calculateEquivalentMarkup(value);
    }

    onChange(newStrategy, newValue);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    const validatedValue = strategy === 'margin' ? Math.min(99.9, newValue) : newValue;
    onChange(strategy, validatedValue);
  };

  const handleProfitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetProfit = parseFloat(e.target.value) || 0;
    let newPercentage: number;
    if (strategy === 'margin') {
      newPercentage = calculateMarginFromProfit(costPerUnit, targetProfit);
    } else {
      newPercentage = calculateMarkupFromProfit(costPerUnit, targetProfit);
    }
    onChange(strategy, newPercentage);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(strategy, parseFloat(e.target.value));
  };

  const handleTaxToggle = (checked: boolean) => {
    onTaxChange?.(checked, taxRate);
  };

  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value) || 0;
    onTaxChange?.(includeTax, newRate);
  };

  const recommendedPrice = calculateRecommendedPrice(costPerUnit, strategy, value);
  const recommendedPriceInclTax = includeTax
    ? recommendedPrice * (1 + taxRate / 100)
    : recommendedPrice;
  const profit = recommendedPrice - costPerUnit;
  const currentMargin = getMarginFromStrategyValue(strategy, value);
  const healthColor = getMarginColor(currentMargin);

  // Health Zone Slider Gradient Calculation
  const maxSliderValue = strategy === 'margin' ? 95 : 300;
  let stop1: number;
  let stop2: number;

  if (strategy === 'margin') {
    stop1 = (15 / maxSliderValue) * 100;
    stop2 = (25 / maxSliderValue) * 100;
  } else {
    // For markup: 15% margin = 17.65% markup, 25% margin = 33.33% markup
    stop1 = (calculateEquivalentMarkup(15) / maxSliderValue) * 100;
    stop2 = (calculateEquivalentMarkup(25) / maxSliderValue) * 100;
  }

  const sliderBackground = `linear-gradient(to right, 
    #B85C38 0%, #B85C38 ${stop1}%, 
    #E8C5C0 ${stop1}%, #E8C5C0 ${stop2}%, 
    #7A8B73 ${stop2}%, #7A8B73 100%)`;

  // Real-money visualization
  const hasValidCost = costPerUnit > 0;
  const displayCost = hasValidCost ? costPerUnit : 100;
  const examplePrice = calculateRecommendedPrice(displayCost, strategy, value);
  const examplePriceInclTax = includeTax ? examplePrice * (1 + taxRate / 100) : examplePrice;
  const exampleProfit = examplePrice - displayCost;
  const exampleMargin = getMarginFromStrategyValue(strategy, value);
  const exampleHealthColor = getMarginColor(exampleMargin);

  const content = (
    <div className="space-y-xl">
      {/* Strategy and Mode Selection */}
      <div className="space-y-sm">
        <div className="flex p-xs bg-surface rounded-md border border-border-subtle">
          <button
            type="button"
            onClick={() => handleStrategyChange('markup')}
            className={`flex-1 py-sm text-sm font-medium rounded-md transition-all cursor-pointer ${
              strategy === 'markup'
                ? 'bg-clay text-white shadow-level-1'
                : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            Markup
          </button>
          <button
            type="button"
            onClick={() => handleStrategyChange('margin')}
            className={`flex-1 py-sm text-sm font-medium rounded-md transition-all cursor-pointer ${
              strategy === 'margin'
                ? 'bg-clay text-white shadow-level-1'
                : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            Margin
          </button>
        </div>

        <div className="flex p-xs bg-surface-hover/50 rounded-md border border-border-subtle">
          <button
            type="button"
            onClick={() => onInputModeChange?.('percentage')}
            className={`flex-1 py-1.5 text-xs font-medium rounded transition-all cursor-pointer ${
              inputMode === 'percentage'
                ? 'bg-white text-ink-900 shadow-sm'
                : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            Percentage
          </button>
          <button
            type="button"
            onClick={() => onInputModeChange?.('profit')}
            className={`flex-1 py-1.5 text-xs font-medium rounded transition-all cursor-pointer ${
              inputMode === 'profit'
                ? 'bg-white text-ink-900 shadow-sm'
                : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            Profit Goal
          </button>
        </div>
      </div>

      {/* Visual Explanation */}
      {!embedded && (
        <div className="bg-surface border border-border-subtle rounded-md p-lg transition-all duration-500">
          {strategy === 'markup' ? (
            <div className="space-y-sm">
              <p className="text-sm text-ink-900 font-medium">
                Add <span className="text-clay font-bold">{value}%</span> of the cost to your price.
              </p>
              <p className="text-xs text-ink-500 leading-relaxed">
                {hasValidCost ? 'With your cost of' : 'Example: If your cost is'}{' '}
                {formatCurrency(displayCost)}, adding {value}% markup results in a price of{' '}
                {formatCurrency(examplePrice)}
                {includeTax && ` (${formatCurrency(examplePriceInclTax)} incl. tax)`} (
                <span className={`font-semibold text-${exampleHealthColor}`}>
                  {formatCurrency(exampleProfit)} profit
                </span>
                ).
              </p>
            </div>
          ) : (
            <div className="space-y-sm">
              <p className="text-sm text-ink-900 font-medium">
                Keep <span className="text-clay font-bold">{value}%</span> of the price as your
                profit.
              </p>
              <p className="text-xs text-ink-500 leading-relaxed">
                {hasValidCost ? 'With your cost of' : 'Example: If your cost is'}{' '}
                {formatCurrency(displayCost)}, to earn a {value}% margin your price should be{' '}
                {formatCurrency(examplePrice)}
                {includeTax && ` (${formatCurrency(examplePriceInclTax)} incl. tax)`} (
                <span className={`font-semibold text-${exampleHealthColor}`}>
                  {formatCurrency(exampleProfit)} profit
                </span>
                ).
              </p>
            </div>
          )}
        </div>
      )}

      {/* Value Inputs */}
      <div className="space-y-lg">
        {inputMode === 'percentage' ? (
          <Input
            label={`${strategy === 'markup' ? 'Markup' : 'Margin'} Percentage`}
            type="number"
            value={value}
            onChange={handleValueChange}
            suffix="%"
            min={0}
            max={strategy === 'margin' ? 99.9 : undefined}
            step="0.1"
            className={`text-${healthColor} font-bold`}
          />
        ) : (
          <Input
            label="Target Profit (per unit)"
            type="number"
            value={calculateProfitFromPercentage(costPerUnit, strategy, value)}
            onChange={handleProfitChange}
            prefix="₱"
            min={0}
            step="0.01"
            className={`text-${healthColor} font-bold`}
          />
        )}

        <div className="space-y-sm px-xs">
          <input
            type="range"
            min="0"
            max={maxSliderValue}
            step="1"
            value={value}
            onChange={handleSliderChange}
            className="w-full h-1.5 rounded-xs appearance-none cursor-pointer accent-clay"
            style={{ background: sliderBackground }}
          />
          <div className="flex justify-between text-[10px] text-ink-500 font-bold uppercase tracking-widest">
            <span>0%</span>
            <span>{maxSliderValue}%</span>
          </div>
        </div>
      </div>

      {/* Tax Settings */}
      <div className="pt-lg border-t border-border-subtle space-y-lg">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h4 className="text-sm font-medium text-ink-900">Tax Settings</h4>
            <p className="text-xs text-ink-500">Include VAT/Sales Tax in final price</p>
          </div>
          <Switch checked={includeTax} onChange={handleTaxToggle} />
        </div>

        {includeTax && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <Input
              label="Tax Rate"
              type="number"
              value={taxRate}
              onChange={handleTaxRateChange}
              suffix="%"
              min={0}
              max={100}
              step="0.1"
            />
          </div>
        )}
      </div>

      {/* Real-time Result - Hide if no cost per unit calculated */}
      {(!embedded || costPerUnit > 0) && (
        <div className="pt-lg border-t border-border-subtle">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-ink-500 uppercase tracking-widest font-bold mb-xs">
                Recommended Price {includeTax && '(Incl. Tax)'}
              </p>
              <p className={`text-3xl font-bold tracking-tight text-${healthColor}`}>
                {formatCurrency(includeTax ? recommendedPriceInclTax : recommendedPrice)}
              </p>
              {includeTax && (
                <p className="text-xs text-ink-500 mt-1">
                  Base: {formatCurrency(recommendedPrice)} + Tax: {formatCurrency(recommendedPriceInclTax - recommendedPrice)}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-500 font-medium mb-xs">Profit per Unit</p>
              <p className={`text-lg font-bold text-${healthColor}`}>+{formatCurrency(profit)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) {
    return (
      <div className="space-y-md">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-ink-900 uppercase tracking-wide">
            Pricing Strategy
          </h4>
        </div>
        {content}
      </div>
    );
  }

  return (
    <Card
      title={
        <div className="flex flex-wrap items-center justify-between gap-y-sm w-full">
          <h3 className="text-lg text-ink-900 leading-tight">Pricing Strategy</h3>
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="text-clay hover:text-clay/80 flex items-center gap-sm text-sm font-medium transition-colors group shrink-0"
            aria-label="Help with pricing strategies"
          >
            <HelpCircle className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
            <span className="whitespace-nowrap">Learn More</span>
          </button>
        </div>
      }
    >
      {content}

      <PricingExplainerModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        initialTab={strategy}
      />
    </Card>
  );
};
