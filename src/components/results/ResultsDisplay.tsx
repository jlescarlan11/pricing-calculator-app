import React from 'react';
import type { CalculationResult, CalculationInput, PricingConfig } from '../../types/calculator';
import { PricingRecommendations } from './PricingRecommendations';
import { CostBreakdown } from './CostBreakdown';
import { PriceComparison } from './PriceComparison';
import { ShareResults } from './ShareResults';
import { Button } from '../shared/Button';
import { SavePresetButton } from '../presets/SavePresetButton';
import { Share2, Calculator, Edit2 } from 'lucide-react';
import { getPrintDate, getPrintTitle } from '../../utils';

interface ResultsDisplayProps {
  results: CalculationResult | null | undefined;
  input: CalculationInput;
  config: PricingConfig;
  onEdit?: () => void;
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
}) => {
  // Placeholder for when no results are available
  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center p-3xl text-center bg-surface rounded-2xl border-2 border-dashed border-border-base animate-in fade-in duration-1000">
        <div className="w-20 h-20 bg-bg-main rounded-full flex items-center justify-center mb-xl shadow-sm border border-border-subtle">
          <Calculator className="w-10 h-10 text-ink-500" />
        </div>
        <h3 className="text-2xl text-ink-900 mb-sm">Ready to calculate?</h3>
        <p className="text-ink-500 max-w-sm mx-auto mb-2xl leading-relaxed font-medium">
          Input your ingredients, labor, and overhead costs to see your recommended selling price and profit analysis.
        </p>
        <Button onClick={onEdit} variant="primary" className="gap-sm px-xl py-md">
          <Edit2 className="w-4 h-4" />
          Start Calculation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2xl animate-in fade-in slide-in-from-bottom-lg duration-1000 ease-out">
      {/* Print-only Header */}
      <div className="hidden print:block border-b border-ink-900 pb-xl mb-2xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl text-ink-900 mb-sm">
              {getPrintTitle(input)}
            </h1>
            <h2 className="text-xl font-medium text-ink-700">Product Pricing Report</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-xs">Date Generated</p>
            <p className="text-xl font-bold text-ink-900 tracking-tight">{getPrintDate()}</p>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-lg border-b border-border-subtle pb-xl print:hidden">
        <div>
          <h2 className="text-2xl text-ink-900">Calculation Results</h2>
          <p className="text-sm text-ink-500 mt-xs font-medium">
            Analysis for <span className="text-ink-900">{input.productName || 'Unnamed Product'}</span>
          </p>
        </div>
        <div className="flex items-center gap-sm w-full sm:w-auto">
          <SavePresetButton 
            input={input}
            config={config}
            variant="primary"
            size="sm"
            className="flex-1 sm:flex-none"
          />
          <ShareResults 
            results={results} 
            input={input} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2xl">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-2xl">
          <div className="print:break-inside-avoid">
            <PricingRecommendations results={results} />
          </div>
          
          <div className="print:break-inside-avoid">
            <PriceComparison 
              currentPrice={input.currentSellingPrice}
              recommendedPrice={results.recommendedPrice}
              costPerUnit={results.costPerUnit}
              batchSize={input.batchSize}
            />
          </div>

          <div className="flex justify-center pt-lg print:hidden">
            <Button onClick={onEdit} variant="secondary" className="px-2xl gap-sm">
              <Edit2 className="w-4 h-4" />
              Adjust Inputs
            </Button>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-2xl">
          <div className="print:break-inside-avoid">
            <CostBreakdown 
              results={results}
            />
          </div>
          
          {/* Pro Tip Card */}
          <div className="p-xl bg-surface rounded-2xl border border-border-base print:hidden relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="mb-md flex items-center gap-sm text-lg text-ink-900">
                <Share2 className="w-5 h-5 text-clay" />
                Pro Tip
              </h4>
              <p className="text-ink-700 text-sm leading-relaxed font-medium">
                Small adjustments to your batch size or ingredient sourcing can have a huge impact on your final profit margin. Try experimenting with different batch sizes to find your &quot;sweet spot&quot;.
              </p>
            </div>
            {/* Decorative background element */}
            <div className="absolute -bottom-xl -right-xl w-32 h-32 bg-clay/5 rounded-full transition-transform group-hover:scale-110 duration-700" />
          </div>
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block mt-2xl pt-xl border-t border-border-subtle text-center text-ink-500 text-xs font-medium">
        <p>This pricing report was generated using PriceCraft.</p>
        <p className="mt-xs">Values are estimates based on user-provided costs and selected pricing strategies.</p>
      </div>
    </div>
  );
};
