import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { PresetsList } from './PresetsList';
import { usePresets } from '../../hooks/use-presets';
import type { SavedPreset } from '../../types';

// Mock the hook
vi.mock('../../hooks/use-presets', () => ({
  usePresets: vi.fn(),
}));

const mockPresets: SavedPreset[] = [
  {
    id: '1',
    name: 'Cookies',
    type: 'single',
    lastModified: 1000,
    input: { productName: 'Choco Chip', batchSize: 24, ingredients: [], laborCost: 10, overhead: 5 },
    config: { strategy: 'markup', value: 40 },
  },
  {
    id: '2',
    name: 'Bread',
    type: 'variant',
    lastModified: 2000,
    input: { productName: 'Sourdough', batchSize: 2, ingredients: [], laborCost: 20, overhead: 10 },
    config: { strategy: 'margin', value: 30 },
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

  it('renders "No presets yet" when list is empty', () => {
    (usePresets as Mock).mockReturnValue({
      presets: [],
      deletePreset: mockDeletePreset,
    });

    render(<PresetsList onLoad={mockOnLoad} onEdit={mockOnEdit} />);
    expect(screen.getByText(/no presets yet/i)).toBeInTheDocument();
    expect(screen.getByText(/create your first one/i)).toBeInTheDocument();
  });

  it('renders presets sorted by newest first by default', () => {
    render(<PresetsList onLoad={mockOnLoad} onEdit={mockOnEdit} />);
    
    const items = screen.getAllByRole('heading', { level: 4 });
    // Bread has lastModified 2000, Cookies has 1000. So Bread should be first.
    expect(items[0]).toHaveTextContent('Bread');
    expect(items[1]).toHaveTextContent('Cookies');
  });

  it('filters presets based on search query', () => {
    render(<PresetsList onLoad={mockOnLoad} onEdit={mockOnEdit} />);
    
    const searchInput = screen.getByPlaceholderText(/search by name/i);
    fireEvent.change(searchInput, { target: { value: 'cook' } });

    expect(screen.getByText('Cookies')).toBeInTheDocument();
    expect(screen.queryByText('Bread')).not.toBeInTheDocument();
  });

  it('filters presets based on type', () => {
    render(<PresetsList onLoad={mockOnLoad} onEdit={mockOnEdit} />);
    
    const filterSelect = screen.getByLabelText(/filter by type/i);
    fireEvent.change(filterSelect, { target: { value: 'single' } });

    expect(screen.getByText('Cookies')).toBeInTheDocument();
    expect(screen.queryByText('Bread')).not.toBeInTheDocument();

    fireEvent.change(filterSelect, { target: { value: 'variant' } });
    expect(screen.queryByText('Cookies')).not.toBeInTheDocument();
    expect(screen.getByText('Bread')).toBeInTheDocument();
  });

  it('sorts presets', () => {
    render(<PresetsList onLoad={mockOnLoad} onEdit={mockOnEdit} />);
    
    const sortSelect = screen.getByLabelText(/sort by/i);
    
    // Sort by Name A-Z
    fireEvent.change(sortSelect, { target: { value: 'name-asc' } });
    let items = screen.getAllByRole('heading', { level: 4 });
    expect(items[0]).toHaveTextContent('Bread');
    expect(items[1]).toHaveTextContent('Cookies');

    // Sort by Name Z-A
    fireEvent.change(sortSelect, { target: { value: 'name-desc' } });
    items = screen.getAllByRole('heading', { level: 4 });
    expect(items[0]).toHaveTextContent('Cookies');
    expect(items[1]).toHaveTextContent('Bread');
  });

  it('shows empty state when no search results found', () => {
    render(<PresetsList onLoad={mockOnLoad} onEdit={mockOnEdit} />);
    
    const searchInput = screen.getByPlaceholderText(/search by name/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText(/we couldn't find a match for your filters/i)).toBeInTheDocument();
    
    const clearBtn = screen.getByRole('button', { name: /clear filters/i });
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
