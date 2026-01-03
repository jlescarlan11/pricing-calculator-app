import React from 'react';
import { FileEdit, Trash2, Play, Calendar, Package } from 'lucide-react';
import type { SavedPreset } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Button, Card, Badge, Tooltip } from '../shared';

interface PresetListItemProps {
  preset: SavedPreset;
  onLoad: (preset: SavedPreset) => void;
  onEdit: (preset: SavedPreset) => void;
  onDelete: (preset: SavedPreset) => void;
}

/**
 * A list item component for displaying a saved preset with its metadata and actions.
 */
export const PresetListItem: React.FC<PresetListItemProps> = ({
  preset,
  onLoad,
  onEdit,
  onDelete,
}) => {
  const { name, input, lastModified, config } = preset;
  const { productName, batchSize, ingredients } = input;

  return (
    <Card className="group transition-all duration-500 hover:border-clay/50 bg-bg-main hover:bg-surface border-border-subtle shadow-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-lg">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-sm mb-sm">
            <h4 className="text-lg font-bold text-ink-900 truncate tracking-tight" title={name}>
              {name}
            </h4>
            <Badge variant="info" className="hidden sm:inline-flex text-[10px] uppercase tracking-widest py-xs px-sm">
              Saved
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-lg gap-y-sm text-sm text-ink-500 font-medium">
            <div className="flex items-center gap-sm">
              <Package className="w-4 h-4 text-clay/60" />
              <span className="truncate max-w-[150px] text-ink-700" title={productName || 'Unnamed Product'}>
                {productName || 'Unnamed Product'}
              </span>
            </div>
            <div className="flex items-center gap-sm">
              <span className="font-bold text-ink-900">{batchSize}</span>
              <span>unit{batchSize !== 1 ? 's' : ''} / batch</span>
            </div>
            <div className="flex items-center gap-sm">
              <Calendar className="w-4 h-4 text-ink-300" />
              <span>{formatDate(lastModified)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-sm sm:ml-lg">
          <Tooltip content="Load this preset into calculator">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onLoad(preset)}
              className="flex-1 sm:flex-none flex items-center gap-sm px-lg"
            >
              <Play className="w-4 h-4 fill-current" />
              Load
            </Button>
          </Tooltip>

          <Tooltip content="Edit preset name">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(preset)}
              className="p-sm sm:w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300 hover:text-clay hover:border-clay/30"
              aria-label="Edit preset name"
            >
              <FileEdit className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Delete preset">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
                  onDelete(preset);
                }
              }}
              className="p-sm sm:w-11 h-11 flex items-center justify-center text-ink-300 hover:text-rust hover:bg-rust/5 hover:border-rust/20 rounded-xl transition-all duration-300"
              aria-label="Delete preset"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Secondary Preview Info */}
      <div className="mt-lg pt-lg border-t border-border-subtle grid grid-cols-2 sm:grid-cols-4 gap-lg text-[10px] uppercase tracking-widest font-bold">
        <div>
          <span className="block text-ink-500 mb-xs opacity-70">Ingredients</span>
          <span className="text-ink-900">{ingredients.length} item{ingredients.length !== 1 ? 's' : ''}</span>
        </div>
        <div>
          <span className="block text-ink-500 mb-xs opacity-70">Strategy</span>
          <span className="text-ink-900">
            {config.strategy} ({config.value}%)
          </span>
        </div>
      </div>
    </Card>
  );
};
