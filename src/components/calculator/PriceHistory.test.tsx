import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PriceHistory } from './PriceHistory';
import { usePresets } from '../../hooks/use-presets';

// Mock the hooks
vi.mock('../../hooks/use-presets', () => ({
  usePresets: vi.fn(),
}));

const mockCalculationResult = {
  totalCost: 100,
  costPerUnit: 10,
  breakEvenPrice: 10,
  recommendedPrice: 15,
  profitPerBatch: 50,
  profitPerUnit: 5,
  profitMarginPercent: 33.33,
  breakdown: {
    ingredients: 60,
    labor: 20,
    overhead: 20,
  },
};

describe('PriceHistory', () => {
  it('renders empty state when no snapshots exist', () => {
    (usePresets as any).mockReturnValue({
      presets: [],
      createSnapshot: vi.fn(),
    });

    render(
      <PriceHistory 
        presetId="test-preset" 
        currentResult={mockCalculationResult} 
        isUnsaved={false} 
      />
    );

    expect(screen.getByText(/No price milestones tracked yet/)).toBeInTheDocument();
  });

  it('renders snapshots when they exist', () => {
    const mockSnapshots = [
      {
        id: 'snapshot-1',
        name: 'Snapshot 1',
        isSnapshot: true,
        snapshotMetadata: {
          snapshotDate: '2026-01-01T00:00:00.000Z',
          isTrackedVersion: true,
          versionNumber: 1,
          parentPresetId: 'test-preset',
        },
        baseRecipe: {
          productName: 'Test',
          batchSize: 10,
          ingredients: [],
          laborCost: 10,
          overhead: 10,
        },
        pricingConfig: { strategy: 'markup', value: 50 },
        variants: [],
      },
    ];

    (usePresets as any).mockReturnValue({
      presets: mockSnapshots,
      createSnapshot: vi.fn(),
    });

    render(
      <PriceHistory 
        presetId="test-preset" 
        currentResult={mockCalculationResult} 
        isUnsaved={false} 
      />
    );

    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('Comparison with Last Milestone')).toBeInTheDocument();
  });

  it('disables pin button when unsaved', () => {
    const createSnapshotMock = vi.fn();
    (usePresets as any).mockReturnValue({
      presets: [],
      createSnapshot: createSnapshotMock,
    });

    render(
      <PriceHistory 
        presetId="test-preset" 
        currentResult={mockCalculationResult} 
        isUnsaved={true} 
      />
    );

    const button = screen.getByRole('button', { name: /Pin Current Version/i });
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(createSnapshotMock).not.toHaveBeenCalled();
  });
});
