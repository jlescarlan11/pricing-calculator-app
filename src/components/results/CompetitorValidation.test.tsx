import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompetitorModal } from './CompetitorModal';
import { useToast } from '../shared';
import type { Competitor } from '../../types/calculator';

// Mock useToast
vi.mock('../shared', async () => {
  const actual = await vi.importActual('../shared');
  return {
    ...(actual as unknown as Record<string, unknown>),
    useToast: vi.fn(),
  };
});

describe('CompetitorValidation', () => {
  const mockAddToast = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ addToast: mockAddToast });
  });

  const existingCompetitors: Competitor[] = Array(4).fill(null).map((_, i) => ({
    id: `c-${i}`,
    presetId: 'p1',
    competitorName: `Comp ${i}`,
    competitorPrice: 100 + i,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  it('enforces the five-competitor limit', async () => {
    render(
      <CompetitorModal
        isOpen={true}
        onClose={mockOnClose}
        competitors={existingCompetitors}
        onSave={mockOnSave}
      />
    );

    const addButton = screen.getByText(/Add Competitor/i);
    
    // Add 5th competitor
    fireEvent.click(addButton);
    
    // Check that button is disabled when limit reached
    expect(screen.getByText(/Limit Reached \(5\/5\)/i)).toBeInTheDocument();
    expect(addButton.closest('button')).toBeDisabled();
  });

  it('allows adding up to five competitors successfully', async () => {
    render(
      <CompetitorModal
        isOpen={true}
        onClose={mockOnClose}
        competitors={[]}
        onSave={mockOnSave}
      />
    );

    const addButton = screen.getByText(/Add Competitor/i);
    
    // Add 5 competitors
    for (let i = 0; i < 5; i++) {
      fireEvent.click(addButton);
    }

    const nameInputs = screen.getAllByPlaceholderText(/e.g., Local Bakery A/i);
    const priceInputs = screen.getAllByPlaceholderText(/0.00/i);

    expect(nameInputs).toHaveLength(5);
    expect(priceInputs).toHaveLength(5);

    // Fill them in
    nameInputs.forEach((input, i) => {
      fireEvent.change(input, { target: { value: `Comp ${i + 1}` } });
    });
    priceInputs.forEach((input, i) => {
      fireEvent.change(input, { target: { value: (100 + i).toString() } });
    });

    const saveButton = screen.getByText(/Save Changes/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
      const savedData = mockOnSave.mock.calls[0][0];
      expect(savedData).toHaveLength(5);
      expect(savedData[0].competitorName).toBe('Comp 1');
      expect(savedData[4].competitorName).toBe('Comp 5');
    });
  });

  it('handles database errors gracefully during save', async () => {
    mockOnSave.mockRejectedValue(new Error('DB Error'));

    render(
      <CompetitorModal
        isOpen={true}
        onClose={mockOnClose}
        competitors={[{
          id: 'c1',
          presetId: 'p1',
          competitorName: 'Exist',
          competitorPrice: 100,
          notes: '',
          createdAt: '',
          updatedAt: ''
        }]}
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByText(/Save Changes/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('Failed to save competitors.', 'error');
    });
    
    // Modal should stay open on error
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
