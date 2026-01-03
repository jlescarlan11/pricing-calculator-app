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
    <Card title="Pricing Recommendation" className={className}>
      <div className="space-y-8">
        {/* Recommended Selling Price - Primary Focus */}
        <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-1">
            Recommended Selling Price
          </p>
          <p className="text-5xl font-black text-blue-900 mb-2">
            {formatCurrency(recommendedPrice)}
          </p>
          <div className="flex justify-center mt-3">
            <Badge variant={badgeDetails.variant} className="text-sm py-1 px-3">
              {badgeDetails.label}
            </Badge>
          </div>
        </div>

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1 p-4 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-tight">
              Break-even Price
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(breakEvenPrice)}
            </p>
            <p className="text-xs text-gray-500">
              Price to cover all costs
            </p>
          </div>

          <div className="space-y-1 p-4 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-tight">
              Profit Margin
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPercent(profitMarginPercent)}
            </p>
            <p className="text-xs text-gray-500">
              Percentage of selling price
            </p>
          </div>

          <div className="space-y-1 p-4 rounded-lg bg-emerald-50 border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-tight">
              Profit Per Unit
            </p>
            <p className="text-2xl font-bold text-emerald-900">
              {formatCurrency(profitPerUnit)}
            </p>
            <p className="text-xs text-emerald-600/70">
              Earnings after costs
            </p>
          </div>

          <div className="space-y-1 p-4 rounded-lg bg-emerald-50 border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-tight">
              Total Batch Profit
            </p>
            <p className="text-2xl font-bold text-emerald-900">
              {formatCurrency(profitPerBatch)}
            </p>
            <p className="text-xs text-emerald-600/70">
              Total earnings for this run
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
