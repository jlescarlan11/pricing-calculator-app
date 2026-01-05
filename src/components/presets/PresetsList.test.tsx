import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { PresetsList } from './PresetsList';
import { usePresets } from '../../hooks/use-presets';
import type { Preset } from '../../types';

// Mock the hook
vi.mock('../../hooks/use-presets', () => ({
  usePresets: vi.fn(),
}));

const mockPresets: Preset[] = [
  {
    id: '1',
    name: 'Cookies',
    presetType: 'default',
    updatedAt: new Date(1000).toISOString(),
    createdAt: new Date(1000).toISOString(),
    baseRecipe: { productName: 'Choco Chip', batchSize: 24, ingredients: [], laborCost: 10, overhead: 5 },
    pricingConfig: { strategy: 'markup', value: 40 },
    variants: [],
  },
  {
    id: '2',
    name: 'Bread',
    presetType: 'default',
    updatedAt: new Date(2000).toISOString(),
    createdAt: new Date(2000).toISOString(),
    baseRecipe: { productName: 'Sourdough', batchSize: 2, ingredients: [], laborCost: 20, overhead: 10 },
    pricingConfig: { strategy: 'margin', value: 30 },
    variants: [],
  },
];

describe('PresetsList', () => {
  const mockOnLoad = vi.fn();
  const mockOnEdit = vi.fn();
  const mockDeletePreset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePresets as Mock).mockReturnValue({
      presets: mockPresets,
      deletePreset: mockDeletePreset,
    });
    // Mock window.confirm
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('renders "A clean slate" when list is empty', () => {
    (usePresets as Mock).mockReturnValue({
      presets: [],
      deletePreset: mockDeletePreset,
    });

    render(<PresetsList onLoad={mockOnLoad} onEdit={mockOnEdit} />);
    expect(screen.getByText(/A clean slate/i)).toBeInTheDocument();
  });

  it('renders presets sorted by newest first', () => {
    render(<PresetsList onLoad={mockOnLoad} onEdit={mockOnEdit} />);
    
    const items = screen.getAllByRole('heading', { level: 4 });
    // Bread has updatedAt 2000, Cookies has 1000. So Bread should be first.
    expect(items[0]).toHaveTextContent('Bread');
    expect(items[1]).toHaveTextContent('Cookies');
  });

  it('filters presets based on search query', () => {
    render(<PresetsList onLoad={mockOnLoad} onEdit={mockOnEdit} />);
    
    const searchInput = screen.getByPlaceholderText(/search by name or product/i);
    fireEvent.change(searchInput, { target: { value: 'cook' } });

    expect(screen.getByText('Cookies')).toBeInTheDocument();
    expect(screen.queryByText('Bread')).not.toBeInTheDocument();
  });

  it('shows empty state when no search results found', () => {
    render(<PresetsList onLoad={mockOnLoad} onEdit={mockOnEdit} />);
    
    const searchInput = screen.getByPlaceholderText(/search by name or product/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText(/We couldn't find a match for/i)).toBeInTheDocument();
    
    const clearBtn = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearBtn);
    
    expect(screen.getByText('Cookies')).toBeInTheDocument();
    expect(screen.getByText('Bread')).toBeInTheDocument();
  });

  it('toggles between grid and list view', () => {
    render(<PresetsList onLoad={mockOnLoad} onEdit={mockOnEdit} />);
    
    // Default is grid
    const breadTitle = screen.getByText('Bread');
    // We can check the parent container of the list
    const gridContainer = breadTitle.closest('.grid');
    expect(gridContainer).toBeInTheDocument();

    const listViewBtn = screen.getByTitle(/list view/i);
    fireEvent.click(listViewBtn);

    const breadTitleList = screen.getByText('Bread');
    const listContainer = breadTitleList.closest('.flex-col');
    expect(listContainer).toBeInTheDocument();
    expect(listContainer).not.toHaveClass('grid');
  });

  it('calls deletePreset when a preset is deleted and confirmed', () => {
    render(<PresetsList onLoad={mockOnLoad} onEdit={mockOnEdit} />);
    
    const deleteBtns = screen.getAllByLabelText(/delete preset/i);
    fireEvent.click(deleteBtns[0]); // Delete 'Bread' (index 0 because it's newest)

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Bread"?');
    expect(mockDeletePreset).toHaveBeenCalledWith('2');
  });
});