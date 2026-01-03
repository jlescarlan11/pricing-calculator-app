import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResultsDisplay } from './ResultsDisplay';
import type { CalculationResult, CalculationInput, PricingConfig } from '../../types/calculator';

const mockInput: CalculationInput = {
  productName: 'Test Product',
  batchSize: 10,
  ingredients: [],
  laborCost: 100,
  overhead: 50,
  currentSellingPrice: 200,
};

const mockConfig: PricingConfig = {
  strategy: 'markup',
  value: 50,
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
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
      writable: true
    });
    // Mock isSecureContext
    vi.stubGlobal('isSecureContext', true);
    // Mock execCommand for fallback
    document.execCommand = vi.fn().mockReturnValue(true);
  });

  it('renders placeholder when results are null', () => {
    render(<ResultsDisplay results={null} input={mockInput} config={mockConfig} onEdit={() => {}} />);
    
    expect(screen.getByText(/Ready to calculate\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Calculation/i)).toBeInTheDocument();
  });

  it('renders results when provided', () => {
    render(<ResultsDisplay results={mockResults} input={mockInput} config={mockConfig} onEdit={() => {}} />);
    
    expect(screen.getByText(/Calculation Results/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Test Product/i).length).toBeGreaterThan(0);
    // Check if sub-components are rendered (by checking for their specific text)
    expect(screen.getByText(/Pricing Recommendation/i)).toBeInTheDocument();
    expect(screen.getByText(/Price Comparison/i)).toBeInTheDocument();
    expect(screen.getByText(/Cost Breakdown/i)).toBeInTheDocument();
  });

  it('renders business name and date in print header', () => {
    const inputWithBusiness = { ...mockInput, businessName: 'Maria\'s Bakery' };
    render(<ResultsDisplay results={mockResults} input={inputWithBusiness} config={mockConfig} />);
    
    const businessHeading = screen.getByRole('heading', { name: /Maria's Bakery/i });
    expect(businessHeading).toBeInTheDocument();
    expect(businessHeading.closest('.print\\:block')).toHaveClass('print:block');
    expect(screen.getByText(/Product Pricing Report/i)).toBeInTheDocument();
  });

  it('calls onEdit when clicking Start Calculation in placeholder', () => {
    const onEdit = vi.fn();
    render(<ResultsDisplay results={null} input={mockInput} config={mockConfig} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByText(/Start Calculation/i));
    expect(onEdit).toHaveBeenCalled();
  });

  it('calls onEdit when clicking Adjust Inputs', () => {
    const onEdit = vi.fn();
    render(<ResultsDisplay results={mockResults} input={mockInput} config={mockConfig} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByText(/Adjust Inputs/i));
    expect(onEdit).toHaveBeenCalled();
  });

  it('copies summary to clipboard when Copy Summary is clicked in Share menu', async () => {
    render(<ResultsDisplay results={mockResults} input={mockInput} config={mockConfig} />);
    
    // Open share menu
    fireEvent.click(screen.getByText(/Share/i));
    
    const copyOption = screen.getByText(/Copy Summary/i);
    await act(async () => {
      fireEvent.click(copyOption);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(screen.getByText(/Copied to Clipboard/i)).toBeInTheDocument();
  });

  it('triggers print when Print Results is clicked in Share menu', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<ResultsDisplay results={mockResults} input={mockInput} config={mockConfig} />);
    
    // Open share menu
    fireEvent.click(screen.getByText(/Share/i));
    
    fireEvent.click(screen.getByText(/Print Results/i));
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('opens save modal when Save Product button is clicked', () => {
    render(<ResultsDisplay results={mockResults} input={mockInput} config={mockConfig} />);
    
    const saveButton = screen.getByText(/Save Product/i);
    fireEvent.click(saveButton);
    
    expect(screen.getByText(/Save as Preset/i)).toBeInTheDocument();
  });
});
