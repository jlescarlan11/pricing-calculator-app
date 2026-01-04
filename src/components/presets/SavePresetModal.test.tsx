import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SavePresetModal } from './SavePresetModal';
import { ToastProvider } from '../shared/Toast';
import * as usePresetsHook from '../../hooks/use-presets';
import * as useSyncHook from '../../hooks/useSync';
import type { CalculationInput, PricingConfig } from '../../types/calculator';

// Mock the hooks
vi.mock('../../hooks/use-presets');
vi.mock('../../hooks/useSync');

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
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePresetsHook.usePresets).mockReturnValue({
      presets: [],
      loading: false,
      error: null,
      addPreset: mockAddPreset,
      updatePreset: vi.fn().mockResolvedValue(undefined),
      deletePreset: vi.fn().mockResolvedValue(true),
      getPreset: vi.fn(),
      getAllPresets: vi.fn(),
      syncPresets: vi.fn().mockResolvedValue(undefined),
      refresh: vi.fn().mockResolvedValue(undefined),
      syncStatus: 'synced',
    });

    vi.mocked(useSyncHook.useSync).mockReturnValue({
      isOnline: true,
      status: 'synced',
      syncToCloud: vi.fn(),
      syncFromCloud: vi.fn(),
      refreshQueueLength: vi.fn(),
      queueLength: 0,
    } as any);
  });

  it('renders correctly for single product', () => {
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
    expect(screen.getByText(/Single/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preset Name/i)).toHaveValue('Test Product');
    expect(screen.getByText(/Data Preview/i)).toBeInTheDocument();
    
    // Check calculated values in summary
    expect(screen.getByText(/₱80.00/)).toBeInTheDocument();
    expect(screen.getByText(/₱12.00/)).toBeInTheDocument();
  });

  it('renders correctly for variants', () => {
    render(
      <ToastProvider>
        <SavePresetModal
          isOpen={true}
          onClose={mockOnClose}
          presetType="variants"
          initialName="Variant Box"
          previewData={{
            batchSize: 24,
            variantsCount: 3,
            topVariants: [
              { name: 'Large', recommendedPrice: 150 },
              { name: 'Small', recommendedPrice: 75 },
            ]
          }}
        />
      </ToastProvider>
    );

    expect(screen.getByText(/^Variants$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preset Name/i)).toHaveValue('Variant Box');
    expect(screen.getByText(/3 Variations/i)).toBeInTheDocument();
    expect(screen.getByText(/24 units/i)).toBeInTheDocument();
    expect(screen.getByText(/Large/i)).toBeInTheDocument();
    expect(screen.getByText(/₱150.00/)).toBeInTheDocument();
    expect(screen.getByText(/\+ 1 more variants/i)).toBeInTheDocument();
  });

  it('shows online status correctly', () => {
    render(
      <ToastProvider>
        <SavePresetModal isOpen={true} onClose={mockOnClose} />
      </ToastProvider>
    );

    expect(screen.getByText(/Connection secure - syncing enabled/i)).toBeInTheDocument();
  });

  it('shows offline status correctly', () => {
    vi.mocked(useSyncHook.useSync).mockReturnValue({
      isOnline: false,
      status: 'offline',
    } as any);

    render(
      <ToastProvider>
        <SavePresetModal isOpen={true} onClose={mockOnClose} />
      </ToastProvider>
    );

    expect(screen.getByText(/Currently offline - saving locally/i)).toBeInTheDocument();
  });

  it('saves successfully and shows "Saved & Synced" when online', async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <SavePresetModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialName="Cloud Product"
        />
      </ToastProvider>
    );

    const saveBtn = screen.getByText(/^Save$/);
    
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // Advance by a small amount to trigger the state update after the (skipped) delay
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText(/Saved & Synced/i)).toBeInTheDocument();
    expect(screen.getByText(/Cloud Sync Active/i)).toBeInTheDocument();
    expect(mockOnSave).toHaveBeenCalledWith('Cloud Product');

    // Should auto-close after delay (2500ms in component)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(mockOnClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('saves successfully and shows "Saved Locally" when offline', async () => {
    vi.mocked(useSyncHook.useSync).mockReturnValue({
      isOnline: false,
      status: 'offline',
    } as any);

    vi.useFakeTimers();
    render(
      <ToastProvider>
        <SavePresetModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialName="Offline Product"
        />
      </ToastProvider>
    );

    const saveBtn = screen.getByText(/^Save$/);
    
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText(/Saved Locally/i)).toBeInTheDocument();
    expect(screen.getByText(/Waiting for Connection/i)).toBeInTheDocument();
    
    vi.useRealTimers();
  });

  it('handles save errors gracefully', async () => {
    mockOnSave.mockRejectedValueOnce(new Error('Network failure'));
    
    render(
      <ToastProvider>
        <SavePresetModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          initialName="Error Product"
        />
      </ToastProvider>
    );

    const saveBtn = screen.getByText(/^Save$/);
    
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(await screen.findByText(/Network failure/i)).toBeInTheDocument();
    // Input should still have the name
    expect(screen.getByLabelText(/Preset Name/i)).toHaveValue('Error Product');
    expect(screen.getByText(/^Save$/)).toBeEnabled();
  });

  it('validates name length', async () => {
    render(
      <ToastProvider>
        <SavePresetModal
          isOpen={true}
          onClose={mockOnClose}
          initialName="Ab"
        />
      </ToastProvider>
    );

    const saveBtn = screen.getByText(/^Save$/);
    fireEvent.click(saveBtn);

    expect(await screen.findByText(/Try a slightly longer name/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});