import type React from 'react';
import { History, Plus, AlertCircle } from 'lucide-react';
import { usePresets } from '../../hooks/use-presets';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { performFullCalculation } from '../../utils/calculations';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { SnapshotComparisonCard } from '../results/SnapshotComparisonCard';
import type { CalculationResult } from '../../types';

interface PriceHistoryProps {
  presetId: string;
  currentResult: CalculationResult;
  isUnsaved: boolean;
}

export const PriceHistory: React.FC<PriceHistoryProps> = ({
  presetId,
  currentResult,
  isUnsaved,
}) => {
  const { presets, createSnapshot } = usePresets();

  const snapshots = presets
    .filter((p) => p.isSnapshot && p.snapshotMetadata?.parentPresetId === presetId)
    .sort(
      (a, b) =>
        new Date(b.snapshotMetadata!.snapshotDate).getTime() -
        new Date(a.snapshotMetadata!.snapshotDate).getTime()
    );

  const handlePin = async () => {
    if (isUnsaved) return;
    await createSnapshot(presetId);
  };

  const lastSnapshot = snapshots[0];
  let lastResult: CalculationResult | null = null;
  if (lastSnapshot) {
    lastResult = performFullCalculation(lastSnapshot.baseRecipe, lastSnapshot.pricingConfig);
  }

  return (
    <div className="space-y-xl">
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <History className="w-5 h-5 mr-sm text-ink-700" />
              <h2 className="text-xl font-serif font-semibold text-ink-900">Price Milestones</h2>
            </div>
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
              Pin Current Version
            </Button>
          </div>
        }
      >
        <div className="space-y-lg">
          {snapshots.length === 0 ? (
            <div className="text-center py-xl bg-surface/30 rounded-lg border border-dashed border-border-base">
              <p className="text-ink-500 max-w-sm mx-auto">
                📊 No price milestones tracked yet. Pin a version when you review costs monthly or
                adjust prices to see trends.
              </p>
            </div>
          ) : (
            <>
              {snapshots.length < 3 && (
                <div className="flex items-start p-md bg-sakura/10 border border-sakura/30 rounded-lg text-sm text-ink-700">
                  <AlertCircle className="w-5 h-5 mr-sm text-sakura shrink-0" />
                  <p>💡 Tip: Pin a new version monthly to track profit trends over time.</p>
                </div>
              )}

              <div className="overflow-hidden border border-border-subtle rounded-lg divide-y divide-border-subtle">
                {snapshots.map((snapshot) => {
                  const result = performFullCalculation(
                    snapshot.baseRecipe,
                    snapshot.pricingConfig
                  );
                  return (
                    <div
                      key={snapshot.id}
                      className="p-md flex justify-between items-center bg-white/40"
                    >
                      <div>
                        <p className="font-medium text-ink-900">
                          Version {snapshot.snapshotMetadata?.versionNumber}
                        </p>
                        <p className="text-xs text-ink-500">
                          {formatDate(snapshot.snapshotMetadata!.snapshotDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink-900">
                          {formatCurrency(result.totalCost)}
                        </p>
                        <p className="text-xs text-ink-500">Total Cost</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </Card>

      {lastResult && (
        <SnapshotComparisonCard
          currentTotalCost={currentResult.totalCost}
          currentRecommendedPrice={currentResult.recommendedPrice}
          currentMargin={currentResult.profitMarginPercent}
          lastTotalCost={lastResult.totalCost}
          lastRecommendedPrice={lastResult.recommendedPrice}
          lastMargin={lastResult.profitMarginPercent}
          lastSnapshotDate={lastSnapshot!.snapshotMetadata!.snapshotDate}
        />
      )}
    </div>
  );
};
