import React from 'react';
import { Badge } from '../shared/Badge';
import type { BadgeVariant } from '../shared/Badge';
import type { CalculationResult } from '../../types/calculator';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface PricingRecommendationsProps {
  results: CalculationResult;
  className?: string;
}

/**
 * Displays key pricing metrics and recommendations based on calculation results.
 * Features a color-coded profit margin indicator and prominent selling price.
 */
export const PricingRecommendations: React.FC<PricingRecommendationsProps> = ({
  results,
  className = '',
}) => {
  const { breakEvenPrice, recommendedPrice, profitPerUnit, profitPerBatch, profitMarginPercent } =
    results;

  const getMarginBadge = (margin: number): { variant: BadgeVariant; label: string } => {
    if (margin < 15) {
      return { variant: 'error', label: 'Tight margin' };
    }
    if (margin <= 25) {
      return { variant: 'warning', label: 'Modest margin' };
    }
    return { variant: 'success', label: 'Healthy margin' };
  };

  const badgeDetails = getMarginBadge(profitMarginPercent);

  return (
    <div className={`space-y-3xl ${className}`}>
      {/* Recommended Selling Price - Primary Focus */}
      <div className="flex flex-col items-center px-2xl py-2xl bg-surface rounded-lg border border-border-subtle relative overflow-hidden group">
        <div className="relative z-10 w-full text-center">
          <p className="text-xs font-semibold text-ink-700 mb-xs">Recommended Selling Price</p>
          <p
            key={recommendedPrice}
            className="font-serif text-5xl sm:text-6xl text-ink-900 tracking-tight transition-transform duration-700 group-hover:scale-105 animate-pulse-once"
          >
            {formatCurrency(recommendedPrice)}
          </p>
          <div className="flex justify-center mt-lg">
            <Badge variant={badgeDetails.variant} className="py-1 px-3">
              {badgeDetails.label}
            </Badge>
          </div>
        </div>
        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-clay/5 rounded-round -mr-16 -mt-16 blur-2xl transition-opacity group-hover:opacity-100 opacity-50" />
      </div>

      {/* Secondary Metrics - Clean List/Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3xl gap-y-xl">
        <div className="flex justify-between items-center group py-sm">
          <p className="text-xs font-medium text-ink-500 uppercase tracking-widest">
            Break-even Price
          </p>
          <p className="text-xl font-bold text-ink-900 tabular-nums">
            {formatCurrency(breakEvenPrice)}
          </p>
        </div>

        <div className="flex justify-between items-center group py-sm">
          <p className="text-xs font-medium text-ink-500 uppercase tracking-widest">
            Profit Margin
          </p>
          <p className="text-xl font-bold text-ink-900 tabular-nums">
            {formatPercent(profitMarginPercent)}
          </p>
        </div>

        <div className="flex justify-between items-center group py-sm">
          <p className="text-xs font-medium text-ink-500 uppercase tracking-widest">
            Profit Per Unit
          </p>
          <p className="text-xl font-bold text-moss tabular-nums">
            {formatCurrency(profitPerUnit)}
          </p>
        </div>

        <div className="flex justify-between items-center group py-sm">
          <p className="text-xs font-medium text-ink-500 uppercase tracking-widest">
            Total Batch Profit
          </p>
          <p className="text-xl font-bold text-moss tabular-nums">
            {formatCurrency(profitPerBatch)}
          </p>
        </div>
      </div>
    </div>
  );
};
