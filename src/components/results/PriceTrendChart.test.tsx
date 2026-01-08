import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceTrendChart } from './PriceTrendChart';
import type { Preset } from '../../types';

// Mock Recharts to avoid SVG/ResizeObserver issues in JSDOM
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => <div style={{ width: '100%', height: '100%' }}>{children}</div>,
    LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
    Line: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    Legend: () => <div />,
  };
});

describe('PriceTrendChart', () => {
  const mockSnapshots: Preset[] = [
    {
      id: 'snap-1',
      name: 'Test Product',
      presetType: 'default',
      isSnapshot: true,
      snapshotMetadata: {
        snapshotDate: '2026-01-01T10:00:00Z',
        isTrackedVersion: true,
        versionNumber: 1,
        parentPresetId: 'parent-1',
      },
      baseRecipe: {
        productName: 'Test Product',
        batchSize: 10,
        ingredients: [{ id: '1', name: 'Ing 1', amount: 100, cost: 100 }],
        laborCost: 50,
        overhead: 50,
      },
      variants: [],
      pricingConfig: { strategy: 'markup', value: 50 },
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z',
    },
    {
      id: 'snap-2',
      name: 'Test Product',
      presetType: 'default',
      isSnapshot: true,
      snapshotMetadata: {
        snapshotDate: '2026-01-08T10:00:00Z',
        isTrackedVersion: true,
        versionNumber: 2,
        parentPresetId: 'parent-1',
      },
      baseRecipe: {
        productName: 'Test Product',
        batchSize: 10,
        ingredients: [{ id: '1', name: 'Ing 1', amount: 100, cost: 120 }],
        laborCost: 50,
        overhead: 50,
      },
      variants: [],
      pricingConfig: { strategy: 'markup', value: 50 },
      createdAt: '2026-01-08T10:00:00Z',
      updatedAt: '2026-01-08T10:00:00Z',
    },
  ] as Preset[];

  it('renders the title', () => {
    render(<PriceTrendChart snapshots={[]} />);
    expect(screen.getByText(/Price & Cost Trends/i)).toBeDefined();
  });

  it('renders the empty state when no snapshots provided', () => {
    render(<PriceTrendChart snapshots={[]} />);
    expect(screen.getByText(/Pin milestones to visualize your price and cost history/i)).toBeDefined();
    expect(screen.queryByTestId('line-chart')).toBeNull();
  });

  it('renders the chart when snapshots are provided', () => {
    render(<PriceTrendChart snapshots={mockSnapshots} />);
    expect(screen.queryByText(/Pin milestones to visualize/i)).toBeNull();
    expect(screen.getByTestId('line-chart')).toBeDefined();
  });
});
