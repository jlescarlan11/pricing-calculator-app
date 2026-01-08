import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PriceHistory } from './PriceHistory';
import { usePresets } from '../../hooks/use-presets';
import type { CalculationResult, Preset } from '../../types';

// Mock usePresets
vi.mock('../../hooks/use-presets', () => ({
  usePresets: vi.fn(),
}));

const mockCurrentResult: CalculationResult = {
  totalCost: 100,
  costPerUnit: 10,
  breakEvenPrice: 10,
  recommendedPrice: 20,
  profitPerBatch: 100,
  profitPerUnit: 10,
  profitMarginPercent: 50,
  breakdown: {
    ingredients: 60,
    labor: 20,
    overhead: 20,
  },
};

const createMockSnapshot = (id: string, version: number, parentId: string): Preset => ({
  id,
  name: `Snapshot ${version}`,
  presetType: 'default',
  baseRecipe: {
    productName: 'Test Product',
    batchSize: 10,
    ingredients: [],
    laborCost: 20,
    overhead: 20,
  },
  variants: [],
  pricingConfig: { strategy: 'markup', value: 50 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isSnapshot: true,
  snapshotMetadata: {
    snapshotDate: new Date().toISOString(),
    isTrackedVersion: true,
    versionNumber: version,
    parentPresetId: parentId,
  },
});

describe('PriceHistory', () => {
  const mockCreateSnapshot = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePresets as any).mockReturnValue({
      presets: [],
      createSnapshot: mockCreateSnapshot,
    });
  });

  it('renders empty state when no snapshots exist', () => {
    render(
      <PriceHistory
        presetId="parent-1"
        currentResult={mockCurrentResult}
        isUnsaved={false}
      />
    );

    expect(screen.getByText(/No price milestones tracked yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Pin a version when you review costs monthly/i)).toBeInTheDocument();
  });

  it('renders list of snapshots when they exist', () => {
    const snapshots = [
      createMockSnapshot('snap-1', 1, 'parent-1'),
      createMockSnapshot('snap-2', 2, 'parent-1'),
    ];

    (usePresets as any).mockReturnValue({
      presets: snapshots,
      createSnapshot: mockCreateSnapshot,
    });

    render(
      <PriceHistory
        presetId="parent-1"
        currentResult={mockCurrentResult}
        isUnsaved={false}
      />
    );

    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('Version 2')).toBeInTheDocument();
    // Check that there are at least 2 instances of Total Cost in the snapshot list
    const totalCostLabels = screen.getAllByText(/Total Cost/i);
    expect(totalCostLabels.length).toBeGreaterThanOrEqual(2);
  });

  it('shows informational banner when fewer than 3 snapshots exist', () => {
    const snapshots = [createMockSnapshot('snap-1', 1, 'parent-1')];

    (usePresets as any).mockReturnValue({
      presets: snapshots,
      createSnapshot: mockCreateSnapshot,
    });

    render(
      <PriceHistory
        presetId="parent-1"
        currentResult={mockCurrentResult}
        isUnsaved={false}
      />
    );

    expect(screen.getByText(/Tip: Pin a new version monthly to track profit trends over time/i)).toBeInTheDocument();
  });

  it('hides informational banner when 3 or more snapshots exist', () => {
    const snapshots = [
      createMockSnapshot('snap-1', 1, 'parent-1'),
      createMockSnapshot('snap-2', 2, 'parent-1'),
      createMockSnapshot('snap-3', 3, 'parent-1'),
    ];

    (usePresets as any).mockReturnValue({
      presets: snapshots,
      createSnapshot: mockCreateSnapshot,
    });

    render(
      <PriceHistory
        presetId="parent-1"
        currentResult={mockCurrentResult}
        isUnsaved={false}
      />
    );

    expect(screen.queryByText(/Tip: Pin a new version monthly to track profit trends over time/i)).not.toBeInTheDocument();
  });

  it('disables "Pin Current Version" button when unsaved', () => {
    render(
      <PriceHistory
        presetId="parent-1"
        currentResult={mockCurrentResult}
        isUnsaved={true}
      />
    );

    const button = screen.getByRole('button', { name: /Pin Current Version/i });
    expect(button).toBeDisabled();
  });

  it('enables "Pin Current Version" button when saved', () => {
    render(
      <PriceHistory
        presetId="parent-1"
        currentResult={mockCurrentResult}
        isUnsaved={false}
      />
    );

    const button = screen.getByRole('button', { name: /Pin Current Version/i });
    expect(button).not.toBeDisabled();
  });

  it('calls createSnapshot when "Pin Current Version" is clicked', async () => {
    render(
      <PriceHistory
        presetId="parent-1"
        currentResult={mockCurrentResult}
        isUnsaved={false}
      />
    );

    const button = screen.getByRole('button', { name: /Pin Current Version/i });
    fireEvent.click(button);

    expect(mockCreateSnapshot).toHaveBeenCalledWith('parent-1');
  });

  it('renders SnapshotComparisonCard when snapshots exist', () => {
    const snapshots = [createMockSnapshot('snap-1', 1, 'parent-1')];

    (usePresets as any).mockReturnValue({
      presets: snapshots,
      createSnapshot: mockCreateSnapshot,
    });

    render(
      <PriceHistory
        presetId="parent-1"
        currentResult={mockCurrentResult}
        isUnsaved={false}
      />
    );

        // SnapshotComparisonCard contains text like "Since" and then the date

        expect(screen.getByText(/Comparison with Last Milestone/i)).toBeInTheDocument();

        expect(screen.getByText(/Since/i)).toBeInTheDocument();

      });

    });

    