import React from 'react';
import { Card } from '../shared/Card';
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
  className = '' 
}) => {
  const {
    breakEvenPrice,
    recommendedPrice,
    profitPerUnit,
    profitPerBatch,
    profitMarginPercent,
  } = results;

  const getMarginBadge = (margin: number): { variant: BadgeVariant; label: string } => {
    if (margin < 15) {
      return { variant: 'error', label: 'Very tight margins - risky' };
    }
    if (margin <= 25) {
      return { variant: 'warning', label: 'Modest but workable' };
    }
    return { variant: 'success', label: 'Healthy profit margin' };
  };

  const badgeDetails = getMarginBadge(profitMarginPercent);

  return (
    <Card title={<span className="text-ink-900">Pricing Recommendation</span>} className={className}>
      <div className="space-y-2xl">
        {/* Recommended Selling Price - Primary Focus */}
        <div className="text-center p-2xl bg-surface rounded-2xl border border-border-subtle relative overflow-hidden group">
          <p className="text-[10px] font-bold text-clay uppercase tracking-[0.2em] mb-sm">
            Recommended Selling Price
          </p>
          <p className="text-6xl font-bold text-ink-900 mb-md tracking-tighter transition-transform duration-700 group-hover:scale-105">
            {formatCurrency(recommendedPrice)}
          </p>
          <div className="flex justify-center mt-md">
            <Badge variant={badgeDetails.variant} className="text-sm py-xs px-md tracking-tight">
              {badgeDetails.label}
            </Badge>
          </div>
          {/* Subtle decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-clay/5 rounded-full -mr-16 -mt-16 blur-2xl transition-opacity group-hover:opacity-100 opacity-50" />
        </div>

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-xl">
          <div className="space-y-sm p-lg rounded-2xl bg-bg-main border border-border-subtle hover:border-border-base transition-colors">
            <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest">
              Break-even Price
            </p>
            <p className="text-3xl font-bold text-ink-900 tracking-tight">
              {formatCurrency(breakEvenPrice)}
            </p>
            <p className="text-xs text-ink-500 font-medium">
              Minimum price to cover all costs
            </p>
          </div>

          <div className="space-y-sm p-lg rounded-2xl bg-bg-main border border-border-subtle hover:border-border-base transition-colors">
            <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest">
              Profit Margin
            </p>
            <p className="text-3xl font-bold text-ink-900 tracking-tight">
              {formatPercent(profitMarginPercent)}
            </p>
            <p className="text-xs text-ink-500 font-medium">
              Percentage of final selling price
            </p>
          </div>

          <div className="space-y-sm p-lg rounded-2xl bg-moss/5 border border-moss/10 hover:border-moss/20 transition-colors">
            <p className="text-[10px] font-bold text-moss uppercase tracking-widest">
              Profit Per Unit
            </p>
            <p className="text-3xl font-bold text-moss tracking-tight">
              {formatCurrency(profitPerUnit)}
            </p>
            <p className="text-xs text-moss/70 font-medium">
              Your earnings after all costs
            </p>
          </div>

          <div className="space-y-sm p-lg rounded-2xl bg-moss/5 border border-moss/10 hover:border-moss/20 transition-colors">
            <p className="text-[10px] font-bold text-moss uppercase tracking-widest">
              Total Batch Profit
            </p>
            <p className="text-3xl font-bold text-moss tracking-tight">
              {formatCurrency(profitPerBatch)}
            </p>
            <p className="text-xs text-moss/70 font-medium">
              Total potential for this run
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
