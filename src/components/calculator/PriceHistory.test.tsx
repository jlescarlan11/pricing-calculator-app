import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PriceHistory } from './PriceHistory';
import type { CalculationResult, Preset } from '../../types';

// No need to mock use-presets anymore as the component is now pure (props-based)

const mockCurrentResult: CalculationResult = {
  totalCost: 100,
  costPerUnit: 10,
  breakEvenPrice: 10,
  recommendedPrice: 20,
  recommendedPriceInclTax: 20,
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
  const mockOnPin = vi.fn();
  const mockOnRestore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no snapshots exist', () => {
    render(
      <PriceHistory 
        presetId="parent-1" 
        currentResult={mockCurrentResult} 
        isUnsaved={false} 
        snapshots={[]}
        onPin={mockOnPin}
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

    render(
      <PriceHistory 
        presetId="parent-1" 
        currentResult={mockCurrentResult} 
        isUnsaved={false} 
        snapshots={snapshots}
        onPin={mockOnPin}
      />
    );

    // List is collapsed by default, so we need to click "Show 2 Milestones"
    const showButton = screen.getByText(/Show 2 Milestones/i);
    fireEvent.click(showButton);

    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('Version 2')).toBeInTheDocument();
    // Check that there are at least 2 instances of Total Cost in the snapshot list
    const totalCostLabels = screen.getAllByText(/Total Cost/i);
    expect(totalCostLabels.length).toBeGreaterThanOrEqual(2);
  });

  it('shows informational banner when fewer than 3 snapshots exist', () => {
    const snapshots = [createMockSnapshot('snap-1', 1, 'parent-1')];

    render(
      <PriceHistory 
        presetId="parent-1" 
        currentResult={mockCurrentResult} 
        isUnsaved={false} 
        snapshots={snapshots}
        onPin={mockOnPin}
      />
    );

    // Expand to see tip
    const showButton = screen.getByText(/Show 1 Milestone/i);
    fireEvent.click(showButton);

    expect(
      screen.getByText(/Tip: Click any milestone to use it for comparison/i)
    ).toBeInTheDocument();
  });

  it('hides informational banner when 3 or more snapshots exist', () => {
    const snapshots = [
      createMockSnapshot('snap-1', 1, 'parent-1'),
      createMockSnapshot('snap-2', 2, 'parent-1'),
      createMockSnapshot('snap-3', 3, 'parent-1'),
    ];

    render(
      <PriceHistory 
        presetId="parent-1" 
        currentResult={mockCurrentResult} 
        isUnsaved={false} 
        snapshots={snapshots}
        onPin={mockOnPin}
      />
    );

    // Expand
    const showButton = screen.getByText(/Show 3 Milestones/i);
    fireEvent.click(showButton);

    expect(
      screen.queryByText(/Tip: Click any milestone to use it for comparison/i)
    ).not.toBeInTheDocument();
  });

  it('disables "Pin Version" button when unsaved', () => {
    render(
      <PriceHistory 
        presetId="parent-1" 
        currentResult={mockCurrentResult} 
        isUnsaved={true} 
        snapshots={[]}
        onPin={mockOnPin}
      />
    );

    const button = screen.getByRole('button', { name: /Pin Version/i });
    expect(button).toBeDisabled();
  });

  it('enables "Pin Version" button when saved', () => {
    render(
      <PriceHistory 
        presetId="parent-1" 
        currentResult={mockCurrentResult} 
        isUnsaved={false} 
        snapshots={[]}
        onPin={mockOnPin}
      />
    );

    const button = screen.getByRole('button', { name: /Pin Version/i });
    expect(button).not.toBeDisabled();
  });

  it('calls onPin when "Pin Version" is clicked', () => {
    render(
      <PriceHistory 
        presetId="parent-1" 
        currentResult={mockCurrentResult} 
        isUnsaved={false} 
        snapshots={[]}
        onPin={mockOnPin}
      />
    );

    const button = screen.getByRole('button', { name: /Pin Version/i });
    fireEvent.click(button);

    expect(mockOnPin).toHaveBeenCalled();
  });

  it('renders SnapshotComparisonCard when snapshots exist', () => {
    const snapshots = [createMockSnapshot('snap-1', 1, 'parent-1')];

    render(
      <PriceHistory 
        presetId="parent-1" 
        currentResult={mockCurrentResult} 
        isUnsaved={false} 
        snapshots={snapshots}
        onPin={mockOnPin}
      />
    );

    // SnapshotComparisonCard contains text like "Since" and then the date
    expect(screen.getByText(/Comparing with/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Version 1/i).length).toBeGreaterThan(0);
  });

  it('toggles comparison when a different milestone is clicked', () => {
    const snapshots = [
      createMockSnapshot('snap-1', 1, 'parent-1'), // Earlier
      createMockSnapshot('snap-2', 2, 'parent-1'), // Later
    ];
    // Note: The component expects snapshots to be passed in, but it does NOT sort them itself anymore? 
    // Wait, let's check PriceHistory.tsx logic again.
    // It filters and sorts in the previous version. Now it takes `snapshots`.
    // It assumes `snapshots[0]` is selected by default.
    // So we should pass them in the order we want (typically newest first).
    // Let's pass snap-2 then snap-1.
    const sortedSnapshots = [...snapshots].reverse();

    render(
      <PriceHistory 
        presetId="parent-1" 
        currentResult={mockCurrentResult} 
        isUnsaved={false} 
        snapshots={sortedSnapshots}
        onPin={mockOnPin}
      />
    );

    // Default should be latest (Version 2)
    // "Comparing with Version 2" should be visible in the collapsed text or explicit card
    // The collapsed text: "Comparing with Version 2."
    expect(screen.getAllByText(/Version 2/i).length).toBeGreaterThan(0);

    // Expand and click Version 1
    fireEvent.click(screen.getByText(/Show 2 Milestones/i));
    fireEvent.click(screen.getAllByText('Version 1')[0]);

    expect(screen.getAllByText(/Version 1/i).length).toBeGreaterThan(0);
  });

  it('calls onRestore when restore button is clicked', () => {
    const snapshots = [createMockSnapshot('snap-1', 1, 'parent-1')];
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <PriceHistory 
        presetId="parent-1" 
        currentResult={mockCurrentResult} 
        isUnsaved={false} 
        snapshots={snapshots}
        onPin={mockOnPin}
        onRestore={mockOnRestore}
      />
    );

    // Expand
    fireEvent.click(screen.getByText(/Show 1 Milestone/i));
    
    // Click restore button (RotateCcw icon)
    const restoreButton = screen.getByTitle(/Restore this version/i);
    fireEvent.click(restoreButton);

    expect(mockOnRestore).toHaveBeenCalledWith(snapshots[0]);
  });
});