import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResultsDisplay } from './ResultsDisplay';
import { ToastProvider } from '../shared/Toast';
import type { CalculationResult, CalculationInput, PricingConfig } from '../../types/calculator';
import { analyticsService } from '../../services/analyticsService';
import { shouldEnableLLM } from '../../utils/featureFlags';
import { supabase } from '../../lib/supabase';
import { usePresets } from '../../hooks/use-presets';

// Mock usePresets
vi.mock('../../hooks/use-presets', () => ({
  usePresets: vi.fn(() => ({
    presets: [],
    getPreset: vi.fn((id) => ({ id, name: 'Test Preset', competitors: [] })),
    addPreset: vi.fn(),
    updatePreset: vi.fn(),
    deletePreset: vi.fn(),
  })),
}));

// Mock supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock analyticsService
vi.mock('../../services/analyticsService', () => ({
  analyticsService: {
    trackAnalysisClick: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock featureFlags
vi.mock('../../utils/featureFlags', () => ({
  shouldEnableLLM: vi.fn().mockResolvedValue(false),
}));

// Mock AnalyzePriceCard helpers
vi.mock('./AnalyzePriceCard', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    incrementUsage: vi.fn(),
    checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 5 })),
  };
});

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
      writable: true,
    });
    // Mock isSecureContext
    vi.stubGlobal('isSecureContext', true);
    // Mock execCommand for fallback
    document.execCommand = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<ToastProvider>{ui}</ToastProvider>);
  };

  it('renders placeholder when results are null', () => {
    renderWithProviders(
      <ResultsDisplay results={null} input={mockInput} config={mockConfig} onEdit={() => {}} />
    );

    expect(screen.getByText(/Shall we begin\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore/i)).toBeInTheDocument();
  });

  it('renders results when provided', () => {
    renderWithProviders(
      <ResultsDisplay
        results={mockResults}
        input={mockInput}
        config={mockConfig}
        onEdit={() => {}}
      />
    );

    expect(screen.getByText(/Results/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Test Product/i).length).toBeGreaterThan(0);
    // Check if sub-components are rendered (by checking for their specific text)
    expect(screen.getByText(/Recommended Selling Price/i)).toBeInTheDocument();
    expect(screen.getByText(/Cost Analysis/i)).toBeInTheDocument();
  });

  it('renders AnalyzePriceCard when results are provided', () => {
    renderWithProviders(
      <ResultsDisplay
        results={mockResults}
        input={mockInput}
        config={mockConfig}
        onEdit={() => {}}
      />
    );

    expect(screen.getByText(/Want a deeper look\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze My Pricing/i })).toBeInTheDocument();
  });

  it('renders business name and date in print header', () => {
    const inputWithBusiness = { ...mockInput, businessName: "Maria's Bakery" };
    renderWithProviders(
      <ResultsDisplay results={mockResults} input={inputWithBusiness} config={mockConfig} />
    );

    const businessHeading = screen.getByRole('heading', { name: /Maria's Bakery/i });
    expect(businessHeading).toBeInTheDocument();
    expect(businessHeading.closest('.print\\:block')).toHaveClass('print:block');
    expect(screen.getByText(/Product Pricing Report/i)).toBeInTheDocument();
  });

  it('calls onEdit when clicking Start Calculation in placeholder', () => {
    const onEdit = vi.fn();
    renderWithProviders(
      <ResultsDisplay results={null} input={mockInput} config={mockConfig} onEdit={onEdit} />
    );

    fireEvent.click(screen.getByText(/Explore/i));
    expect(onEdit).toHaveBeenCalled();
  });

  it('copies summary to clipboard when Copy Summary is clicked in Share menu', async () => {
    renderWithProviders(
      <ResultsDisplay results={mockResults} input={mockInput} config={mockConfig} />
    );

    // Open share menu
    fireEvent.click(screen.getByText(/Share/i));

    const copyOption = screen.getByText(/Copy/i);
    await act(async () => {
      fireEvent.click(copyOption);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(screen.getByText(/Copied/i)).toBeInTheDocument();
  });

  it('triggers print when Print Results is clicked in Share menu', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    renderWithProviders(
      <ResultsDisplay results={mockResults} input={mockInput} config={mockConfig} />
    );

    // Open share menu
    fireEvent.click(screen.getByText(/Share/i));

    fireEvent.click(screen.getByText(/Print/i));
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('opens save modal when Save Product button is clicked', () => {
    renderWithProviders(
      <ResultsDisplay results={mockResults} input={mockInput} config={mockConfig} />
    );

    const saveButton = screen.getByRole('button', { name: /save current calculation as preset/i });
    fireEvent.click(saveButton);

    expect(screen.getByText(/Save calculation/i)).toBeInTheDocument();
  });

  it('performs analysis when Analyze My Pricing is clicked', async () => {
    renderWithProviders(
      <ResultsDisplay
        results={mockResults}
        input={mockInput}
        config={mockConfig}
        presetId="test-preset"
        userId="test-user"
      />
    );

    const analyzeButton = screen.getByRole('button', { name: /Analyze My Pricing/i });
    fireEvent.click(analyzeButton);

    // Wait for analysis to complete (handles the 1200ms delay)
    expect(
      await screen.findByRole('heading', { name: /Analysis Complete/i }, { timeout: 3000 })
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/Analysis complete/i);
  });

  it('shows error toast when analysis fails', async () => {
    vi.mocked(analyticsService.trackAnalysisClick).mockRejectedValueOnce(new Error('Failed'));

    renderWithProviders(
      <ResultsDisplay
        results={mockResults}
        input={mockInput}
        config={mockConfig}
        presetId="test-preset"
        userId="test-user"
      />
    );

    const analyzeButton = screen.getByRole('button', { name: /Analyze My Pricing/i });
    fireEvent.click(analyzeButton);

    const { waitFor } = await import('@testing-library/react');
    await waitFor(() => {
      expect(screen.getByText(/Failed to perform analysis/i)).toBeInTheDocument();
    });
  });

  it('uses LLM analysis when feature flag is enabled', async () => {
    vi.mocked(shouldEnableLLM).mockResolvedValueOnce(true);
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: { recommendations: ['LLM Rec 1', 'LLM Rec 2', 'LLM Rec 3'] },
      error: null,
    } as { data: { recommendations: string[] }; error: null });

    renderWithProviders(
      <ResultsDisplay
        results={mockResults}
        input={mockInput}
        config={mockConfig}
        presetId="test-preset"
        userId="test-user"
      />
    );

    const analyzeButton = screen.getByRole('button', { name: /Analyze My Pricing/i });
    fireEvent.click(analyzeButton);

    await screen.findByRole('heading', { name: /Analysis Complete/i });

    expect(supabase.functions.invoke).toHaveBeenCalledWith('analyze-pricing', expect.any(Object));
    expect(screen.getByText(/LLM Rec 1/i)).toBeInTheDocument();
  });

  it('renders Track Competitors button and opens modal', () => {
    renderWithProviders(
      <ResultsDisplay
        results={mockResults}
        input={mockInput}
        config={mockConfig}
        onEdit={() => {}}
      />
    );

    const trackButton = screen.getByRole('button', { name: /Track Competitors/i });
    expect(trackButton).toBeInTheDocument();

    fireEvent.click(trackButton);
    expect(screen.getByText(/Market Benchmarking/i)).toBeInTheDocument();
  });

  it('shows generic "Track Competitors" when 0 competitors exist', () => {
    vi.mocked(usePresets).mockReturnValue({
      presets: [],
      getPreset: vi.fn().mockReturnValue({ id: '1', competitors: [] }),
      addPreset: vi.fn(),
      updatePreset: vi.fn(),
      deletePreset: vi.fn(),
    } as any);

    renderWithProviders(
      <ResultsDisplay
        results={mockResults}
        input={mockInput}
        config={mockConfig}
        presetId="1"
      />
    );

    expect(screen.getByText(/Add competitor prices to see if your product/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Track Competitors/i })).toBeInTheDocument();
  });

  it('shows "Track 2+ Competitors" when exactly 1 competitor exists', () => {
    vi.mocked(usePresets).mockReturnValue({
      presets: [],
      getPreset: vi.fn().mockReturnValue({
        id: '1',
        competitors: [{ id: 'c1', competitorName: 'C1', competitorPrice: 10 }],
      }),
      addPreset: vi.fn(),
      updatePreset: vi.fn(),
      deletePreset: vi.fn(),
    } as any);

    renderWithProviders(
      <ResultsDisplay
        results={mockResults}
        input={mockInput}
        config={mockConfig}
        presetId="1"
      />
    );

    expect(screen.getByText(/Add at least two competitors to see/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Track 2\+ Competitors/i })).toBeInTheDocument();
  });

  it('shows spectrum UI when 2+ competitors exist', () => {
    vi.mocked(usePresets).mockReturnValue({
      presets: [],
      getPreset: vi.fn().mockReturnValue({
        id: '1',
        competitors: [
          { id: 'c1', competitorName: 'C1', competitorPrice: 10 },
          { id: 'c2', competitorName: 'C2', competitorPrice: 50 },
        ],
      }),
      addPreset: vi.fn(),
      updatePreset: vi.fn(),
      deletePreset: vi.fn(),
    } as any);

    renderWithProviders(
      <ResultsDisplay
        results={mockResults}
        input={mockInput}
        config={mockConfig}
        presetId="1"
      />
    );

    expect(screen.getByText(/How your recommended price compares to competitors/i)).toBeInTheDocument();
    expect(screen.getByText(/Market Avg/i)).toBeInTheDocument();
    // In active state, button says "Update Data"
    expect(screen.getByRole('button', { name: /Update Data/i })).toBeInTheDocument();
  });
});
