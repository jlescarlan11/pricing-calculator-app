import React from 'react';
import { ArrowUp, RefreshCw, Activity } from 'lucide-react';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';
import type { CalculationResult } from '../../types/calculator';
import { formatCurrency } from '../../utils/formatters';

interface StickySummaryProps {
  results: CalculationResult | null;
  hasCommittedResults: boolean;
  isStale: boolean;
  onScrollToResults: () => void;
  onCalculate: () => void;
  isCalculating: boolean;
  isVisible: boolean;
}

export const StickySummary: React.FC<StickySummaryProps> = ({
  results,
  hasCommittedResults,
  isStale,
  onScrollToResults,
  onCalculate,
  isCalculating,
  isVisible,
}) => {
  if (!isVisible) return null;

  const getMarginBadge = (margin: number) => {
    if (margin < 15) return { variant: 'error' as const, label: 'Tight' };
    if (margin <= 25) return { variant: 'warning' as const, label: 'Modest' };
    return { variant: 'success' as const, label: 'Healthy' };
  };

  const hasVariants = results?.variantResults && results.variantResults.length > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom,0px))] sm:hidden animate-in fade-in slide-in-from-bottom-full duration-500">
      <div className="bg-white/95 backdrop-blur-md border border-border-base rounded-xl shadow-level-4 p-md flex items-center justify-between gap-md">
        {results ? (
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-xs mb-0.5">
              <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest truncate flex items-center gap-1.5">
                {isStale && (
                  <span className="flex items-center gap-1 text-clay animate-pulse">
                    <Activity className="w-3 h-3" />
                    <span>Live Estimate</span>
                  </span>
                )}
                {!isStale && (hasVariants ? 'Recommended Prices' : 'Recommended Price')}
              </span>
              {!hasVariants && !isStale && (
                <Badge
                  variant={getMarginBadge(results.profitMarginPercent).variant}
                  className="text-[8px] py-0 px-1 uppercase shrink-0"
                >
                  {getMarginBadge(results.profitMarginPercent).label}
                </Badge>
              )}
            </div>

            {hasVariants ? (
              <div className="flex gap-md overflow-x-auto no-scrollbar pb-0.5">
                {results?.variantResults?.map((vr) => (
                  <div key={vr.id} className="flex flex-col min-w-max border-r border-border-subtle pr-md last:border-0 last:pr-0">
                    <span className="text-[9px] font-bold text-ink-700 truncate max-w-[100px]">
                      {vr.name.includes('(Base)') ? 'Base' : vr.name}
                    </span>
                    <span className={`text-base font-bold tabular-nums ${isStale ? 'text-clay' : 'text-ink-900'}`}>
                      {formatCurrency(vr.recommendedPrice)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-xl font-bold tabular-nums ${isStale ? 'text-clay' : 'text-ink-900'}`}>
                {formatCurrency(results.recommendedPrice)}
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-ink-500 font-medium italic">
            Ready to calculate your profit?
          </div>
        )}

        <div className="flex gap-sm">
          {hasCommittedResults && !isStale ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onScrollToResults}
              className="flex items-center gap-xs min-h-[40px]"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              Results
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onCalculate}
              isLoading={isCalculating}
              className="flex items-center gap-xs min-h-[40px]"
            >
              {hasCommittedResults ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Update
                </>
              ) : (
                'Calculate'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
