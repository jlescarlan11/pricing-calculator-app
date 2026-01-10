import type React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import { Card } from '../shared/Card';
import type { MarketDataContext } from './AnalyzePriceCard';

interface SnapshotComparisonCardProps {
  currentTotalCost: number;
  currentRecommendedPrice: number;
  currentMargin: number;
  lastTotalCost: number;
  lastRecommendedPrice: number;
  lastMargin: number;
  lastSnapshotDate: string;
  versionNumber?: number;
  variantName?: string;
  marketData?: MarketDataContext;
}

export const SnapshotComparisonCard: React.FC<SnapshotComparisonCardProps> = ({
  currentTotalCost,
  currentRecommendedPrice,
  currentMargin,
  lastTotalCost,
  lastRecommendedPrice,
  lastMargin,
  lastSnapshotDate,
  versionNumber,
  variantName,
  marketData,
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

  const getMarketContextMessage = () => {
    if (!marketData) return null;
    const { status, oldestCompetitorDate } = marketData;

    if (status === 'missing') return 'Based on internal cost efficiency.';
    
    if (status === 'insufficient') {
      return 'Based on limited market data (less than 2 competitors).';
    }

    if (oldestCompetitorDate) {
      return `Based on market data from ${formatDate(oldestCompetitorDate)}.`;
    }
    
    return 'Based on recent market analysis.';
  };

  return (
    <Card className="bg-surface/50 border-dashed">
      <div className="space-y-md">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-serif text-ink-900">
              {versionNumber ? `Comparison with Version ${versionNumber}` : 'Comparison with Milestone'}
            </h3>
            <p className="text-sm text-ink-500">
              {variantName ? (
                <span>
                  Applying to <span className="font-bold text-ink-700">&apos;{variantName}&apos;</span>
                </span>
              ) : (
                `Since ${formatDate(lastSnapshotDate)}`
              )}
            </p>
          </div>
          {variantName && (
            <p className="text-[10px] text-ink-300 font-bold uppercase tracking-widest">
              Since {formatDate(lastSnapshotDate)}
            </p>
          )}
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

        {marketData && (
          <div className="flex items-center gap-xs text-[10px] text-ink-300 font-medium uppercase tracking-wider pt-sm border-t border-border-subtle/30">
            <Info className="w-3 h-3" />
            {getMarketContextMessage()}
          </div>
        )}
      </div>
    </Card>
  );
};
