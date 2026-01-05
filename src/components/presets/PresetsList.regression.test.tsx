import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PresetsList } from './PresetsList';
import { usePresets } from '../../hooks/use-presets';
import type { Preset } from '../../types/calculator';

// Mock the hook
vi.mock('../../hooks/use-presets', () => ({
  usePresets: vi.fn(),
}));

describe('PresetsList Regression', () => {
  const mockOnLoad = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not crash when some presets have missing baseRecipe during filtering', () => {
    const presets = [
      {
        id: '1',
        name: 'Valid Preset',
        updatedAt: new Date().toISOString(),
        baseRecipe: { productName: 'Bread', batchSize: 1, ingredients: [] },
        pricingConfig: { strategy: 'markup', value: 50 },
      },
      {
        id: '2',
        name: 'Malformed Preset',
        updatedAt: new Date().toISOString(),
        // baseRecipe missing
        pricingConfig: { strategy: 'markup', value: 50 },
      },
    ] as unknown as Preset[];

    (usePresets as any).mockReturnValue({
      presets,
      deletePreset: vi.fn(),
    });

    render(<PresetsList onLoad={mockOnLoad} onEdit={mockOnEdit} />);

    expect(screen.getByText('Valid Preset')).toBeInTheDocument();
    expect(screen.getByText('Malformed Preset')).toBeInTheDocument();
  });
});
