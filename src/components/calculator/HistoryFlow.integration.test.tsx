import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PriceHistory } from './PriceHistory';
import type { CalculationResult, Preset } from '../../types';

// This integration test now focuses on the prop-driven flow of PriceHistory,
// simulating how a parent component would update its props.

describe('HistoryFlow Integration', () => {
  const mockPresetId = 'preset-123';
  const mockCurrentResult: CalculationResult = {
    totalCost: 120, // Current total cost
    recommendedPrice: 180,
    profitMarginPercent: 33.33,
    breakEvenPrice: 120,
    profitPerBatch: 60,
    profitPerUnit: 6,
    costBreakdown: { ingredients: 100, labor: 10, overhead: 10 },
  };

  const initialPreset: Preset = {
    id: mockPresetId,
    name: 'Test Product',
    userId: 'user-1',
    presetType: 'default',
    baseRecipe: {
      productName: 'Test',
      batchSize: 10,
      ingredients: [],
      laborCost: 10,
      overhead: 10,
      hasVariants: false,
      variants: [],
    },
    variants: [],
    pricingConfig: { strategy: 'markup', value: 50 },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes the full flow from pinning a version to UI update and comparison', async () => {
    // 1. Initial Render (Empty Snapshots)
    // We simulate the fallback logic where initially there are NO snapshots
    let snapshots: Preset[] = [];
    const handlePin = vi.fn();

    const { rerender } = render(
      <PriceHistory 
        presetId={mockPresetId} 
        currentResult={mockCurrentResult} 
        isUnsaved={false} 
        snapshots={snapshots}
        onPin={handlePin}
      />
    );

    // Verify initial state
    expect(screen.getByText(/No price milestones tracked yet/i)).toBeInTheDocument();

    // 2. Click "Pin Version"
    const pinButton = screen.getByRole('button', { name: /Pin Version/i });
    fireEvent.click(pinButton);
    expect(handlePin).toHaveBeenCalled();

    // 3. Simulate Parent Component creating snapshot and updating props
    const newSnapshot: Preset = {
      ...structuredClone(initialPreset),
      id: 'snapshot-1',
      isSnapshot: true,
      snapshotMetadata: {
        snapshotDate: new Date().toISOString(),
        isTrackedVersion: true,
        versionNumber: 1,
        parentPresetId: mockPresetId,
      },
      // Give it different cost values to verify display
      baseRecipe: {
          ...initialPreset.baseRecipe,
          laborCost: 200 // Higher cost to verify numbers
      }
    };
    snapshots = [newSnapshot];

    rerender(
      <PriceHistory 
        presetId={mockPresetId} 
        currentResult={mockCurrentResult} 
        isUnsaved={false} 
        snapshots={snapshots}
        onPin={handlePin}
      />
    );

    // 4. Verify UI updates with new milestone
    expect(screen.queryByText(/No price milestones tracked yet/i)).not.toBeInTheDocument();
    
    // We need to expand the list to see the version
    const showButton = screen.getByText(/Show 1 Milestone/i);
    fireEvent.click(showButton);
    expect(screen.getAllByText(/Version 1/i).length).toBeGreaterThan(0);

    // 5. Verify Comparison Card appears (since we have a snapshot and current result)
    // Since we only have 1 snapshot, it auto-selects it for comparison
    expect(screen.getByText(/Comparison with Version 1/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Version 1/i).length).toBeGreaterThan(0);
    
    // 6. Verify "Tip" appears because we have < 3 snapshots
    expect(screen.getByText(/Tip: Click any milestone/i)).toBeInTheDocument();
  });

  it('disables the pin button when there are unsaved changes', () => {
    render(
      <PriceHistory 
        presetId={mockPresetId} 
        currentResult={mockCurrentResult} 
        isUnsaved={true} 
        snapshots={[]}
        onPin={vi.fn()}
      />
    );

    const pinButton = screen.getByRole('button', { name: /Pin Version/i });
    expect(pinButton).toBeDisabled();
    expect(pinButton).toHaveAttribute('title', 'Save the preset first to pin a version');
  });
});
