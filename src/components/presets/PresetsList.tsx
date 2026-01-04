import React, { useState, useMemo } from 'react';
import { Search, LayoutGrid, List, Filter, ArrowUpDown } from 'lucide-react';
import { usePresets, type Preset } from '../../hooks/use-presets';
import { Input, Button } from '../shared';
import { PresetListItem } from './PresetListItem';

interface PresetsListProps {
  onLoad: (preset: Preset) => void;
  onEdit: (preset: Preset) => void;
}

type SortOption = 'newest' | 'name-asc' | 'name-desc';
type FilterOption = 'all' | 'single' | 'variant';

/**
 * A component that displays a searchable, filterable list of saved presets.
 * Supports both grid and list view modes and sorts by newest first.
 */
export const PresetsList: React.FC<PresetsListProps> = ({ onLoad, onEdit }) => {
  const { presets, deletePreset } = usePresets();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const filteredPresets = useMemo(() => {
    return presets
      .filter((preset) => {
        const search = searchQuery.toLowerCase();
        
        // Handle name search (name is common)
        // Handle product name search (specific to Single preset structure)
        const productName = 'input' in preset ? preset.input.productName : preset.name;
        
        const matchesSearch = 
          preset.name.toLowerCase().includes(search) ||
          productName.toLowerCase().includes(search);
        
        // Normalize type check
        // SavedPreset uses 'type', VariantsPreset uses 'preset_type'
        // SavedPreset defaults to 'single' if undefined
        const pType = 'preset_type' in preset 
          ? preset.preset_type 
          : (preset.type || 'single');

        // Map 'variants' (db enum) to 'variant' (filter option) if needed
        // The DB uses 'variants' (plural), Filter uses 'variant' (singular)? 
        // Let's check filter options below: <option value="variant">Variants</option>
        // Adjust filter logic to match.
        const normalizedType = pType === 'variants' ? 'variant' : 'single';
        
        const matchesType = filterType === 'all' || normalizedType === filterType;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        const timeA = 'lastModified' in a ? a.lastModified : (a.updated_at ? new Date(a.updated_at).getTime() : 0);
        const timeB = 'lastModified' in b ? b.lastModified : (b.updated_at ? new Date(b.updated_at).getTime() : 0);

        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        // Default: newest
        return timeB - timeA;
      });
  }, [presets, searchQuery, filterType, sortBy]);
  
  // ... rest is similar, just update PresetListItem usage if needed (it takes 'preset' prop)
  // But PresetListItem expects SavedPreset, so I need to update it first or cast. 
  // I will assume I update PresetListItem in next step.

  if (presets.length === 0) {
    return (
      <div className="text-center py-3xl bg-surface rounded-lg border-2 border-dashed border-border-base">
        <div className="max-w-xs mx-auto">
          <p className="text-ink-900 font-bold mb-sm tracking-tight">No presets yet</p>
          <p className="text-sm text-ink-500 font-medium leading-relaxed">
            Create your first one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      <div className="flex flex-col gap-md">
        <div className="flex flex-col md:flex-row gap-md">
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              hideLabel
              icon={<Search size={16} />}
            />
          </div>
          
          <div className="flex gap-sm">
            {/* Filter Dropdown */}
            <div className="relative group">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterOption)}
                className="appearance-none h-10 pl-md pr-xl bg-surface border border-border-subtle rounded-md text-sm text-ink-700 hover:border-clay/50 focus:border-clay focus:ring-1 focus:ring-clay outline-none cursor-pointer transition-colors w-full md:w-auto"
                aria-label="Filter by type"
              >
                <option value="all">All Types</option>
                <option value="single">Single</option>
                <option value="variant">Variants</option>
              </select>
              <Filter className="absolute right-sm top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative group">
               <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none h-10 pl-md pr-xl bg-surface border border-border-subtle rounded-md text-sm text-ink-700 hover:border-clay/50 focus:border-clay focus:ring-1 focus:ring-clay outline-none cursor-pointer transition-colors w-full md:w-auto"
                aria-label="Sort by"
              >
                <option value="newest">Newest</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
              <ArrowUpDown className="absolute right-sm top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-ink-500 uppercase tracking-[0.2em]">
            {filteredPresets.length} Result{filteredPresets.length !== 1 ? 's' : ''}
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
          <p className="text-ink-500 font-medium">We couldn&apos;t find a match for your filters.</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="mt-md text-clay"
          >
            Clear Filters
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
