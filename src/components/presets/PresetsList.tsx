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
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="max-w-xs mx-auto">
          <p className="text-gray-600 font-medium mb-1">No saved presets yet</p>
          <p className="text-sm text-gray-400">
            Save your calculations to quickly access them later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
        <div className="w-full sm:max-w-md">
          <Input
            label="Search Presets"
            placeholder="Search by name or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            // Use suffix-like icon positioning with absolute Search icon if Input supported it, 
            // but since it doesn't have a prefix prop, we'll use it as is or wrap it.
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
            View
          </span>
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 min-w-0 border-0 shadow-none hover:bg-white/50 ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'bg-transparent text-gray-500'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`p-1.5 min-w-0 border-0 shadow-none hover:bg-white/50 ${
                viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'bg-transparent text-gray-500'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {filteredPresets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-xs">
          <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No presets match your search &quot;{searchQuery}&quot;</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSearchQuery('')}
            className="mt-2 text-blue-600"
          >
            Clear search
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-4'
              : 'flex flex-col gap-4'
          }
        >
          {filteredPresets.map((preset) => (
            <PresetListItem
              key={preset.id}
              preset={preset}
              onLoad={onLoad}
              onEdit={onEdit}
              onDelete={(p) => deletePreset(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
