import { useState, useMemo } from 'react';
import { History, Plus, AlertCircle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { performFullCalculation } from '../../utils/calculations';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Select } from '../shared/Select';
import { SnapshotComparisonCard } from '../results/SnapshotComparisonCard';
import type { MarketDataContext } from '../results/AnalyzePriceCard';
import type { CalculationResult, Preset } from '../../types';

interface PriceHistoryProps {
  presetId: string;
  currentResult: CalculationResult;
  isUnsaved: boolean;
  onRestore?: (snapshot: Preset) => void;
  snapshots: Preset[];
  onPin: () => void;
  selectedVariantId?: string;
  onVariantSelect?: (variantId: string) => void;
  marketData?: MarketDataContext;
}

export const PriceHistory: React.FC<PriceHistoryProps> = ({
  currentResult,
  isUnsaved,
  onRestore,
  snapshots,
  onPin,
  selectedVariantId = 'base',
  onVariantSelect,
  marketData,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);

  // Default to the latest snapshot if none selected
  const activeSnapshotId = selectedSnapshotId || snapshots[0]?.id;

  const handlePin = async () => {
    if (isUnsaved) return;
    onPin();
  };

  const selectedSnapshot = snapshots.find((s) => s.id === activeSnapshotId) || snapshots[0];
  let comparisonResult: CalculationResult | null = null;
  if (selectedSnapshot) {
    comparisonResult = performFullCalculation(
      selectedSnapshot.baseRecipe,
      selectedSnapshot.pricingConfig
    );
  }

  const handleRestore = (e: React.MouseEvent, snapshot: Preset) => {
    e.stopPropagation();
    if (
      onRestore &&
      confirm(
        `Are you sure you want to restore the calculator to Version ${snapshot.snapshotMetadata?.versionNumber}? Current unsaved changes will be lost.`
      )
    ) {
      onRestore(snapshot);
    }
  };

  // Helper to extract relevant stats based on selected context (Base vs Variant)
  const getDisplayValues = (res: CalculationResult | null, variantId: string) => {
    if (!res) return { totalCost: 0, recommendedPrice: 0, margin: 0, name: '' };

    if (variantId !== 'base' && res.variantResults) {
      const variant = res.variantResults.find((v) => v.id === variantId);
      if (variant) {
        return {
          totalCost: variant.totalCost,
          recommendedPrice: variant.recommendedPrice,
          margin: variant.profitMarginPercent,
          name: variant.name,
        };
      }
      // If variant doesn't exist in this result (e.g. comparing vs old snapshot where variant didn't exist)
      // We return 0s to indicate "New" or "Missing"
      return { totalCost: 0, recommendedPrice: 0, margin: 0, name: '' };
    }

    // Default to Base/Batch
    return {
      totalCost: res.totalCost,
      recommendedPrice: res.recommendedPrice,
      margin: res.profitMarginPercent,
      name: '',
    };
  };

  const currentStats = getDisplayValues(currentResult, selectedVariantId);
  const comparisonStats = getDisplayValues(comparisonResult, selectedVariantId);

  const hasVariants =
    currentResult.variantResults && currentResult.variantResults.length > 0;

  const variantOptions = useMemo(() => {
    const opts = [{ label: 'Total Batch / Base Product', value: 'base' }];
    if (currentResult.variantResults) {
      currentResult.variantResults.forEach((v) => {
        opts.push({ label: v.name, value: v.id });
      });
    }
    return opts;
  }, [currentResult.variantResults]);

  return (
    <div className="space-y-xl">
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <History className="w-5 h-5 mr-sm text-ink-700" />
              <h2 className="text-xl font-serif font-semibold text-ink-900">Price Milestones</h2>
            </div>
            <div className="flex items-center gap-sm">
              {snapshots.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-ink-500 hover:text-ink-900"
                >
                  {isExpanded ? (
                    <>
                      Hide List <ChevronUp className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Show {snapshots.length} Milestone{snapshots.length !== 1 ? 's' : ''}{' '}
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePin}
                disabled={isUnsaved}
                title={
                  isUnsaved
                    ? 'Save the preset first to pin a version'
                    : 'Pin current costs as a milestone'
                }
              >
                <Plus className="w-4 h-4 mr-1" />
                Pin Version
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-lg">
          {hasVariants && (
            <div className="max-w-xs">
              <Select
                label="Compare Context"
                value={selectedVariantId}
                onChange={(e) => onVariantSelect?.(e.target.value)}
                options={variantOptions}
              />
            </div>
          )}

          {snapshots.length === 0 ? (
            <div className="text-center py-xl bg-surface/30 rounded-lg border border-dashed border-border-base">
              <p className="text-ink-500 max-sm mx-auto">
                📊 No price milestones tracked yet. Pin a version when you review costs monthly or
                adjust prices to see trends.
              </p>
            </div>
          ) : isExpanded ? (
            <>
              {snapshots.length < 3 && (
                <div className="flex items-start p-md bg-sakura/10 border border-sakura/30 rounded-lg text-sm text-ink-700">
                  <AlertCircle className="w-5 h-5 mr-sm text-sakura shrink-0" />
                  <p>💡 Tip: Click any milestone to use it for comparison.</p>
                </div>
              )}

              <div className="overflow-hidden border border-border-subtle rounded-lg divide-y divide-border-subtle">
                {snapshots.map((snapshot, index) => {
                  const result = performFullCalculation(
                    snapshot.baseRecipe,
                    snapshot.pricingConfig
                  );
                  const isSelected = snapshot.id === activeSnapshotId;
                  
                  // Get stats for this snapshot based on selected variant
                  const stats = getDisplayValues(result, selectedVariantId);

                  return (
                    <div
                      key={snapshot.id}
                      onClick={() => setSelectedSnapshotId(snapshot.id)}
                      className={`p-md flex justify-between items-center transition-colors cursor-pointer ${
                        isSelected ? 'bg-clay/5 ring-1 ring-inset ring-clay/20' : 'bg-white/40 hover:bg-surface'
                      }`}
                    >
                      <div className="flex items-center gap-md">
                        <div>
                          <div className="flex items-center gap-sm">
                            <p className="font-medium text-ink-900">
                              Version {snapshot.snapshotMetadata?.versionNumber}
                            </p>
                            {index === 0 && (
                              <Badge
                                variant="info"
                                className="text-[8px] py-0 px-1 font-bold tracking-tighter"
                              >
                                LATEST
                              </Badge>
                            )}
                            {isSelected && (
                              <Badge
                                variant="success"
                                className="text-[8px] py-0 px-1 font-bold tracking-tighter"
                              >
                                COMPARING
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-ink-500">
                            {formatDate(snapshot.snapshotMetadata!.snapshotDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-xl">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-ink-900">
                            {formatCurrency(stats.totalCost)}
                          </p>
                          <p className="text-xs text-ink-500">Total Cost</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleRestore(e, snapshot)}
                          className="text-ink-500 hover:text-clay p-sm h-auto"
                          title="Restore this version to calculator"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-md bg-surface/10 rounded-lg border border-border-subtle/30 border-dashed">
              <p className="text-xs text-ink-500 italic">
                {snapshots.length} historical milestone{snapshots.length !== 1 ? 's' : ''} recorded.
                {selectedSnapshot && (
                  <> Comparing with <span className="font-bold">Version {selectedSnapshot.snapshotMetadata?.versionNumber}</span>.</>
                )}
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="ml-sm text-clay font-bold hover:underline"
                >
                  Change
                </button>
              </p>
            </div>
          )}
        </div>
      </Card>

      {comparisonResult && selectedSnapshot && (
        <SnapshotComparisonCard
          currentTotalCost={currentStats.totalCost}
          currentRecommendedPrice={currentStats.recommendedPrice}
          currentMargin={currentStats.margin}
          lastTotalCost={comparisonStats.totalCost}
          lastRecommendedPrice={comparisonStats.recommendedPrice}
          lastMargin={comparisonStats.margin}
          lastSnapshotDate={selectedSnapshot.snapshotMetadata!.snapshotDate}
          versionNumber={selectedSnapshot.snapshotMetadata?.versionNumber}
          variantName={selectedVariantId !== 'base' ? currentStats.name : undefined}
          marketData={marketData}
        />
      )}
    </div>
  );
};