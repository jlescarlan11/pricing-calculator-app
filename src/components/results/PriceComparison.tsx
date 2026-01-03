import React from 'react';
import { TrendingUp, TrendingDown, CheckCircle, ArrowRight } from 'lucide-react';
import { Card } from '../shared/Card';
import { formatCurrency } from '../../utils/formatters';

interface PriceComparisonProps {
  currentPrice: number | undefined;
  recommendedPrice: number;
  costPerUnit: number;
  batchSize: number;
  className?: string;
}

/**
 * Compares the user's current selling price with the recommended price.
 * Renders only when currentPrice is provided.
 */
export const PriceComparison: React.FC<PriceComparisonProps> = ({
  currentPrice,
  recommendedPrice,
  costPerUnit,
  batchSize,
  className = '',
}) => {
  // Only render if a valid current selling price is provided
  if (!currentPrice || currentPrice <= 0) {
    return null;
  }

  const diff = currentPrice - recommendedPrice;
  const absDiff = Math.abs(diff);
  const isHigher = diff > 0.01; // Using a small epsilon for float comparison
  const isLower = diff < -0.01;

  const currentProfitPerUnit = currentPrice - costPerUnit;
  const currentProfitPerBatch = currentProfitPerUnit * batchSize;

  let statusMessage = "";
  let statusIcon = null;
  let statusColor = "";

  if (isLower) {
    statusMessage = `You're leaving ${formatCurrency(absDiff)} per unit on the table`;
    statusIcon = <TrendingUp className="w-5 h-5 shrink-0" />;
    statusColor = "text-ink-900 bg-sakura/10 border-sakura/20";
  } else if (isHigher) {
    statusMessage = `You're overpriced by ${formatCurrency(absDiff)} per unit`;
    statusIcon = <TrendingDown className="w-5 h-5 shrink-0" />;
    statusColor = "text-rust bg-rust/5 border-rust/10";
  } else {
    statusMessage = "You're priced competitively";
    statusIcon = <CheckCircle className="w-5 h-5 shrink-0" />;
    statusColor = "text-moss bg-moss/5 border-moss/10";
  }

  return (
    <Card title={<span className="text-ink-900">Price Comparison</span>} className={className}>
      <div className="space-y-xl">
        {/* Visual Comparison */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-lg p-lg bg-surface rounded-2xl border border-border-subtle">
          <div className="text-center sm:text-left flex-1">
            <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-xs">
              Current Price
            </p>
            <p className="text-3xl font-bold text-ink-900 tracking-tight">
              {formatCurrency(currentPrice)}
            </p>
          </div>
          
          <div className="hidden sm:flex items-center justify-center">
            <ArrowRight className="w-8 h-8 text-border-base" />
          </div>
          
          <div className="text-center sm:text-right flex-1">
            <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-xs">
              Recommended
            </p>
            <p className="text-3xl font-bold text-clay tracking-tight">
              {formatCurrency(recommendedPrice)}
            </p>
          </div>
        </div>

        {/* Opportunity Cost Message */}
        <div className={`p-lg rounded-2xl border flex items-start sm:items-center gap-md transition-all duration-500 ${statusColor}`}>
          <div className="p-sm bg-white/50 rounded-lg shadow-sm">
            {statusIcon}
          </div>
          <span className="font-bold text-sm sm:text-lg tracking-tight">
            {statusMessage}
          </span>
        </div>

        {/* Profitability at Current Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
          <div className="p-lg rounded-2xl bg-bg-main border border-border-subtle hover:border-border-base transition-colors">
            <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-sm">
              Current Profit / Unit
            </p>
            <p className={`text-2xl font-bold tracking-tight ${currentProfitPerUnit >= 0 ? 'text-moss' : 'text-rust'}`}>
              {formatCurrency(currentProfitPerUnit)}
            </p>
            <p className="text-xs text-ink-500 mt-sm font-medium">
              Earnings at your current price
            </p>
          </div>

          <div className="p-lg rounded-2xl bg-bg-main border border-border-subtle hover:border-border-base transition-colors">
            <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-sm">
              Current Profit / Batch
            </p>
            <p className={`text-2xl font-bold tracking-tight ${currentProfitPerBatch >= 0 ? 'text-moss' : 'text-rust'}`}>
              {formatCurrency(currentProfitPerBatch)}
            </p>
            <p className="text-xs text-ink-500 mt-sm font-medium">
              Total batch earnings
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
