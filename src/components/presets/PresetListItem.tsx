import React, { useState, useRef, useEffect } from 'react';
import {
  FileEdit,
  Trash2,
  Play,
  Calendar,
  Package,
  MoreVertical,
  History,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import type { Preset } from '../../types';
import { formatDate } from '../../utils/formatters';
import { analyticsService } from '../../services/analyticsService';
import { Button, Card, Badge, Tooltip } from '../shared';

interface PresetListItemProps {
  preset: Preset;
  snapshots?: Preset[];
  onLoad: (preset: Preset) => void;
  onEdit: (preset: Preset) => void;
  onDelete: (preset: Preset) => void;
  viewMode?: 'grid' | 'list';
}

/**
 * A list item component for displaying a saved preset with its metadata and actions.
 * Supports 'grid' (detailed card) and 'list' (minimal row) view modes.
 * Now includes a toggleable history view for accessing previous versions (snapshots).
 */
export const PresetListItem: React.FC<PresetListItemProps> = ({
  preset,
  snapshots = [],
  onLoad,
  onEdit,
  onDelete,
  viewMode = 'grid',
}) => {
  const { name, baseRecipe, updatedAt, pricingConfig } = preset;
  const productName = baseRecipe?.productName || 'Unnamed Product';
  const batchSize = baseRecipe?.batchSize || 1;
  const ingredients = baseRecipe?.ingredients || [];
  
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const snapshotCount = snapshots.length;
  const hasHistory = snapshotCount > 0;

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

  // Handle loading a snapshot
  const handleLoadSnapshot = (snapshot: Preset) => {
    if (preset.userId) {
      analyticsService.trackAnalysisClick(preset.userId, snapshot.id);
    }
    onLoad(snapshot);
  };

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-0 bg-surface rounded-xl border border-border-subtle transition-all duration-300 hover:border-border-base">
        <div className="group relative flex items-center justify-between p-md">
          <div className="flex-1 min-w-0 flex items-center gap-md">
            <div className="p-xs bg-clay/10 rounded-md text-clay">
              <Package size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-sm">
                <h4 className="text-sm font-bold text-ink-900 truncate tracking-tight" title={name}>
                  {name}
                </h4>
                {hasHistory && (
                   <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHistory(!showHistory);
                    }}
                    className={`flex items-center gap-xs px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded border transition-colors ${
                      showHistory 
                        ? 'bg-moss text-white border-moss' 
                        : 'bg-moss/10 text-moss border-moss/20 hover:bg-moss/20'
                    }`}
                  >
                    <History size={8} /> 
                    {snapshotCount} Version{snapshotCount !== 1 ? 's' : ''}
                    {showHistory ? <ChevronUp size={8} /> : <ChevronDown size={8} />}
                  </button>
                )}
              </div>
              <p className="text-[10px] text-ink-500 font-medium">{formatDate(updatedAt)}</p>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className="w-8 h-8 p-0 text-ink-500 hover:text-clay"
              aria-label="Actions"
            >
              <MoreVertical size={18} />
            </Button>

            {isActionsOpen && (
              <div className="absolute right-0 mt-xs w-48 origin-top-right bg-bg-main border border-border-base rounded-xl shadow-level-4 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                <div className="py-xs">
                  <button
                    onClick={() => {
                      if (preset.userId) {
                        analyticsService.trackAnalysisClick(preset.userId, preset.id);
                      }
                      onLoad(preset);
                      setIsActionsOpen(false);
                    }}
                    className="flex items-center w-full px-lg py-md text-xs font-bold text-ink-700 hover:bg-surface-hover transition-colors text-left gap-md cursor-pointer"
                  >
                    <Play size={14} className="fill-current text-clay" />
                    Load Current
                  </button>
                  <button
                    onClick={() => {
                      onEdit(preset);
                      setIsActionsOpen(false);
                    }}
                    className="flex items-center w-full px-lg py-md text-xs font-bold text-ink-700 hover:bg-surface-hover transition-colors text-left gap-md cursor-pointer"
                  >
                    <FileEdit size={14} className="text-ink-500" />
                    Edit Name
                  </button>
                  <div className="border-t border-border-subtle my-xs" />
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
                        onDelete(preset);
                      }
                      setIsActionsOpen(false);
                    }}
                    className="flex items-center w-full px-lg py-md text-xs font-bold text-rust hover:bg-rust/5 transition-colors text-left gap-md cursor-pointer"
                  >
                    <Trash2 size={14} />
                    Delete Preset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Expansion (List View) */}
        {showHistory && hasHistory && (
          <div className="border-t border-border-subtle bg-surface-hover/30 rounded-b-xl animate-in slide-in-from-top-2 duration-200">
            <div className="px-md py-sm">
              <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-sm pl-md">Version History</p>
              <div className="space-y-1">
                {snapshots.map((snapshot) => (
                  <div 
                    key={snapshot.id}
                    className="flex items-center justify-between py-xs px-md rounded-md hover:bg-surface-hover group/item transition-colors"
                  >
                    <div className="flex items-center gap-md">
                      <Clock size={12} className="text-ink-400" />
                      <div>
                         <p className="text-xs font-medium text-ink-700">
                           {formatDate(snapshot.updatedAt)}
                         </p>
                         <p className="text-[10px] text-ink-400">
                            Version {snapshot.snapshotMetadata?.versionNumber}
                         </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLoadSnapshot(snapshot)}
                      className="h-6 px-sm text-[10px] font-bold text-clay opacity-0 group-hover/item:opacity-100 transition-opacity bg-clay/5 hover:bg-clay/10"
                    >
                      Load
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Grid View
  return (
    <Card className={`group transition-all duration-500 hover:border-clay/50 bg-bg-main hover:bg-surface border-border-subtle shadow-none rounded-xl flex flex-col ${showHistory ? 'row-span-2' : ''}`}>
      {/* Header: Name and Date */}
      <div className="flex items-start justify-between gap-sm mb-md">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-sm mb-1">
            <h4 className="text-base font-bold text-ink-900 truncate tracking-tight" title={name}>
              {name}
            </h4>
            {hasHistory && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHistory(!showHistory);
                }}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors text-[8px] uppercase tracking-widest font-bold border ${
                  showHistory 
                    ? 'bg-moss/10 text-moss border-moss/30' 
                    : 'bg-transparent text-moss border-moss/20 hover:bg-moss/5'
                }`}
              >
                <History size={8} /> 
                {snapshotCount}
                {showHistory ? <ChevronUp size={8} /> : <ChevronDown size={8} />}
              </button>
            )}
          </div>
          <p className="text-[10px] text-ink-500 font-medium flex items-center gap-xs mt-0.5">
            <Calendar size={10} className="opacity-70" />
            {formatDate(updatedAt)}
          </p>
        </div>
        <Badge variant="info" className="text-[9px] uppercase tracking-widest py-0 px-xs shrink-0">
          Active
        </Badge>
      </div>

      {/* Main Content (Hidden when history is open to keep card compact, or just stacked?) 
          Let's keep it stacked but maybe push it down if history is huge? 
          Better: Toggle between "Info" and "History" views within the card to preserve height/layout. 
      */}
      
      {!showHistory ? (
        <>
          {/* Product Details Section */}
          <div className="space-y-sm mb-md bg-surface/50 p-sm rounded-md border border-border-subtle/50">
            <div className="flex items-center gap-sm text-xs text-ink-700">
              <Package className="w-3.5 h-3.5 text-clay/60 shrink-0" />
              <span className="truncate font-semibold" title={productName || 'Unnamed Product'}>
                {productName || 'Unnamed Product'}
              </span>
            </div>
            <div className="flex items-center gap-sm text-[11px] text-ink-500">
              <span className="font-bold text-ink-900">{batchSize}</span>
              <span>unit{batchSize !== 1 ? 's' : ''} / batch</span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-md text-[9px] uppercase tracking-widest font-bold mb-md mt-auto">
            <div className="border-r border-border-subtle pr-md">
              <span className="block text-ink-500 mb-xs opacity-70">Ingredients</span>
              <span className="text-ink-900">
                {ingredients.length} item{ingredients.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="pl-md">
              <span className="block text-ink-500 mb-xs opacity-70">Strategy</span>
              <span className="text-ink-900">
                {pricingConfig.strategy} ({pricingConfig.value}%)
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 min-h-[140px] mb-md bg-surface/30 rounded-md border border-border-subtle/50 overflow-hidden flex flex-col animate-in fade-in duration-200">
          <div className="px-sm py-xs border-b border-border-subtle/50 bg-surface/50">
            <span className="text-[9px] font-bold text-ink-500 uppercase tracking-widest">Version History</span>
          </div>
          <div className="overflow-y-auto custom-scrollbar p-1 space-y-0.5 flex-1">
             {snapshots.map((snapshot) => (
                <div 
                  key={snapshot.id}
                  className="flex items-center justify-between p-xs rounded hover:bg-white border border-transparent hover:border-border-subtle group/item transition-all"
                >
                   <div className="min-w-0">
                      <div className="flex items-center gap-xs">
                         <span className="text-[10px] font-bold text-ink-700">v{snapshot.snapshotMetadata?.versionNumber}</span>
                         <span className="text-[9px] text-ink-400 truncate">{formatDate(snapshot.updatedAt).split(',')[0]}</span>
                      </div>
                   </div>
                   <button
                     onClick={() => handleLoadSnapshot(snapshot)}
                     className="p-1 text-clay opacity-0 group-hover/item:opacity-100 hover:bg-clay/10 rounded transition-all"
                     title="Load this version"
                   >
                     <ArrowRight size={12} />
                   </button>
                </div>
             ))}
          </div>
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center gap-sm pt-md border-t border-border-subtle mt-auto">
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            if (preset.userId) {
              analyticsService.trackAnalysisClick(preset.userId, preset.id);
            }
            onLoad(preset);
          }}
          className="flex-1 flex items-center justify-center gap-sm h-10 px-md font-bold text-[11px]"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Load Current
        </Button>
        <Tooltip content="Edit Name">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(preset)}
            className="w-10 h-10 p-0 flex items-center justify-center hover:text-clay transition-colors"
            aria-label="Edit preset name"
          >
            <FileEdit size={16} />
          </Button>
        </Tooltip>
        <Tooltip content="Delete">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
                onDelete(preset);
              }
            }}
            className="w-10 h-10 p-0 flex items-center justify-center text-ink-300 hover:text-rust hover:bg-rust/5 transition-colors"
            aria-label="Delete preset"
          >
            <Trash2 size={16} />
          </Button>
        </Tooltip>
      </div>
    </Card>
  );
};
