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
    <Card className="group transition-all duration-200 hover:shadow-md hover:border-blue-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-lg font-bold text-gray-900 truncate" title={name}>
              {name}
            </h4>
            <Badge variant="info" className="hidden sm:inline-flex">
              Preset
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              <span className="truncate max-w-[150px]" title={productName || 'Unnamed Product'}>
                {productName || 'Unnamed Product'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-700">{batchSize}</span>
              <span>unit{batchSize !== 1 ? 's' : ''} / batch</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(lastModified)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:ml-4">
          <Tooltip content="Load this preset into calculator">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onLoad(preset)}
              className="flex-1 sm:flex-none flex items-center gap-1.5"
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
              className="p-2 sm:w-10 h-10 flex items-center justify-center"
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
              className="p-2 sm:w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100"
              aria-label="Delete preset"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Secondary Preview Info */}
      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="block text-gray-400 uppercase tracking-wider mb-0.5">Ingredients</span>
          <span className="font-semibold text-gray-700">{ingredients.length} item{ingredients.length !== 1 ? 's' : ''}</span>
        </div>
        <div>
          <span className="block text-gray-400 uppercase tracking-wider mb-0.5">Strategy</span>
          <span className="font-semibold text-gray-700 capitalize">
            {config.strategy} ({config.value}%)
          </span>
        </div>
      </div>
    </Card>
  );
};
