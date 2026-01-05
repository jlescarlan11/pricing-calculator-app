import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PresetListItem } from './PresetListItem';
import type { Preset } from '../../types/calculator';

const mockPreset: Preset = {
  id: '1',
  name: 'Test Preset',
  presetType: 'default',
  createdAt: new Date('2026-01-01').toISOString(),
  updatedAt: new Date('2026-01-01').toISOString(),
  baseRecipe: {
    productName: 'Delicious Cake',
    batchSize: 12,
    ingredients: [
      { id: 'i1', name: 'Flour', amount: 500, cost: 50 },
      { id: 'i2', name: 'Sugar', amount: 200, cost: 30 },
    ],
    laborCost: 100,
    overhead: 50,
  },
  variants: [],
  pricingConfig: {
    strategy: 'markup',
    value: 50,
  },
};

describe('PresetListItem', () => {
  const mockOnLoad = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true)
    );
  });

  it('renders preset details correctly', () => {
    render(
      <PresetListItem
        preset={mockPreset}
        onLoad={mockOnLoad}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Preset')).toBeInTheDocument();
    expect(screen.getByText('Delicious Cake')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText(/units \/ batch/i)).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();
    expect(screen.getByText(/markup \(50%\)/i)).toBeInTheDocument();
    expect(screen.getByText('Jan 01, 2026')).toBeInTheDocument();
  });
  // ... rest of tests

  it('calls onLoad when Load button is clicked', () => {
    render(
      <PresetListItem
        preset={mockPreset}
        onLoad={mockOnLoad}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const loadBtn = screen.getByRole('button', { name: /load/i });
    fireEvent.click(loadBtn);

    expect(mockOnLoad).toHaveBeenCalledWith(mockPreset);
  });

  it('calls onEdit when Edit button is clicked', () => {
    render(
      <PresetListItem
        preset={mockPreset}
        onLoad={mockOnLoad}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editBtn = screen.getByLabelText(/edit preset/i);
    fireEvent.click(editBtn);

    expect(mockOnEdit).toHaveBeenCalledWith(mockPreset);
  });

  it('calls onDelete when Delete button is clicked and confirmed', () => {
    render(
      <PresetListItem
        preset={mockPreset}
        onLoad={mockOnLoad}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteBtn = screen.getByLabelText(/delete preset/i);
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Test Preset"?');
    expect(mockOnDelete).toHaveBeenCalledWith(mockPreset);
  });

  it('does not call onDelete when Delete button is clicked but cancelled', () => {
    vi.stubGlobal(
      'confirm',
      vi.fn(() => false)
    );

    render(
      <PresetListItem
        preset={mockPreset}
        onLoad={mockOnLoad}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteBtn = screen.getByLabelText(/delete preset/i);
    fireEvent.click(deleteBtn);

    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});
