import type React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import { Card } from '../shared/Card';

interface SnapshotComparisonCardProps {
  currentTotalCost: number;
  currentRecommendedPrice: number;
  currentMargin: number;
  lastTotalCost: number;
  lastRecommendedPrice: number;
  lastMargin: number;
  lastSnapshotDate: string;
}

export const SnapshotComparisonCard: React.FC<SnapshotComparisonCardProps> = ({
  currentTotalCost,
  currentRecommendedPrice,
  currentMargin,
  lastTotalCost,
  lastRecommendedPrice,
  lastMargin,
  lastSnapshotDate,
}) => {
  const costDelta = currentTotalCost - lastTotalCost;
  const priceDelta = currentRecommendedPrice - lastRecommendedPrice;
  const marginDelta = currentMargin - lastMargin;

  const renderDelta = (delta: number, isPercent = false, invertColor = false) => {
    if (Math.abs(delta) < 0.01) {
      return (
        <span className="flex items-center text-ink-500 text-sm">
          <Minus className="w-4 h-4 mr-1" />
          No change
        </span>
      );
    }

    const isPositive = delta > 0;
    // For cost, positive is bad (red/rust), negative is good (green/moss)
    // For price/margin, positive is usually good (green/moss), negative is bad (red/rust)
    const isGood = invertColor ? !isPositive : isPositive;
    const colorClass = isGood ? 'text-moss' : 'text-rust';
    const Icon = isPositive ? TrendingUp : TrendingDown;

    const formatted = isPercent ? formatPercent(Math.abs(delta)) : formatCurrency(Math.abs(delta));

    return (
      <span className={`flex items-center font-medium ${colorClass}`}>
        <Icon className="w-4 h-4 mr-1" />
        {isPositive ? '+' : '-'}
        {formatted}
      </span>
    );
  };

  return (
    <Card className="bg-surface/50 border-dashed">
      <div className="space-y-md">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-serif text-ink-900">Comparison with Last Milestone</h3>
            <p className="text-sm text-ink-500">Since {formatDate(lastSnapshotDate)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="p-sm bg-white/50 rounded-lg border border-border-subtle">
            <p className="text-xs text-ink-500 uppercase tracking-wider mb-xs">Total Cost</p>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-ink-900">
                {formatCurrency(currentTotalCost)}
              </span>
              {renderDelta(costDelta, false, true)}
            </div>
          </div>

          <div className="p-sm bg-white/50 rounded-lg border border-border-subtle">
            <p className="text-xs text-ink-500 uppercase tracking-wider mb-xs">Suggested Price</p>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-ink-900">
                {formatCurrency(currentRecommendedPrice)}
              </span>
              {renderDelta(priceDelta)}
            </div>
          </div>

          <div className="p-sm bg-white/50 rounded-lg border border-border-subtle">
            <p className="text-xs text-ink-500 uppercase tracking-wider mb-xs">Profit Margin</p>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-ink-900">
                {formatPercent(currentMargin)}
              </span>
              {renderDelta(marginDelta, true)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
