import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  FileEdit, 
  Trash2, 
  Play, 
  Calendar, 
  Package, 
  MoreVertical, 
  Layers, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  CloudOff,
  TrendingUp,
  Tag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Preset } from '../../hooks/use-presets';
import type { VariantsPreset } from '../../types';
import { formatDate, formatCurrency, formatPercent } from '../../utils/formatters';
import { calculateAllVariants, getTotalBatchProfit } from '../../utils/variant-calculations';
import { Button, Card, Badge, Tooltip } from '../shared';
import { useSync } from '../../hooks/useSync';

interface PresetListItemProps {
  preset: Preset;
  onLoad: (preset: Preset) => void;
  onEdit: (preset: Preset) => void;
  onDelete: (preset: Preset) => void;
  viewMode?: 'grid' | 'list';
}

/**
 * A sub-component to display the synchronization status icon.
 */
const SyncStatusIcon: React.FC<{ 
  status: string; 
  lastSyncedAt: string | null;
  isModified?: boolean;
}> = ({ status, lastSyncedAt, isModified }) => {
  const lastSyncedText = lastSyncedAt 
    ? `Synced ${formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })}`
    : 'Not synced';

  if (status === 'syncing' && isModified) {
    return (
      <Tooltip content="Syncing...">
        <RefreshCw size={14} className="text-clay animate-spin" />
      </Tooltip>
    );
  }
  
  if (status === 'error' && isModified) {
    return (
      <Tooltip content="Sync error">
        <AlertCircle size={14} className="text-rust" />
      </Tooltip>
    );
  }
  
  if (status === 'offline') {
    return (
      <Tooltip content="Offline">
        <CloudOff size={14} className="text-ink-300" />
      </Tooltip>
    );
  }

  if (lastSyncedAt) {
    return (
      <Tooltip content={lastSyncedText}>
        <CheckCircle2 size={14} className="text-moss" />
      </Tooltip>
    );
  }

  return (
    <Tooltip content="Waiting to sync">
      <Clock size={14} className="text-ink-300" />
    </Tooltip>
  );
};

/**
 * A list item component for displaying a saved preset with its metadata and actions.
 * Supports 'grid' (detailed card) and 'list' (minimal row) view modes.
 */
export const PresetListItem: React.FC<PresetListItemProps> = ({
  preset,
  onLoad,
  onEdit,
  onDelete,
  viewMode = 'grid',
}) => {
  const { status: syncStatus } = useSync();

  // Normalize Data
  const isVariant = 'preset_type' in preset && preset.preset_type === 'variants';
  const name = preset.name;
  const lastSyncedAt = preset.last_synced_at;
  
  // Handle inconsistent date fields between types
  const lastModified = 'lastModified' in preset 
    ? preset.lastModified 
    : (preset.updated_at ? new Date(preset.updated_at).getTime() : (preset.created_at ? new Date(preset.created_at).getTime() : 0));

  // Determine if it was modified since last sync
  const isModified = !lastSyncedAt || (new Date(lastModified).getTime() > new Date(lastSyncedAt).getTime());

  // Metrics Calculation
  const metrics = useMemo(() => {
    if (isVariant) {
      const v = preset as VariantsPreset;
      const calculations = calculateAllVariants(
        v.variants,
        v.ingredients,
        v.labor_cost,
        v.overhead_cost,
        v.batch_size,
        v.pricing_strategy,
        v.pricing_value
      );
      
      const totalBatchProfit = getTotalBatchProfit(calculations);
      const bestVariant = calculations.length > 0 
        ? calculations.reduce((best, curr) => 
            curr.profitMarginPercent > best.profitMarginPercent ? curr : best
          , calculations[0])
        : null;

      const bestVariantName = bestVariant 
        ? v.variants.find(varInput => varInput.id === bestVariant.variantId)?.name 
        : null;

      return {
        type: 'variant' as const,
        variantCount: v.variants.length,
        totalBatchProfit,
        bestVariant: bestVariantName,
        bestMargin: bestVariant?.profitMarginPercent || 0,
        ingredientsCount: v.ingredients.length,
        batchSize: v.batch_size,
      };
    } else {
      const s = preset as any; // Cast to any temporarily to access mixed legacy/new fields
      // Single presets already have calculation inputs, but they might not have calculated results stored
      // For the list item, we just show what's easily available or calculate on the fly
      // Phase 1 SavedPreset structure vs Phase 2 SinglePreset
      const strategy = s.config ? s.config.strategy : s.pricing_strategy;
      const value = s.config ? s.config.value : s.pricing_value;
      const ingredients = s.input ? s.input.ingredients : (s.ingredients || []);
      const batchSize = s.input ? s.input.batchSize : (s.batch_size || 0);

      // We don't have full results here easily without re-running calculations
      // But we can show basic info. For single presets, let's keep it simple.
      return {
        type: 'single' as const,
        strategy,
        value,
        ingredientsCount: ingredients.length,
        batchSize,
      };
    }
  }, [isVariant, preset]);

  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Swipe state for list view
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiped, setIsSwiped] = useState(false);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setIsSwiped(true);
    }
    if (isRightSwipe) {
      setIsSwiped(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
    };

    if (isActionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionsOpen]);

  const TypeIcon = isVariant ? Layers : Package;
  const typeLabel = isVariant ? 'Variants' : 'Single';

  if (viewMode === 'list') {
    return (
      <div className="relative overflow-hidden rounded-md group">
        {/* Background Action (Delete) */}
        <div 
          className="absolute inset-y-0 right-0 w-24 bg-rust flex items-center justify-center text-white z-0 cursor-pointer"
          onClick={() => {
             if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
                onDelete(preset);
              }
              setIsSwiped(false);
          }}
        >
          <Trash2 size={20} />
        </div>

        {/* Foreground Content */}
        <div 
          className={`
            relative z-10 flex items-center justify-between p-md bg-surface hover:bg-surface-hover border border-border-subtle transition-transform duration-300
            ${isSwiped ? '-translate-x-24' : 'translate-x-0'}
          `}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEndHandler}
        >
          <div 
            className="flex-1 min-w-0 flex items-center gap-md cursor-pointer"
            onClick={() => onLoad(preset)}
          >
            <div className={`p-xs rounded-sm ${isVariant ? 'bg-clay/10 text-clay' : 'bg-ink-100 text-ink-500'}`}>
              <TypeIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-xs">
                <h4 className="text-sm font-bold text-ink-900 truncate tracking-tight" title={name}>
                  {name}
                </h4>
                <SyncStatusIcon status={syncStatus} lastSyncedAt={lastSyncedAt || null} isModified={isModified} />
              </div>
              <p className="text-[10px] text-ink-500 font-medium flex items-center gap-xs">
                <span>{formatDate(lastModified)}</span>
                <span className="w-1 h-1 bg-ink-300 rounded-full" />
                <span>{typeLabel}</span>
                {metrics.type === 'variant' && (
                  <>
                    <span className="w-1 h-1 bg-ink-300 rounded-full" />
                    <span className="text-moss font-bold">{formatCurrency(metrics.totalBatchProfit)}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsActionsOpen(!isActionsOpen);
              }}
              className="w-8 h-8 p-0 rounded-sm text-ink-500 hover:text-clay"
              aria-label="Actions"
            >
              <MoreVertical size={18} />
            </Button>

            {isActionsOpen && (
              <div className="absolute right-0 mt-xs w-48 origin-top-right bg-bg-main border border-border-base rounded-md shadow-level-4 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                <div className="py-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoad(preset);
                      setIsActionsOpen(false);
                    }}
                    className="flex items-center w-full px-lg py-md text-xs font-bold text-ink-700 hover:bg-surface-hover transition-colors text-left gap-md"
                  >
                    <Play size={14} className="fill-current text-clay" />
                    Load into Calculator
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(preset);
                      setIsActionsOpen(false);
                    }}
                    className="flex items-center w-full px-lg py-md text-xs font-bold text-ink-700 hover:bg-surface-hover transition-colors text-left gap-md"
                  >
                    <FileEdit size={14} className="text-ink-500" />
                    Edit Name
                  </button>
                  <div className="border-t border-border-subtle my-xs" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
                        onDelete(preset);
                      }
                      setIsActionsOpen(false);
                    }}
                    className="flex items-center w-full px-lg py-md text-xs font-bold text-rust hover:bg-rust/5 transition-colors text-left gap-md"
                  >
                    <Trash2 size={14} />
                    Delete Preset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card 
      className="group flex flex-col h-full transition-all duration-500 hover:border-clay/50 bg-bg-main hover:bg-surface border-border-subtle shadow-none cursor-pointer"
      onClick={() => onLoad(preset)}
      interactive
    >
      {/* Header: Name and Sync */}
      <div className="flex items-start justify-between gap-sm mb-lg">
        <div className="min-w-0">
          <div className="flex items-center gap-sm mb-xs">
            <Badge 
              variant={isVariant ? 'warning' : 'info'} 
              className="text-[9px] uppercase tracking-widest py-0 px-xs shrink-0 font-black h-5 flex items-center"
            >
              {typeLabel}
            </Badge>
            <SyncStatusIcon status={syncStatus} lastSyncedAt={lastSyncedAt || null} isModified={isModified} />
          </div>
          <h4 className="text-lg font-bold text-ink-900 truncate tracking-tight leading-none" title={name}>
            {name}
          </h4>
          <p className="text-[10px] text-ink-500 font-medium flex items-center gap-xs mt-sm">
            <Calendar size={10} className="opacity-70" />
            {formatDate(lastModified)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-xs">
          {/* Action dots only visible on hover or mobile */}
          <div className="md:opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip content="Edit Name">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(preset);
                }}
                className="w-8 h-8 p-0 text-ink-300 hover:text-clay"
                aria-label="Edit name"
              >
                <FileEdit size={14} />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Main Stats Area */}
      <div className="flex-1 flex flex-col justify-center mb-xl">
        {metrics.type === 'variant' ? (
          <div className="space-y-md">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-ink-500 block mb-xs">Batch Profit</span>
              <div className="flex items-baseline gap-xs">
                <span className="text-2xl font-black text-moss tracking-tighter">
                  {formatCurrency(metrics.totalBatchProfit)}
                </span>
                <span className="text-xs font-bold text-ink-300">/ batch</span>
              </div>
            </div>
            
            {metrics.bestVariant && (
              <div className="bg-moss/5 border border-moss/10 rounded-md p-md">
                <div className="flex items-center gap-xs text-[10px] font-bold text-moss uppercase tracking-wider mb-xs">
                  <TrendingUp size={10} />
                  Best Performing
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-ink-900 truncate max-w-[120px]">{metrics.bestVariant}</span>
                  <span className="text-xs font-black text-moss">{formatPercent(metrics.bestMargin)}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-md">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-ink-500 block mb-xs">Pricing Plan</span>
              <div className="flex items-baseline gap-xs">
                <span className="text-2xl font-black text-clay tracking-tighter">
                  {metrics.value}%
                </span>
                <span className="text-xs font-bold text-ink-500 capitalize">{metrics.strategy}</span>
              </div>
            </div>
            
            <div className="bg-clay/5 border border-clay/10 rounded-md p-md">
              <div className="flex items-center gap-xs text-[10px] font-bold text-clay uppercase tracking-wider mb-xs">
                <Tag size={10} />
                Quick Info
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-ink-900">
                <span>{metrics.ingredientsCount} Ingredient{metrics.ingredientsCount !== 1 ? 's' : ''}</span>
                <span className="text-ink-500">{metrics.batchSize} Units</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="flex items-center justify-between pt-lg border-t border-border-subtle" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col">
          {metrics.type === 'variant' && (
            <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest">
              {metrics.variantCount} Variants
            </span>
          )}
          {metrics.type === 'single' && (
            <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest">
              Single Product
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-sm">
           <Tooltip content="Delete">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
                  onDelete(preset);
                }
              }}
              className="w-9 h-9 p-0 flex items-center justify-center text-ink-300 hover:text-rust hover:bg-rust/5 rounded-sm transition-colors border-none"
              aria-label="Delete preset"
            >
              <Trash2 size={16} />
            </Button>
          </Tooltip>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onLoad(preset)}
            className="flex items-center gap-sm h-9 px-lg font-bold text-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Load
          </Button>
        </div>
      </div>
    </Card>
  );
};
