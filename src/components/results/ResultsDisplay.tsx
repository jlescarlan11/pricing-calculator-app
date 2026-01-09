import React, { useState } from 'react';
import type {
  CalculationResult,
  CalculationInput,
  PricingConfig,
  DraftCompetitor,
} from '../../types/calculator';
import { PricingRecommendations } from './PricingRecommendations';
import { CostBreakdown } from './CostBreakdown';
import { PriceComparison } from './PriceComparison';
import { VariantResultsTable } from './VariantResultsTable';
import { ImpactSummaryView } from './ImpactSummaryView';
import { ShareResults } from './ShareResults';
import { AnalyzePriceCard, type MarketDataContext } from './AnalyzePriceCard';
import { Button } from '../shared/Button';
import { useToast } from '../shared/Toast';
import { SavePresetButton } from '../presets/SavePresetButton';
import { Share2, Calculator, Edit2, TrendingUp } from 'lucide-react';
import { getPrintDate, getPrintTitle } from '../../utils';
import { analyticsService } from '../../services/analyticsService';
import { calculateRiskScore, generateStaticRecommendations } from '../../utils/aiAnalysis';
import { shouldEnableLLM } from '../../utils/featureFlags';
import { incrementUsage, checkRateLimit } from '../../utils/analysisRateLimit';
import { supabase } from '../../lib/supabase';
import { usePresets } from '../../hooks/use-presets';
import { calculateMarketPosition } from '../../utils/calculations';
import { CompetitorModal } from './CompetitorModal';
import { MarketPositionSpectrum } from './MarketPositionSpectrum';
import { formatCurrency } from '../../utils/formatters';

interface ResultsDisplayProps {
  results: CalculationResult | null | undefined;
  input: CalculationInput;
  config: PricingConfig;
  onEdit?: () => void;
  onApplyStrategy?: (margin: number) => void;
  onDiscard?: () => void;
  onConfirm?: () => void;
  presetId?: string | null;
  userId?: string | null;
  marketDataContext?: MarketDataContext;
  isPreviewMode?: boolean;
  originalConfig?: PricingConfig | null;
}

/**
 * Orchestrator component that displays all calculation results.
 * Includes recommendations, cost breakdown, and price comparison.
 * Handles empty states and provides utility actions via ShareResults and SavePresetButton.
 */
export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  input,
  config,
  onEdit,
  onApplyStrategy,
  onDiscard,
  onConfirm,
  presetId,
  userId,
  marketDataContext,
  isPreviewMode = false,
  originalConfig,
}) => {
  const { addToast } = useToast();
  const { getPreset, updatePreset } = usePresets();
  const [isAnalyzed, setIsAnalyzed] = React.useState(false);
  const [recommendations, setRecommendations] = React.useState<string[]>([]);
  const [suggestedMargin, setSuggestedMargin] = React.useState<number | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isCompetitorModalOpen, setIsCompetitorModalOpen] = useState(false);
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);

  // Update selected variants when results change
  React.useEffect(() => {
    if (results?.variantResults) {
      setSelectedVariantIds(results.variantResults.map((v) => v.id));
    } else {
      setSelectedVariantIds([]);
    }
  }, [results?.variantResults]);

  // Get current preset and its competitors
  const currentPreset = presetId ? getPreset(presetId) : null;
  const competitors = currentPreset?.competitors || [];

  const marketPosition = results
    ? calculateMarketPosition(results.recommendedPrice, competitors)
    : null;
    
  const handleSaveCompetitors = async (updatedCompetitors: DraftCompetitor[]) => {
    if (!presetId) {
      addToast('Please save this product first to track competitors.', 'info');
      return;
    }

    try {
      // Competitors already have IDs or will be handled by updatePreset -> service
      await updatePreset(presetId, {
        competitors: updatedCompetitors as any,
      });
      addToast('✓ Competitors updated.', 'success');
    } catch (err) {
      console.error('Failed to update competitors:', err);
      throw err;
    }
  };

  const handleAnalyze = async () => {
    if (!presetId || !userId) {
      addToast('Please save this product first to enable advanced analysis.', 'info');
      return;
    }

    // Check rate limit first
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      addToast('Daily analysis limit reached. Please try again tomorrow.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Track the click first (analytics)
      await analyticsService.trackAnalysisClick(userId, presetId);

      const isLLMEnabled = await shouldEnableLLM();

      if (isLLMEnabled) {
        // Filter results to include only selected variants
        const filteredResults = {
          ...results,
          variantResults: results?.variantResults?.filter((v) =>
            selectedVariantIds.includes(v.id)
          ),
        };

        // Advanced AI Analysis via Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('analyze-pricing', {
          body: {
            results: filteredResults,
            input,
            competitors: competitors.map((c) => ({
              competitorName: c.competitorName,
              competitorPrice: c.competitorPrice,
              updatedAt: c.updatedAt,
            })),
          },
        });

        if (error || !data?.recommendations) {
          console.error('AI Analysis failed:', error);
          throw new Error('AI analysis failed');
        }

        setRecommendations(data.recommendations);
        setSuggestedMargin(data.suggestedMarginValue);
      } else {
        // Fallback to Rules-Based MVP
        // Artificial delay for UX
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const margin = results?.profitMarginPercent || 0;
        const risk = calculateRiskScore(margin);
        const recs = generateStaticRecommendations(margin, risk);

        setRecommendations(recs);
        setSuggestedMargin(undefined); // No explicit suggestion in fallback yet
      }

      // Successfully performed analysis (either LLM or fallback)
      incrementUsage();
      setIsAnalyzed(true);
      addToast('✓ Analysis complete.', 'success');
    } catch (err) {
      console.error('Failed to perform analysis:', err);
      addToast('Failed to perform analysis. Please try again.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Placeholder for when no results are available
  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center p-3xl text-center bg-surface rounded-xl border-2 border-dashed border-border-base animate-in fade-in duration-1000">
        <div className="w-20 h-20 bg-bg-main rounded-round flex items-center justify-center mb-xl shadow-level-1 border border-border-subtle">
          <Calculator className="w-10 h-10 text-ink-500" />
        </div>
        <h3 className="text-2xl text-ink-900 mb-sm">Shall we begin?</h3>
        <p className="text-ink-500 max-w-sm mx-auto mb-2xl leading-relaxed font-medium">
          Input your ingredients, labor, and overhead costs to see your recommended selling price
          and profit analysis.
        </p>
        <Button onClick={onEdit} variant="primary" className="gap-sm px-xl py-md">
          <Edit2 className="w-4 h-4" />
          Explore
        </Button>
      </div>
    );
  }

  const hasVariants = results.variantResults && results.variantResults.length > 0;

  // Analysis Visibility logic (Advanced features require saved product + user)
  const isLocked = !presetId || !userId;

  return (
    <div className="space-y-2xl animate-in fade-in slide-in-from-bottom-lg duration-1000 ease-out">
      {/* Soft-Apply / Preview Mode Banner */}
      {isPreviewMode && (
        <div className="sticky top-0 z-30 -mx-4 sm:-mx-8 px-4 sm:px-8 py-3 bg-sakura/20 backdrop-blur-md border-b border-sakura flex flex-col sm:flex-row items-center justify-between gap-md animate-in slide-in-from-top-full duration-500">
          <div className="flex items-center gap-sm">
            <div className="w-2 h-2 rounded-full bg-rust animate-pulse" />
            <p className="text-sm font-bold text-rust uppercase tracking-widest">
              Preview Mode: AI Strategy Experiment
            </p>
          </div>
          <div className="flex items-center gap-sm w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={onDiscard}
              className="flex-1 sm:flex-none border-rust/30 text-rust hover:bg-rust/5"
            >
              Discard experiment
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onConfirm}
              className="flex-1 sm:flex-none bg-rust text-white hover:bg-rust/90 border-none"
            >
              Keep Changes
            </Button>
          </div>
        </div>
      )}

      {/* Print-only Header */}
      <div className="hidden print:block border-b border-ink-900 pb-xl mb-3xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl text-ink-900 mb-sm">{getPrintTitle(input)}</h1>
            <h2 className="text-xl font-medium text-ink-700">Product Pricing Report</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-xs">
              Date Generated
            </p>
            <p className="text-xl font-bold text-ink-900 tracking-tight">{getPrintDate()}</p>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-lg print:hidden">
        <div>
          <h2 className="text-3xl font-serif text-ink-900">Results</h2>
          <p className="text-sm text-ink-500 mt-xs font-medium">
            Analysis for{' '}
            <span className="text-ink-900">{input.productName || 'Unnamed Product'}</span>
          </p>
        </div>
        <div className="flex items-center gap-sm w-full sm:w-auto">
          <SavePresetButton
            input={input}
            config={config}
            variant="primary"
            size="sm"
            className="flex-1 sm:flex-none"
            disabled={isPreviewMode}
            tooltip={isPreviewMode ? 'Confirm or discard the AI strategy preview before saving.' : undefined}
          />
          <ShareResults results={results} input={input} />
        </div>
      </div>

      <div className="flex flex-col gap-2xl max-w-4xl mx-auto">
        {/* Priority 1: Results Table (Variants) or Recommendations (Single) */}
        <div className="print:break-inside-avoid animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          {hasVariants ? (
            results.variantResults!.length > 3 && (isPreviewMode || (isAnalyzed && suggestedMargin !== undefined)) ? (
              <ImpactSummaryView 
                results={results}
                previousConfig={isPreviewMode ? originalConfig : null}
                suggestedMargin={isAnalyzed ? suggestedMargin : undefined}
              />
            ) : (
              <VariantResultsTable results={results} />
            )
          ) : (
            <PricingRecommendations results={results} />
          )}
        </div>

        {/* 
          Analyze Pricing CTA (Advanced Feature)
          Visible only when:
          1. Results are calculated
          2. Product is saved (presetId exists)
          3. User is logged in (userId exists)
          This aligns with other advanced features that require persistent data.
        */}
        {!isLocked && (
          <div className="print:hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <AnalyzePriceCard
              onAnalyze={handleAnalyze}
              onApplyStrategy={onApplyStrategy}
              isAnalyzed={isAnalyzed}
              recommendations={recommendations}
              suggestedMarginValue={suggestedMargin}
              isLoading={isAnalyzing}
              marketData={marketDataContext}
              variants={
                hasVariants
                  ? results.variantResults!.map((v) => ({ id: v.id, name: v.name }))
                  : []
              }
              selectedVariantIds={selectedVariantIds}
              onVariantSelectionChange={setSelectedVariantIds}
              isPreviewMode={isPreviewMode}
            />
          </div>
        )}

        {/* Priority 2: Price Comparison (Single Only) - De-emphasized */}
        {!hasVariants && (
          <div className="print:break-inside-avoid animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-sm mb-md px-md">
              <div className="h-px flex-1 bg-border-subtle" />
              <span className="text-[10px] font-bold text-ink-300 uppercase tracking-[0.2em]">
                Current vs Recommended
              </span>
              <div className="h-px flex-1 bg-border-subtle" />
            </div>
            <PriceComparison
              currentPrice={input.currentSellingPrice}
              recommendedPrice={results.recommendedPrice}
              costPerUnit={results.costPerUnit}
              batchSize={input.batchSize}
            />
          </div>
        )}

        {/* Competitive Benchmarker Section */}
        <div className="print:hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-250">
          {competitors.length >= 2 && marketPosition && !('error' in marketPosition) ? (
            <div className="bg-surface p-xl rounded-xl border border-border-subtle space-y-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-ink-900 mb-xs uppercase tracking-wider">
                    Market Positioning
                  </h4>
                  <p className="text-xs text-ink-500">
                    How your recommended price compares to competitors.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCompetitorModalOpen(true)}
                >
                  Update Data
                </Button>
              </div>

              {/* Spectrum UI */}
              <MarketPositionSpectrum percentile={marketPosition.percentile} />

              <div className="grid grid-cols-3 gap-md pt-md border-t border-border-subtle/50">
                <div className="text-center">
                  <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest mb-1">
                    Min Market
                  </p>
                  <p className="text-sm font-bold text-ink-900">
                    {formatCurrency(marketPosition.minPrice)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest mb-1">
                    Market Avg
                  </p>
                  <p className="text-sm font-bold text-ink-900">
                    {formatCurrency(marketPosition.avgPrice)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest mb-1">
                    Max Market
                  </p>
                  <p className="text-sm font-bold text-ink-900">
                    {formatCurrency(marketPosition.maxPrice)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface/30 p-xl rounded-xl border border-dashed border-border-base">
              <div className="max-w-md mx-auto text-center">
                <h4 className="text-sm font-bold text-ink-900 mb-xs uppercase tracking-wider opacity-60">
                  Market Positioning
                </h4>
                <p className="text-xs text-ink-500 mb-xl">
                  {competitors.length > 0
                    ? 'Add at least two competitors to see where your product sits in the market.'
                    : 'Add competitor prices to see if your product is Budget, Mid-Market, or Premium.'}
                </p>

                <MarketPositionSpectrum percentile={null} className="opacity-30 mb-xl" />

                <Button
                  variant="secondary"
                  size="md"
                  className="gap-sm group"
                  onClick={() => setIsCompetitorModalOpen(true)}
                >
                  <TrendingUp className="w-4 h-4 text-ink-300 group-hover:text-clay transition-colors" />
                  {competitors.length > 0 ? 'Track 2+ Competitors' : 'Track Competitors'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Priority 3: Cost Breakdown - De-emphasized */}
        <div className="print:break-inside-avoid animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 opacity-80 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-sm mb-md px-md">
            <div className="h-px flex-1 bg-border-subtle" />
            <span className="text-[10px] font-bold text-ink-300 uppercase tracking-[0.2em]">
              Detailed Cost Breakdown
            </span>
            <div className="h-px flex-1 bg-border-subtle" />
          </div>
          <CostBreakdown results={results} />
        </div>

        {/* Pro Tip - Low visual weight */}
        <div className="p-xl bg-surface/50 rounded-xl border border-border-subtle print:hidden flex items-start gap-md">
          <div className="p-sm bg-clay/10 rounded-round text-clay shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink-900 mb-xs">
              Pro Tip: Optimize your Batch Size
            </h4>
            <p className="text-ink-500 text-sm leading-relaxed">
              Small adjustments to your batch size or ingredient sourcing can have a huge impact on
              your final profit margin. Try experimenting with different batch sizes to find your
              &quot;sweet spot&quot;.
            </p>
          </div>
        </div>
      </div>

      <CompetitorModal
        isOpen={isCompetitorModalOpen}
        onClose={() => setIsCompetitorModalOpen(false)}
        presetId={presetId}
        competitors={competitors}
        onSave={handleSaveCompetitors}
      />

      {/* Print Footer */}
      <div className="hidden print:block mt-2xl pt-xl border-t border-border-subtle text-center text-ink-500 text-xs font-medium">
        <p>This pricing report was generated using PriceCraft.</p>
        <p className="mt-xs">
          Values are estimates based on user-provided costs and selected pricing strategies.
        </p>
      </div>
    </div>
  );
};
