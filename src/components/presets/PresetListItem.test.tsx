import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PresetListItem } from './PresetListItem';
import type { SavedPreset } from '../../types/calculator';
import type { VariantsPreset } from '../../types/variants';

// Mock useSync hook
vi.mock('../../hooks/useSync', () => ({
  useSync: vi.fn(() => ({
    status: 'synced',
    lastSyncedAt: Date.now(),
  })),
}));

const mockSinglePreset: SavedPreset = {
  id: '1',
  name: 'Test Single Preset',
  type: 'single',
  lastModified: new Date('2026-01-01').getTime(),
  last_synced_at: new Date('2026-01-01T10:00:00Z').toISOString(),
  input: {
    productName: 'Delicious Cake',
    batchSize: 12,
    ingredients: [
      { id: 'i1', name: 'Flour', amount: 500, cost: 50 },
      { id: 'i2', name: 'Sugar', amount: 200, cost: 30 },
    ],
    laborCost: 100,
    overhead: 50,
  },
  config: {
    strategy: 'markup',
    value: 50,
  },
};

const mockVariantPreset: VariantsPreset = {
  id: '2',
  user_id: 'user1',
  name: 'Test Variant Preset',
  preset_type: 'variants',
  batch_size: 10,
  ingredients: [
    { id: 'i1', name: 'Flour', amount: 1000, cost: 100 }
  ],
  labor_cost: 200,
  overhead_cost: 50,
  created_at: '2026-01-01T10:00:00Z',
  updated_at: '2026-01-01T10:00:00Z',
  last_synced_at: '2026-01-01T10:00:00Z',
  variants: [
    {
      id: 'v1',
      name: 'Regular',
      amount: 1,
      unit: 'pc',
      additionalIngredients: [],
      additionalLabor: 0,
      currentSellingPrice: null,
    },
  ],
  pricing_strategy: 'margin',
  pricing_value: 50,
  current_selling_price: null,
};

describe('PresetListItem', () => {
  const mockOnLoad = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('renders single preset details correctly', () => {
    render(
      <PresetListItem
        preset={mockSinglePreset}
        onLoad={mockOnLoad}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Single Preset')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('markup')).toBeInTheDocument();
    expect(screen.getByText('Jan 01, 2026')).toBeInTheDocument();
    
    // Check for Badge
    expect(screen.getByText('Single')).toBeInTheDocument();
  });

  it('renders variant preset details correctly', () => {
    render(
      <PresetListItem
        preset={mockVariantPreset}
        onLoad={mockOnLoad}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Variant Preset')).toBeInTheDocument();
    expect(screen.getByText('Batch Profit')).toBeInTheDocument();
    // Calculated profit for mockVariantPreset:
    // Base cost = 100 (ing) + 200 (labor) + 50 (overhead) = 350 total for batch of 10
    // Cost per unit = 350 / 10 = 35
    // Margin 50% on cost 35 -> Price = 35 / (1 - 0.5) = 70
    // Profit per unit = 70 - 35 = 35
    // Profit per batch = 35 * 10 = 350
    expect(screen.getByText(/₱350\.00/i)).toBeInTheDocument();
    expect(screen.getByText('Best Performing')).toBeInTheDocument();
    expect(screen.getByText('Regular')).toBeInTheDocument();
    expect(screen.getByText('50.00%')).toBeInTheDocument();
    
    // Check for Badge
    expect(screen.getByText('Variants')).toBeInTheDocument();
    expect(screen.getByText('1 Variants')).toBeInTheDocument();
  });

  it('calls onLoad when Load button is clicked', () => {
    render(
      <PresetListItem
        preset={mockSinglePreset}
        onLoad={mockOnLoad}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const loadBtn = screen.getByRole('button', { name: /load/i });
    fireEvent.click(loadBtn);

    expect(mockOnLoad).toHaveBeenCalledWith(mockSinglePreset);
  });

  it('calls onEdit when Edit icon is clicked', () => {
    render(
      <PresetListItem
        preset={mockSinglePreset}
        onLoad={mockOnLoad}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editBtn = screen.getByLabelText(/edit name/i);
    fireEvent.click(editBtn);

    expect(mockOnEdit).toHaveBeenCalledWith(mockSinglePreset);
  });

  it('calls onDelete when Delete button is clicked and confirmed', () => {
    render(
      <PresetListItem
        preset={mockSinglePreset}
        onLoad={mockOnLoad}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteBtn = screen.getByLabelText(/delete preset/i);
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Test Single Preset"?');
    expect(mockOnDelete).toHaveBeenCalledWith(mockSinglePreset);
  });

  it('renders correctly in list mode', () => {
    render(
      <PresetListItem
        preset={mockSinglePreset}
        onLoad={mockOnLoad}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        viewMode="list"
      />
    );

    expect(screen.getByText('Test Single Preset')).toBeInTheDocument();
    expect(screen.getByText('Single')).toBeInTheDocument();
  });
});