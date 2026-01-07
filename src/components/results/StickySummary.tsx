import React from 'react';
import { RefreshCw, Calculator, ChevronRight } from 'lucide-react';
import { Button } from '../shared/Button';
import type { CalculationResult } from '../../types/calculator';
import { formatCurrency, getMarginColor } from '../../utils/formatters';

interface StickySummaryProps {
  results: CalculationResult | null;
  hasCommittedResults: boolean;
  isStale: boolean;
  onScrollToResults: () => void;
  onCalculate: () => void;
  isCalculating: boolean;
  isVisible: boolean; // Kept for interface compatibility, but we'll ignore it or use it for specific hide logic if needed.
}

export const StickySummary: React.FC<StickySummaryProps> = ({
  results,
  hasCommittedResults,
  isStale,
  onScrollToResults,
  onCalculate,
  isCalculating,
}) => {
  const hasVariants = results?.variantResults && results.variantResults.length > 0;

  // Placeholder content when no results exist
  if (!results) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-subtle pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="p-md flex items-center justify-between gap-md">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-ink-900">Ready?</span>
            <span className="text-xs text-ink-500">Calculate your profit</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={onCalculate}
            isLoading={isCalculating}
            className="rounded-full px-lg"
          >
            Calculate
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border-subtle shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)] sm:hidden transition-transform duration-300">
      
      {/* Main Content Area */}
      <div className="flex items-center gap-md p-md h-[72px]">
        
        {/* Left Side: Stats (Single) or Scroll (Variants) */}
        <div className="flex-1 min-w-0">
          {hasVariants ? (
            // VARIANT VIEW: Horizontal Scroll
            <div className="flex gap-md overflow-x-auto no-scrollbar items-center mask-fade-right">
              {results.variantResults?.map((vr) => (
                <div key={vr.id} className="flex flex-col min-w-[100px] gap-0.5 shrink-0 border-r border-border-subtle pr-md last:border-0 last:pr-0">
                   <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-bold text-ink-500 uppercase truncate max-w-[60px]">
                        {vr.name.includes('(Base)') ? 'Base' : vr.name}
                      </span>
                   </div>
                   <div className="flex items-baseline gap-xs">
                      <span className={`text-sm font-bold tabular-nums ${isStale ? 'text-clay' : 'text-ink-900'}`}>
                         {formatCurrency(vr.recommendedPrice)}
                      </span>
                   </div>
                   {/* Mini Progress Bar for Variant */}
                   <div className="h-1 w-full bg-border-subtle rounded-full overflow-hidden mt-0.5">
                      <div 
                        className={`h-full bg-${getMarginColor(vr.profitMarginPercent)}`} 
                        style={{ width: `${Math.min(vr.profitMarginPercent, 100)}%` }}
                      />
                   </div>
                </div>
              ))}
            </div>
          ) : (
            // SINGLE VIEW: Side-by-Side Stats
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-baseline justify-between w-full text-sm">
                 <div className="flex flex-col">
                    <span className="text-[10px] text-ink-500 font-medium uppercase tracking-wide">Total Cost</span>
                    <span className="font-semibold text-ink-700 tabular-nums">
                      {formatCurrency(results.costPerUnit)}
                    </span>
                 </div>
                 
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] text-ink-500 font-medium uppercase tracking-wide">
                       {isStale ? 'Est. Price' : 'Sugg. Price'}
                    </span>
                    <span className={`font-bold tabular-nums text-lg leading-none ${isStale ? 'text-clay animate-pulse' : 'text-ink-900'}`}>
                      {formatCurrency(results.recommendedPrice)}
                    </span>
                 </div>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-1.5 bg-surface-hover rounded-full overflow-hidden">
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-500 bg-${getMarginColor(results.profitMarginPercent)}`}
                  style={{ width: `${Math.min(Math.max(results.profitMarginPercent, 0), 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Action Button */}
        <div className="shrink-0 pl-xs">
          {hasCommittedResults && !isStale ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onScrollToResults}
              className="w-10 h-10 p-0 rounded-full bg-surface-hover hover:bg-border-subtle text-ink-900"
              aria-label="View Details"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm" // Use sm but style it to be prominent
              onClick={onCalculate}
              isLoading={isCalculating}
              className={`h-10 px-4 rounded-full shadow-sm transition-all ${isStale ? 'animate-pulse' : ''}`}
            >
               {hasCommittedResults ? (
                 <RefreshCw className="w-4 h-4" />
               ) : (
                 <Calculator className="w-4 h-4" />
               )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
