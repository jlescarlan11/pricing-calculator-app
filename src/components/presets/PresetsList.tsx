import React, { useState, useMemo } from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import { usePresets } from '../../hooks/use-presets';
import { Input, Button } from '../shared';
import { PresetListItem } from './PresetListItem';
import type { SavedPreset } from '../../types';

interface PresetsListProps {
  onLoad: (preset: SavedPreset) => void;
  onEdit: (preset: SavedPreset) => void;
}

/**
 * A component that displays a searchable, filterable list of saved presets.
 * Supports both grid and list view modes and sorts by newest first.
 */
export const PresetsList: React.FC<PresetsListProps> = ({ onLoad, onEdit }) => {
  const { presets, deletePreset } = usePresets();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredPresets = useMemo(() => {
    return presets
      .filter((preset) => {
        const search = searchQuery.toLowerCase();
        return (
          preset.name.toLowerCase().includes(search) ||
          preset.input.productName.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => b.lastModified - a.lastModified);
  }, [presets, searchQuery]);

  if (presets.length === 0) {
    return (
      <div className="text-center py-3xl bg-surface rounded-lg border-2 border-dashed border-border-base">
        <div className="max-w-xs mx-auto">
          <p className="text-ink-900 font-bold mb-sm tracking-tight">A clean slate</p>
          <p className="text-sm text-ink-500 font-medium leading-relaxed">
            Your saved calculations will appear here for easy access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      <div className="flex flex-col gap-md">
        <div className="w-full">
          <Input
            label="Search Products"
            placeholder="Search by name or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-ink-500 uppercase tracking-[0.2em]">
            View Mode
          </span>
          <div className="flex items-center bg-surface p-xs rounded-md border border-border-subtle">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`p-sm min-w-0 border-0 shadow-none hover:bg-bg-main/50 rounded-sm transition-all duration-300 ${
                viewMode === 'grid' ? 'bg-bg-main shadow-level-1 text-clay' : 'bg-transparent text-ink-500'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`p-sm min-w-0 border-0 shadow-none hover:bg-bg-main/50 rounded-sm transition-all duration-300 ${
                viewMode === 'list' ? 'bg-bg-main shadow-level-1 text-clay' : 'bg-transparent text-ink-500'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {filteredPresets.length === 0 ? (
        <div className="text-center py-3xl bg-surface rounded-lg border border-border-subtle animate-in fade-in duration-500">
          <Search className="w-12 h-12 text-ink-300 mx-auto mb-md opacity-50" />
          <p className="text-ink-500 font-medium">We couldn&apos;t find a match for &quot;{searchQuery}&quot;</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSearchQuery('')}
            className="mt-md text-clay"
          >
            Clear
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-md w-full'
              : 'flex flex-col gap-sm w-full'
          }
        >
          {filteredPresets.map((preset) => (
            <PresetListItem
              key={preset.id}
              preset={preset}
              onLoad={onLoad}
              onEdit={onEdit}
              onDelete={(p) => deletePreset(p.id)}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};
