import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SavePresetModal } from './SavePresetModal';
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
    });
  });

  it('renders correctly when open', () => {
    render(
      <SavePresetModal
        isOpen={true}
        onClose={mockOnClose}
        input={mockInput}
        config={mockConfig}
      />
    );

    expect(screen.getByText(/Save to Presets/i)).toBeInTheDocument();
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
      <SavePresetModal
        isOpen={true}
        onClose={mockOnClose}
        input={{ ...mockInput, productName: '' }}
        config={mockConfig}
      />
    );

    const input = screen.getByLabelText(/Product Name/i);
    fireEvent.change(input, { target: { value: 'Ab' } });

    const saveBtn = screen.getByText(/Save Product/i);
    fireEvent.click(saveBtn);

    expect(await screen.findByText(/Name must be at least 3 characters/i)).toBeInTheDocument();
    expect(mockAddPreset).not.toHaveBeenCalled();
  });

  it('validates name length (too long)', async () => {
    render(
      <SavePresetModal
        isOpen={true}
        onClose={mockOnClose}
        input={{ ...mockInput, productName: '' }}
        config={mockConfig}
      />
    );

    const input = screen.getByLabelText(/Product Name/i);
    fireEvent.change(input, { target: { value: 'a'.repeat(51) } });

    const saveBtn = screen.getByText(/Save Product/i);
    fireEvent.click(saveBtn);

    expect(await screen.findByText(/Name must be less than 50 characters/i)).toBeInTheDocument();
    expect(mockAddPreset).not.toHaveBeenCalled();
  });

  it('validates duplicate names', async () => {
    vi.mocked(usePresetsHook.usePresets).mockReturnValue({
      presets: [{ id: '1', name: 'Existing Product', input: mockInput, config: mockConfig, lastModified: Date.now() }],
      addPreset: mockAddPreset,
      updatePreset: vi.fn(),
      deletePreset: vi.fn(),
      getPreset: vi.fn(),
      getAllPresets: vi.fn(),
    });

    render(
      <SavePresetModal
        isOpen={true}
        onClose={mockOnClose}
        input={{ ...mockInput, productName: 'Existing Product' }}
        config={mockConfig}
      />
    );

    const saveBtn = screen.getByText(/Save Product/i);
    fireEvent.click(saveBtn);

    expect(await screen.findByText(/already exists in your presets/i)).toBeInTheDocument();
    expect(mockAddPreset).not.toHaveBeenCalled();
  });

  it('saves successfully and shows success message', async () => {
    vi.useFakeTimers();
    render(
      <SavePresetModal
        isOpen={true}
        onClose={mockOnClose}
        input={mockInput}
        config={mockConfig}
      />
    );

    const saveBtn = screen.getByText(/Save Product/i);
    
    // We need to wrap the click and the advancement of timers in act
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // Advance by a small amount to trigger the state update after the (skipped) delay
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText(/Saved Successfully/i)).toBeInTheDocument();

    expect(mockAddPreset).toHaveBeenCalledWith({
      name: 'Test Product',
      input: mockInput,
      config: mockConfig,
    });

    // Should auto-close after delay (1800ms in component)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    expect(mockOnClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('calls onClose when Cancel is clicked', () => {
    render(
      <SavePresetModal
        isOpen={true}
        onClose={mockOnClose}
        input={mockInput}
        config={mockConfig}
      />
    );

    const cancelBtn = screen.getByText(/Cancel/i);
    fireEvent.click(cancelBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('resets state when reopened', async () => {
    const { rerender } = render(
      <SavePresetModal
        isOpen={false}
        onClose={mockOnClose}
        input={mockInput}
        config={mockConfig}
      />
    );

    rerender(
      <SavePresetModal
        isOpen={true}
        onClose={mockOnClose}
        input={{ ...mockInput, productName: 'New Name' }}
        config={mockConfig}
      />
    );

    expect(screen.getByLabelText(/Product Name/i)).toHaveValue('New Name');
  });
});