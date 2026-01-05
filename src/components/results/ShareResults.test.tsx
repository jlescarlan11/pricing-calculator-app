import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShareResults } from './ShareResults';
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

describe('ShareResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
      writable: true
    });
    // Mock isSecureContext
    vi.stubGlobal('isSecureContext', true);
    // Mock timers for feedback
    vi.useFakeTimers();
  });

  it('is disabled when results are null', () => {
    render(<ShareResults results={null} input={mockInput} />);
    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeDisabled();
  });

  it('opens dropdown when clicked', () => {
    render(<ShareResults results={mockResults} input={mockInput} />);
    const shareButton = screen.getByRole('button', { name: /share/i });
    
    fireEvent.click(shareButton);
    
    expect(screen.getByText(/^Copy$/)).toBeInTheDocument();
    expect(screen.getByText(/^Print$/)).toBeInTheDocument();
    expect(screen.getByText(/Email Report/i)).toBeInTheDocument();
    expect(screen.getByText(/Export PDF/i)).toBeInTheDocument();
  });

  it('calls copyToClipboard when Copy Summary is clicked', async () => {
    render(<ShareResults results={mockResults} input={mockInput} />);
    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    
    const copyOption = screen.getByText(/^Copy$/);
    await act(async () => {
      fireEvent.click(copyOption);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(screen.getByText(/Copied/i)).toBeInTheDocument();
  });

  it('triggers window.print when Print Results is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<ShareResults results={mockResults} input={mockInput} />);
    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    
    fireEvent.click(screen.getByText(/^Print$/));
    
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('has disabled options for Email and PDF', () => {
    render(<ShareResults results={mockResults} input={mockInput} />);
    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    
    const emailOption = screen.getByText(/Email Report/i).closest('button');
    const pdfOption = screen.getByText(/Export PDF/i).closest('button');
    
    expect(emailOption).toBeDisabled();
    expect(pdfOption).toBeDisabled();
  });

  it('closes dropdown when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <ShareResults results={mockResults} input={mockInput} />
      </div>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    expect(screen.queryByText(/^Copy$/)).toBeInTheDocument();
    
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByText(/^Copy$/)).not.toBeInTheDocument();
  });

  it('closes dropdown after clicking an action', async () => {
    render(<ShareResults results={mockResults} input={mockInput} />);
    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    
    const printOption = screen.getByText(/^Print$/);
    fireEvent.click(printOption);
    
    expect(screen.queryByText(/^Print$/)).not.toBeInTheDocument();
  });
});
