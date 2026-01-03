import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResultsDisplay } from './ResultsDisplay';
import type { CalculationResult, CalculationInput } from '../../types/calculator';

const mockInput: CalculationInput = {
  productName: 'Test Product',
  batchSize: 10,
  ingredients: [],
  laborCost: 100,
  overhead: 50,
  currentSellingPrice: 200,
};

const mockResults: CalculationResult = {
  totalCost: 150,
  costPerUnit: 15,
  breakEvenPrice: 15,
  recommendedPrice: 30,
  profitPerUnit: 15,
  profitPerBatch: 150,
  profitMarginPercent: 50,
  breakdown: {
    ingredients: 0,
    labor: 100,
    overhead: 50,
  },
};

describe('ResultsDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('renders placeholder when results are null', () => {
    render(<ResultsDisplay results={null} input={mockInput} onEdit={() => {}} />);
    
    expect(screen.getByText(/Ready to calculate\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Calculation/i)).toBeInTheDocument();
  });

  it('renders results when provided', () => {
    render(<ResultsDisplay results={mockResults} input={mockInput} onEdit={() => {}} />);
    
    expect(screen.getByText(/Calculation Results/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
    // Check if sub-components are rendered (by checking for their specific text)
    expect(screen.getByText(/Pricing Recommendation/i)).toBeInTheDocument();
    expect(screen.getByText(/Price Comparison/i)).toBeInTheDocument();
    expect(screen.getByText(/Cost Breakdown/i)).toBeInTheDocument();
  });

  it('calls onEdit when clicking Start Calculation in placeholder', () => {
    const onEdit = vi.fn();
    render(<ResultsDisplay results={null} input={mockInput} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByText(/Start Calculation/i));
    expect(onEdit).toHaveBeenCalled();
  });

  it('calls onEdit when clicking Adjust Inputs', () => {
    const onEdit = vi.fn();
    render(<ResultsDisplay results={mockResults} input={mockInput} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByText(/Adjust Inputs/i));
    expect(onEdit).toHaveBeenCalled();
  });

  it('copies summary to clipboard when Copy button is clicked', async () => {
    render(<ResultsDisplay results={mockResults} input={mockInput} />);
    
    const copyButton = screen.getByText(/Copy/i);
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(screen.getByText(/Copied/i)).toBeInTheDocument();
  });

  it('triggers print when Print button is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<ResultsDisplay results={mockResults} input={mockInput} />);
    
    fireEvent.click(screen.getByText(/Print/i));
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
