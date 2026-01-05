import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SavePresetModal } from './SavePresetModal';
import { ToastProvider } from '../shared/Toast';
import * as usePresetsHook from '../../hooks/use-presets';
import type { CalculationInput, PricingConfig } from '../../types/calculator';

// Mock the usePresets hook
vi.mock('../../hooks/use-presets');

const mockInput: CalculationInput = {
  productName: 'Test Product',
  batchSize: 10,
  ingredients: [
    { id: '1', name: 'Ingredient 1', amount: 100, cost: 50 },
  ],
  laborCost: 20,
  overhead: 10,
};

const mockConfig: PricingConfig = {
  strategy: 'markup',
  value: 50,
};

describe('SavePresetModal', () => {
  const mockOnClose = vi.fn();
  const mockAddPreset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePresetsHook.usePresets).mockReturnValue({
      presets: [],
      addPreset: mockAddPreset,
      updatePreset: vi.fn(),
      deletePreset: vi.fn(),
      getPreset: vi.fn(),
      getAllPresets: vi.fn(),
      syncStatus: 'synced',
      error: null,
      refresh: vi.fn(),
    });
  });

  it('renders correctly when open', () => {
    render(
      <ToastProvider>
        <SavePresetModal
          isOpen={true}
          onClose={mockOnClose}
          input={mockInput}
          config={mockConfig}
        />
      </ToastProvider>
    );

    expect(screen.getByText(/Save calculation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Name/i)).toHaveValue('Test Product');
    expect(screen.getByText(/Calculation Summary/i)).toBeInTheDocument();
    
    // Check calculated values in summary
    // Total cost = 50 + 20 + 10 = 80
    // Recommended Price (50% markup on 80/10=8) = 8 * 1.5 = 12
    expect(screen.getByText(/₱80.00/)).toBeInTheDocument();
    expect(screen.getByText(/₱12.00/)).toBeInTheDocument();
  });

  it('validates name length (too short)', async () => {
    render(
      <ToastProvider>
        <SavePresetModal
          isOpen={true}
          onClose={mockOnClose}
          input={{ ...mockInput, productName: '' }}
          config={mockConfig}
        />
      </ToastProvider>
    );

    const input = screen.getByLabelText(/Product Name/i);
    fireEvent.change(input, { target: { value: 'Ab' } });

    const saveBtn = screen.getByText(/^Save$/);
    fireEvent.click(saveBtn);

    expect(await screen.findByText(/Try a slightly longer name/i)).toBeInTheDocument();
    expect(mockAddPreset).not.toHaveBeenCalled();
  });

  it('validates name length (too long)', async () => {
    render(
      <ToastProvider>
        <SavePresetModal
          isOpen={true}
          onClose={mockOnClose}
          input={{ ...mockInput, productName: '' }}
          config={mockConfig}
        />
      </ToastProvider>
    );

    const input = screen.getByLabelText(/Product Name/i);
    fireEvent.change(input, { target: { value: 'a'.repeat(51) } });

    const saveBtn = screen.getByText(/^Save$/);
    fireEvent.click(saveBtn);

    expect(await screen.findByText(/Try a shorter name/i)).toBeInTheDocument();
    expect(mockAddPreset).not.toHaveBeenCalled();
  });

  it('validates duplicate names', async () => {
    vi.mocked(usePresetsHook.usePresets).mockReturnValue({
      presets: [{ 
        id: '1', 
        name: 'Existing Product', 
        baseRecipe: mockInput, 
        pricingConfig: mockConfig, 
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        presetType: 'default',
        variants: []
      }],
      addPreset: mockAddPreset,
      updatePreset: vi.fn(),
      deletePreset: vi.fn(),
      getPreset: vi.fn(),
      getAllPresets: vi.fn(),
      syncStatus: 'synced',
      error: null,
      refresh: vi.fn()
    });

    render(
      <ToastProvider>
        <SavePresetModal
          isOpen={true}
          onClose={mockOnClose}
          input={{ ...mockInput, productName: 'Existing Product' }}
          config={mockConfig}
        />
      </ToastProvider>
    );

    const saveBtn = screen.getByText(/^Save$/);
    fireEvent.click(saveBtn);

    expect(await screen.findByText(/already have a product with this name/i)).toBeInTheDocument();
    expect(mockAddPreset).not.toHaveBeenCalled();
  });

  it('saves successfully and shows success message', async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <SavePresetModal
          isOpen={true}
          onClose={mockOnClose}
          input={mockInput}
          config={mockConfig}
        />
      </ToastProvider>
    );

    const saveBtn = screen.getByText(/^Save$/);
    
    // We need to wrap the click and the advancement of timers in act
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // Advance by a small amount to trigger the state update after the (skipped) delay
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText(/^Saved$/)).toBeInTheDocument();
    expect(screen.getByText(/Preset saved/i)).toBeInTheDocument();

    expect(mockAddPreset).toHaveBeenCalledWith({
      name: 'Test Product',
      baseRecipe: mockInput,
      pricingConfig: mockConfig,
      presetType: 'default',
      variants: []
    });

    // Should auto-close after delay (1800ms in component)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    expect(mockOnClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('calls onClose when Back is clicked', () => {
    render(
      <ToastProvider>
        <SavePresetModal
          isOpen={true}
          onClose={mockOnClose}
          input={mockInput}
          config={mockConfig}
        />
      </ToastProvider>
    );

    const backBtn = screen.getByText(/Back/i);
    fireEvent.click(backBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('resets state when reopened', async () => {
    const { rerender } = render(
      <ToastProvider>
        <SavePresetModal
          isOpen={false}
          onClose={mockOnClose}
          input={mockInput}
          config={mockConfig}
        />
      </ToastProvider>
    );

    rerender(
      <ToastProvider>
        <SavePresetModal
          isOpen={true}
          onClose={mockOnClose}
          input={{ ...mockInput, productName: 'New Name' }}
          config={mockConfig}
        />
      </ToastProvider>
    );

    expect(screen.getByLabelText(/Product Name/i)).toHaveValue('New Name');
  });
});