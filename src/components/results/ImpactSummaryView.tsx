import React, { useState } from 'react';
import type { CalculationResult, PricingConfig } from '../../types/calculator';
import { Card, Button } from '../shared';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { calculateRecommendedPrice } from '../../utils/calculations';
import { TrendingUp, AlertCircle, ArrowRight, ChevronDown, ChevronUp, Grid } from 'lucide-react';
import { ImpactGridEditor } from './ImpactGridEditor';

interface ImpactSummaryViewProps {
  results: CalculationResult;
  previousConfig?: PricingConfig | null;
  suggestedMargin?: number;
  overrides?: Record<string, number>;
  onOverrideChange?: (id: string, value: number) => void;
}

/**
 * A concise summary view for when many variants are affected by a price change.
 * Activates when > 3 variants are affected by strategy changes or analysis.
 * Now supports an expanded grid view for manual overrides (Psychological Rounding).
 */
export const ImpactSummaryView: React.FC<ImpactSummaryViewProps> = ({
  results,
  previousConfig,
  suggestedMargin,
  overrides = {},
  onOverrideChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const variantResults = results.variantResults;
  if (!variantResults || variantResults.length === 0) return null;

  const handleOverrideChange = (id: string, value: number) => {
    onOverrideChange?.(id, value);
  };

  const impacts = variantResults.map((variant) => {
    let oldPrice: number;
    let newPrice: number;

    if (suggestedMargin !== undefined) {
      // Impact of analysis suggestion vs current recommendation
      oldPrice = variant.recommendedPrice;
      newPrice = overrides[variant.id] ?? calculateRecommendedPrice(variant.costPerUnit, 'margin', suggestedMargin);
    } else if (previousConfig) {
      // Impact of strategy preview vs original strategy
      oldPrice = calculateRecommendedPrice(
        variant.costPerUnit,
        previousConfig.strategy,
        previousConfig.value
      );
      newPrice = overrides[variant.id] ?? variant.recommendedPrice;
    } else {
      // Default: Recommended vs Current (not exactly "impact of change" but a fallback)
      oldPrice = variant.currentSellingPrice || variant.costPerUnit;
      newPrice = overrides[variant.id] ?? variant.recommendedPrice;
    }

    return {
      id: variant.id,
      name: variant.name,
      oldPrice,
      newPrice,
      delta: newPrice - oldPrice,
      percentChange: oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0,
      batchSize: variant.batchSize,
    };
  });

  const totalDelta = impacts.reduce((sum, imp) => sum + imp.delta, 0);
  const avgDelta = totalDelta / impacts.length;
  const avgPercentChange = impacts.reduce((sum, imp) => sum + imp.percentChange, 0) / impacts.length;

  // Find most impacted variant (highest absolute percentage change)
  const mostImpacted = [...impacts].sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))[0];

  const isPositive = avgDelta >= 0;

  return (
    <Card className={`overflow-hidden transition-all duration-500 border-moss/20 ${isExpanded ? 'ring-2 ring-moss/20 ring-offset-2' : 'bg-moss/[0.02]'}`}>
      <div className="p-xl space-y-xl">
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
                    const totalProfitImpact = impacts.reduce((sum, imp) => sum + (imp.delta * imp.batchSize), 0);
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

          {!isExpanded && (
            <div className="md:w-72 bg-white/50 p-lg rounded-lg border border-moss/10 space-y-md animate-in fade-in slide-in-from-right-4 duration-500">
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
          )}
        </div>

        {/* Action Toggle */}
        <div className="flex justify-center border-t border-moss/10 pt-lg">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-sm group"
          >
            <Grid className={`w-4 h-4 transition-colors ${isExpanded ? 'text-clay' : 'text-ink-300 group-hover:text-clay'}`} />
            {isExpanded ? 'Hide All Impacts' : 'View All Impacts'}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-ink-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-ink-300" />
            )}
          </Button>
        </div>

        {/* Expanded Grid Editor */}
        {isExpanded && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 pt-md border-t border-moss/10">
            <div className="mb-lg">
              <h5 className="text-xs font-bold text-ink-900 uppercase tracking-widest mb-1">
                Psychological Rounding Editor
              </h5>
              <p className="text-[10px] text-ink-500 font-medium">
                Directly edit the recommended prices to apply rounding or competitive adjustments.
              </p>
            </div>
            <ImpactGridEditor 
              variantResults={variantResults}
              overrides={overrides}
              onOverrideChange={handleOverrideChange}
            />
          </div>
        )}
      </div>
    </Card>
  );
};
