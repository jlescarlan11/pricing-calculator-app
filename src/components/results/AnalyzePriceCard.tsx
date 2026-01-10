import React from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { Sparkles, AlertTriangle, Info, Check, TrendingUp, Minus, Plus } from 'lucide-react';
import { checkRateLimit } from '../../utils/analysisRateLimit';
import { formatDate } from '../../utils/formatters';

export interface MarketDataContext {
  status: 'fresh' | 'stale' | 'insufficient' | 'missing';
  oldestCompetitorDate?: string;
  competitorCount: number;
}

interface AnalyzePriceCardProps {
  onAnalyze?: () => void;
  onApplyStrategy?: (margin: number, variantMargins?: Record<string, number>) => void;
  onSuggestedMarginChange?: (margin: number) => void;
  isLoading?: boolean;
  className?: string;
  recommendations?: string[];
  suggestedMarginValue?: number;
  variantRecommendations?: Record<string, number>;
  isAnalyzed?: boolean;
  marketData?: MarketDataContext;
  variants?: { id: string; name: string }[];
  selectedVariantIds?: string[];
  onVariantSelectionChange?: (ids: string[]) => void;
  isPreviewMode?: boolean;
}

/**
 * A call-to-action card for pricing analysis.
 * Follows the project's visual patterns: Ma (Negative Space), Kanso (Simplicity),
 * and the established Japanese aesthetic.
 */
export const AnalyzePriceCard: React.FC<AnalyzePriceCardProps> = ({
  onAnalyze,
  onApplyStrategy,
  onSuggestedMarginChange,
  isLoading = false,
  className = '',
  recommendations = [],
  suggestedMarginValue,
  variantRecommendations = {},
  isAnalyzed = false,
  marketData,
  variants = [],
  selectedVariantIds = [],
  onVariantSelectionChange,
  isPreviewMode = false,
}) => {
  const [rateLimitInfo, setRateLimitInfo] = React.useState(checkRateLimit());

  const handleAnalyzeClick = () => {
    const info = checkRateLimit();
    if (!info.allowed) {
      // Re-trigger state update to show rate limit UI if we want
      setRateLimitInfo(info);
      return;
    }
    onAnalyze?.();
  };

  const toggleVariant = (id: string) => {
    if (!onVariantSelectionChange) return;
    const newSelection = selectedVariantIds.includes(id)
      ? selectedVariantIds.filter((vId) => vId !== id)
      : [...selectedVariantIds, id];
    onVariantSelectionChange(newSelection);
  };

  const toggleAll = () => {
    if (!onVariantSelectionChange) return;
    if (selectedVariantIds.length === variants.length) {
      onVariantSelectionChange([]);
    } else {
      onVariantSelectionChange(variants.map((v) => v.id));
    }
  };

  // Sync rate limit info after analysis or when component mounts
  React.useEffect(() => {
    setRateLimitInfo(checkRateLimit());
  }, [isAnalyzed, isLoading]);

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

  const showPartialBadge = isAnalyzed && marketData && (marketData.status === 'stale' || marketData.status === 'insufficient');

  return (
    <Card
      className={`bg-gradient-to-br from-surface to-bg-main border-clay/20 print:hidden transition-all duration-700 ${className} ${isPreviewMode ? 'ring-2 ring-sakura ring-offset-2' : ''}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-lg">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <div className="flex items-center justify-center sm:justify-start gap-sm mb-xs">
            <h3 className="font-serif text-xl font-semibold text-ink-900">
              {isAnalyzed ? 'Analysis Complete' : 'Want a deeper look?'}
            </h3>
            {showPartialBadge && (
              <Badge variant="warning" className="ml-2 gap-1">
                <AlertTriangle className="w-3 h-3" />
                Partial Analysis
              </Badge>
            )}
            {isPreviewMode && (
              <Badge variant="info" className="ml-2 bg-sakura/20 text-rust border-sakura">
                Preview Mode
              </Badge>
            )}
          </div>
          <p className="text-ink-500 text-sm max-w-sm leading-relaxed mb-md sm:mb-0">
            {isAnalyzed
              ? 'Based on your current margins, here are some points to consider:'
              : rateLimitInfo.allowed
                ? 'Get an automated analysis of your costs and discover opportunities to improve your profit margins.'
                : 'You have reached your daily limit of 5 AI analyses. Please come back tomorrow for more insights.'}
          </p>
          {!isAnalyzed && rateLimitInfo.allowed && (
            <p className="text-[10px] text-ink-300 mt-xs uppercase tracking-widest font-bold">
              {rateLimitInfo.remaining} analyses remaining today
            </p>
          )}
        </div>

        {!isAnalyzed && (
          <div className="flex flex-col gap-sm w-full sm:w-auto items-center sm:items-end">
             {variants.length > 0 && (
              <div className="flex flex-col gap-xs items-center sm:items-end w-full">
                <p className="text-[10px] text-ink-400 font-bold uppercase tracking-wider">
                  Select variants to include:
                </p>
                <div className="flex flex-wrap gap-xs justify-center sm:justify-end">
                  <button
                    onClick={toggleAll}
                    className={`
                      px-2 py-1 rounded text-[10px] font-medium border transition-colors
                      ${
                        selectedVariantIds.length === variants.length && variants.length > 0
                          ? 'bg-clay text-white border-clay'
                          : 'bg-transparent text-ink-500 border-border-base hover:border-clay'
                      }
                    `}
                  >
                    All
                  </button>
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => toggleVariant(variant.id)}
                      className={`
                        px-2 py-1 rounded text-[10px] font-medium border transition-colors flex items-center gap-1
                        ${
                          selectedVariantIds.includes(variant.id)
                            ? 'bg-clay/10 text-clay-dark border-clay/30'
                            : 'bg-transparent text-ink-500 border-border-base hover:border-clay'
                        }
                      `}
                    >
                      {selectedVariantIds.includes(variant.id) && <Check className="w-3 h-3" />}
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <Button
              onClick={handleAnalyzeClick}
              variant="primary"
              isLoading={isLoading}
              disabled={!rateLimitInfo.allowed || (variants.length > 0 && selectedVariantIds.length === 0)}
              className="gap-sm shadow-clay/10 shadow-lg hover:shadow-clay/20 transition-all active:scale-95 whitespace-nowrap w-full sm:w-auto justify-center"
            >
              <Sparkles className="w-4 h-4" />
              Analyze My Pricing
            </Button>
          </div>
        )}

        {isAnalyzed && suggestedMarginValue !== undefined && !isPreviewMode && (
          <div className="w-full sm:w-auto flex flex-col items-center sm:items-end gap-sm">
             <div className="flex flex-col items-center sm:items-end gap-xs">
               <p className="text-[10px] text-ink-400 font-bold uppercase tracking-wider">
                 AI Suggestion
               </p>
               <div className="flex items-center gap-2 bg-white/50 border border-border-subtle rounded-lg p-1.5 shadow-sm">
                 <button
                   onClick={() => onSuggestedMarginChange?.(Math.max(0, suggestedMarginValue - 1))}
                   className="p-1 hover:bg-clay/10 rounded-md text-clay transition-colors active:scale-90"
                   aria-label="Decrease margin"
                 >
                   <Minus className="w-4 h-4" />
                 </button>
                 <span className="text-sm font-bold text-ink-900 min-w-[3.5ch] text-center tabular-nums">
                   {suggestedMarginValue.toFixed(1)}%
                 </span>
                 <button
                   onClick={() => onSuggestedMarginChange?.(Math.min(100, suggestedMarginValue + 1))}
                   className="p-1 hover:bg-clay/10 rounded-md text-clay transition-colors active:scale-90"
                   aria-label="Increase margin"
                 >
                   <Plus className="w-4 h-4" />
                 </button>
               </div>
             </div>
             <Button
               onClick={() => onApplyStrategy?.(suggestedMarginValue, variantRecommendations)}
               variant="primary"
               className="gap-sm shadow-clay/10 shadow-lg hover:shadow-clay/20 transition-all active:scale-95 whitespace-nowrap w-full sm:w-auto justify-center"
             >
               <TrendingUp className="w-4 h-4" />
               Apply Strategy
             </Button>
          </div>
        )}
      </div>

      {isAnalyzed && recommendations.length > 0 && (
        <div className="mt-xl space-y-md animate-in fade-in slide-in-from-top-4 duration-700">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-start gap-md p-md bg-white/50 rounded-lg border border-border-subtle"
            >
              <div className="w-5 h-5 rounded-round bg-clay/10 text-clay flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                {index + 1}
              </div>
              <p className="text-sm text-ink-700 leading-relaxed italic">{rec}</p>
            </div>
          ))}
          
          <div className="flex flex-col items-center gap-sm pt-md">
            {/* Market Data Age Indicator */}
            {marketData && (
              <div className="flex items-center gap-xs text-[10px] text-ink-400 font-medium uppercase tracking-wider">
                 <Info className="w-3 h-3" />
                 {getMarketContextMessage()}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onAnalyze}
              className="text-ink-300 hover:text-ink-500 text-[10px] uppercase tracking-widest mt-xs"
            >
              Refresh Analysis
            </Button>
          </div>
        </div>
      )}

      {!isAnalyzed && (
        <p className="mt-lg pt-md border-t border-border-subtle/50 text-[10px] text-ink-300 leading-relaxed italic">
          We collect usage data to improve the tool. Data is automatically deleted if the product or account is removed.
        </p>
      )}
    </Card>
  );
};
