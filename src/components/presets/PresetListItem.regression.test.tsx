import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PresetListItem } from './PresetListItem';
import type { Preset } from '../../types/calculator';

describe('PresetListItem Regression', () => {
  const mockOnLoad = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  it('should not crash when baseRecipe is missing', () => {
    const malformedPreset = {
      id: 'malformed-1',
      name: 'Malformed Preset',
      updatedAt: new Date().toISOString(),
      pricingConfig: { strategy: 'markup', value: 50 },
      // baseRecipe is missing
    } as unknown as Preset;

    render(
      <PresetListItem
        preset={malformedPreset}
        onLoad={mockOnLoad}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Malformed Preset')).toBeInTheDocument();
    expect(screen.getByText('Unnamed Product')).toBeInTheDocument();
  });

  it('should not crash when ingredients are missing in baseRecipe', () => {
    const malformedPreset = {
      id: 'malformed-2',
      name: 'Malformed Ingredients',
      updatedAt: new Date().toISOString(),
      baseRecipe: {
        productName: 'Partial Product',
        batchSize: 10,
        // ingredients is missing
      },
      pricingConfig: { strategy: 'markup', value: 50 },
    } as unknown as Preset;

    render(
      <PresetListItem
        preset={malformedPreset}
        onLoad={mockOnLoad}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Partial Product')).toBeInTheDocument();
    expect(screen.getByText('0 items')).toBeInTheDocument();
  });
});
