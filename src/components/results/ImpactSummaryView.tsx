import React from 'react';
import type { CalculationResult, PricingConfig } from '../../types/calculator';
import { Card } from '../shared';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { calculateRecommendedPrice } from '../../utils/calculations';
import { TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

interface ImpactSummaryViewProps {
  results: CalculationResult;
  previousConfig?: PricingConfig | null;
  suggestedMargin?: number;
}

/**
 * A concise summary view for when many variants are affected by a price change.
 * Activates when > 3 variants are affected by strategy changes or analysis.
 */
export const ImpactSummaryView: React.FC<ImpactSummaryViewProps> = ({
  results,
  previousConfig,
  suggestedMargin,
}) => {
  const variantResults = results.variantResults;
  if (!variantResults || variantResults.length === 0) return null;

  const impacts = variantResults.map((variant) => {
    let oldPrice: number;
    let newPrice: number;

    if (suggestedMargin !== undefined) {
      // Impact of analysis suggestion vs current recommendation
      oldPrice = variant.recommendedPrice;
      newPrice = calculateRecommendedPrice(variant.costPerUnit, 'margin', suggestedMargin);
    } else if (previousConfig) {
      // Impact of strategy preview vs original strategy
      oldPrice = calculateRecommendedPrice(
        variant.costPerUnit,
        previousConfig.strategy,
        previousConfig.value
      );
      newPrice = variant.recommendedPrice;
    } else {
      // Default: Recommended vs Current (not exactly "impact of change" but a fallback)
      oldPrice = variant.currentSellingPrice || variant.costPerUnit;
      newPrice = variant.recommendedPrice;
    }

    return {
      name: variant.name,
      oldPrice,
      newPrice,
      delta: newPrice - oldPrice,
      percentChange: oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0,
    };
  });

  const totalDelta = impacts.reduce((sum, imp) => sum + imp.delta, 0);
  const avgDelta = totalDelta / impacts.length;
  const avgPercentChange = impacts.reduce((sum, imp) => sum + imp.percentChange, 0) / impacts.length;

  // Find most impacted variant (highest absolute percentage change)
  const mostImpacted = [...impacts].sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))[0];

  const isPositive = avgDelta >= 0;

  return (
    <Card className="overflow-hidden border-moss/20 bg-moss/[0.02]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-xl">
        {/* Aggregated Summary */}
        <div className="flex-1 space-y-md">
          <div className="flex items-center gap-sm">
            <div className={`p-sm rounded-round ${isPositive ? 'bg-moss/10 text-moss' : 'bg-rust/10 text-rust'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink-900 uppercase tracking-wider">
                Impact Summary ({variantResults.length} variants)
              </h4>
              <p className="text-xs text-ink-500 font-medium">
                {suggestedMargin !== undefined 
                  ? 'Estimated change if AI strategy is applied.' 
                  : 'Change across all variants based on new strategy.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-xl py-md border-y border-moss/10">
            <div>
              <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-xs">
                Avg. Price Change
              </p>
              <div className="flex items-baseline gap-xs">
                <span className={`text-2xl font-bold tabular-nums ${isPositive ? 'text-moss' : 'text-rust'}`}>
                  {isPositive ? '+' : ''}{formatCurrency(avgDelta)}
                </span>
                <span className={`text-sm font-medium ${isPositive ? 'text-moss/80' : 'text-rust/80'}`}>
                  ({isPositive ? '+' : ''}{formatPercent(avgPercentChange)})
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-xs">
                Batch Profit Impact
              </p>
              <div className="flex items-baseline gap-xs">
                {(() => {
                  const totalProfitImpact = variantResults.reduce((sum, v) => {
                    const imp = impacts.find((i) => i.name === v.name);
                    return sum + (imp?.delta || 0) * v.batchSize;
                  }, 0);
                  const isProfitPositive = totalProfitImpact >= 0;
                  return (
                    <span
                      className={`text-2xl font-bold tabular-nums ${isProfitPositive ? 'text-moss' : 'text-rust'}`}
                    >
                      {isProfitPositive ? '+' : ''}
                      {formatCurrency(totalProfitImpact)}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Most Impacted Variant */}
        <div className="md:w-72 bg-white/50 p-lg rounded-lg border border-moss/10 space-y-md">
          <div className="flex items-center gap-xs">
            <AlertCircle className="w-4 h-4 text-clay" />
            <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest">
              Most Impacted
            </span>
          </div>
          
          <div>
            <p className="text-lg font-bold text-ink-900 truncate" title={mostImpacted.name}>
              {mostImpacted.name}
            </p>
            <div className="flex items-center gap-sm mt-xs">
              <span className="text-xs text-ink-500 tabular-nums">{formatCurrency(mostImpacted.oldPrice)}</span>
              <ArrowRight className="w-3 h-3 text-ink-300" />
              <span className="text-sm font-bold text-ink-900 tabular-nums">{formatCurrency(mostImpacted.newPrice)}</span>
            </div>
          </div>

          <div className={`text-xs font-bold px-sm py-0.5 rounded-sm inline-block ${mostImpacted.delta >= 0 ? 'bg-moss/10 text-moss' : 'bg-rust/10 text-rust'}`}>
            {mostImpacted.delta >= 0 ? '+' : ''}{formatPercent(mostImpacted.percentChange)} shift
          </div>
        </div>
      </div>
    </Card>
  );
};
