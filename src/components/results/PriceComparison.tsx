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
    statusColor = "text-amber-700 bg-amber-50 border-amber-200";
  } else if (isHigher) {
    statusMessage = `You're overpriced by ${formatCurrency(absDiff)} per unit`;
    statusIcon = <TrendingDown className="w-5 h-5 shrink-0" />;
    statusColor = "text-rose-700 bg-rose-50 border-rose-200";
  } else {
    statusMessage = "You're priced competitively";
    statusIcon = <CheckCircle className="w-5 h-5 shrink-0" />;
    statusColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  }

  return (
    <Card title="Price Comparison" className={className}>
      <div className="space-y-6">
        {/* Visual Comparison */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-center sm:text-left flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Current Price
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentPrice)}
            </p>
          </div>
          
          <div className="hidden sm:flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-gray-300" />
          </div>
          
          <div className="text-center sm:text-right flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Recommended
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(recommendedPrice)}
            </p>
          </div>
        </div>

        {/* Opportunity Cost Message */}
        <div className={`p-4 rounded-xl border flex items-start sm:items-center gap-3 transition-colors ${statusColor}`}>
          {statusIcon}
          <span className="font-bold text-sm sm:text-base">
            {statusMessage}
          </span>
        </div>

        {/* Profitability at Current Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-tight mb-1">
              Current Profit / Unit
            </p>
            <p className={`text-xl font-bold ${currentProfitPerUnit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(currentProfitPerUnit)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Earnings at your current price
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-tight mb-1">
              Current Profit / Batch
            </p>
            <p className={`text-xl font-bold ${currentProfitPerBatch >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(currentProfitPerBatch)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Total batch earnings
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
