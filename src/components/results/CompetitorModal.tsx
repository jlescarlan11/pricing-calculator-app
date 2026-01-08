import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Info, Clock } from 'lucide-react';
import { Modal, Input, Button, useToast } from '../shared';
import type { Competitor, DraftCompetitor } from '../../types/calculator';
import { formatTimeAgo } from '../../utils/formatters';

interface CompetitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetId?: string | null;
  competitors: Competitor[];
  onSave: (competitors: DraftCompetitor[]) => Promise<void>;
}

/**
 * Modal for managing competitor benchmarking data.
 * Supports up to 5 competitors and tracks data freshness per entry.
 */
export const CompetitorModal: React.FC<CompetitorModalProps> = ({
  isOpen,
  onClose,
  competitors,
  onSave,
}) => {
  const { addToast } = useToast();
  const [localCompetitors, setLocalCompetitors] = useState<DraftCompetitor[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalCompetitors(
        competitors.map((c) => ({
          id: c.id,
          competitorName: c.competitorName,
          competitorPrice: c.competitorPrice,
          notes: c.notes,
          presetId: c.presetId,
          updatedAt: c.updatedAt,
          createdAt: c.createdAt,
        }))
      );
    }
  }, [isOpen, competitors]);

  const handleAdd = () => {
    if (localCompetitors.length >= 5) {
      addToast('You can track up to 5 competitors per product.', 'warning');
      return;
    }
    setLocalCompetitors([...localCompetitors, { competitorName: '', competitorPrice: 0 }]);
  };

  const handleRemove = (index: number) => {
    setLocalCompetitors(localCompetitors.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof DraftCompetitor, value: string | number) => {
    const updated = [...localCompetitors];
    updated[index] = { ...updated[index], [field]: value } as DraftCompetitor;
    setLocalCompetitors(updated);
  };

  const handleSave = async () => {
    // Basic validation
    const hasEmpty = localCompetitors.some((c) => !c.competitorName.trim());
    const hasZeroPrice = localCompetitors.some((c) => !c.competitorPrice || c.competitorPrice <= 0);

    if (hasEmpty || hasZeroPrice) {
      addToast('Please fill in all competitor names and valid prices.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(localCompetitors);
      onClose();
    } catch {
      addToast('Failed to save competitors.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const isDataStale = (dateStr?: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return Date.now() - date.getTime() > 30 * 24 * 60 * 60 * 1000;
  };

  const anyStale = localCompetitors.some((c) => isDataStale(c.updatedAt));

  const footer = (
    <div className="flex gap-sm justify-end">
      <Button variant="secondary" onClick={onClose} disabled={isSaving}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
        Save Changes
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<span className="text-ink-900 font-serif text-2xl">Market Benchmarking</span>}
      footer={footer}
    >
      <div className="space-y-xl">
        <p className="text-sm text-ink-500 leading-relaxed">
          Track up to five competitors to see how your pricing compares to the local market.
          Accurate market data helps you position your product effectively.
        </p>

        {anyStale && (
          <div className="p-md bg-clay/10 border border-clay/30 rounded-xl flex items-start gap-md text-ink-900 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-clay shrink-0" />
            <div className="text-sm">
              <p className="font-bold">Amber Warning: Stale Data</p>
              <p className="opacity-80">
                Some competitor prices are older than 30 days and may no longer be accurate.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-md">
          {localCompetitors.map((competitor, index) => {
            const stale = isDataStale(competitor.updatedAt);
            const age = competitor.updatedAt
              ? formatTimeAgo(new Date(competitor.updatedAt))
              : 'New';

            return (
              <div
                key={index}
                className="flex flex-col gap-md p-md bg-surface rounded-xl border border-border-subtle relative group transition-all hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row gap-md">
                  <div className="flex-[2]">
                    <Input
                      label="Competitor Name"
                      value={competitor.competitorName}
                      onChange={(e) => handleChange(index, 'competitorName', e.target.value)}
                      placeholder="e.g., Local Bakery A"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Price"
                      type="number"
                      value={competitor.competitorPrice || ''}
                      onChange={(e) =>
                        handleChange(index, 'competitorPrice', parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                      inputMode="decimal"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-xs px-xs">
                  <div
                    className={`flex items-center gap-xs text-[10px] font-bold uppercase tracking-wider ${stale ? 'text-rust' : 'text-ink-300'}`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Updated {age}</span>
                  </div>

                  <button
                    onClick={() => handleRemove(index)}
                    className="flex items-center gap-xs text-[10px] font-bold text-ink-300 uppercase tracking-widest hover:text-rust transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          <Button
            onClick={handleAdd}
            variant="secondary"
            className="w-full py-xl border-2 border-dashed border-border-base bg-transparent hover:bg-clay/5 flex flex-col items-center justify-center gap-sm group h-auto"
            disabled={localCompetitors.length >= 5}
          >
            <div className="p-sm bg-bg-main rounded-round group-hover:bg-white shadow-sm transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">
              {localCompetitors.length >= 5 ? 'Limit Reached (5/5)' : 'Add Competitor'}
            </span>
          </Button>

          {localCompetitors.length === 0 && (
            <div className="text-center py-xl px-lg bg-surface/50 rounded-xl border border-dashed border-border-subtle">
              <Info className="w-8 h-8 text-ink-300 mx-auto mb-md" />
              <p className="text-sm text-ink-500 font-medium">No competitors tracked yet.</p>
              <p className="text-xs text-ink-300 mt-xs">
                Add at least two to see market positioning.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
