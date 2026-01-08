import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePresets } from './use-presets';
import { PresetsProvider } from '../context/PresetsContext';
import { presetService } from '../services/presetService';
import { useAuth } from '../context/AuthContext';
import type { Preset } from '../types';

vi.mock('../services/presetService');
vi.mock('../context/AuthContext');

const mockPreset: Preset = {
  id: '1',
  name: 'Test Preset',
  presetType: 'default',
  baseRecipe: { productName: 'P1', batchSize: 1, ingredients: [], laborCost: 0, overhead: 0 },
  pricingConfig: { strategy: 'markup', value: 50 },
  variants: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'user-1',
};

// Wrapper with provider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PresetsProvider>{children}</PresetsProvider>
);

describe('usePresets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({ user: { id: 'user-1' } });
    (presetService.fetchPresets as Mock).mockResolvedValue([]);
    (presetService.savePreset as Mock).mockImplementation(async (p) => p);
    (presetService.createSnapshot as Mock).mockResolvedValue(null);
    (presetService.deletePreset as Mock).mockResolvedValue(undefined);
    (presetService.syncPendingItems as Mock).mockResolvedValue(undefined);
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      configurable: true,
      writable: true,
    });
  });

  it('should fetch presets on mount', async () => {
    (presetService.fetchPresets as Mock).mockResolvedValue([mockPreset]);

    const { result } = renderHook(() => usePresets(), { wrapper });

    // Initial state might be syncing or synced depending on how fast the promise resolves or if we check immediately
    // In strict mode, effects run twice.

    await waitFor(() => {
      expect(result.current.presets).toHaveLength(1);
    });

    expect(presetService.fetchPresets).toHaveBeenCalledWith('user-1');
    expect(result.current.syncStatus).toBe('synced');
  });

  it('should add a preset optimistically', async () => {
    const { result } = renderHook(() => usePresets(), { wrapper });

    await waitFor(() => expect(result.current.syncStatus).toBe('synced'));

    let newPresetPromise: Promise<Preset>;
    act(() => {
      newPresetPromise = result.current.addPreset({
        name: 'New Preset',
        baseRecipe: mockPreset.baseRecipe,
        pricingConfig: mockPreset.pricingConfig,
        presetType: 'default',
        variants: [],
      });
    });

    // Optimistic update
    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe('New Preset');
    // Status should be syncing
    expect(result.current.syncStatus).toBe('syncing');

    await act(async () => {
      await newPresetPromise;
    });

    expect(presetService.savePreset).toHaveBeenCalled();
    expect(result.current.syncStatus).toBe('synced');
  });

  it('should automatically create a version 1 snapshot when adding a new preset', async () => {
    (presetService.createSnapshot as Mock).mockImplementation(async (id) => ({
      ...mockPreset,
      id: 'snap-1',
      isSnapshot: true,
      snapshotMetadata: {
        versionNumber: 1,
        parentPresetId: id,
        isTrackedVersion: true,
        snapshotDate: new Date().toISOString(),
      },
    }));

    const { result } = renderHook(() => usePresets(), { wrapper });

    await waitFor(() => expect(result.current.syncStatus).toBe('synced'));

    await act(async () => {
      await result.current.addPreset({
        name: 'New Preset',
        baseRecipe: mockPreset.baseRecipe,
        pricingConfig: mockPreset.pricingConfig,
        presetType: 'default',
        variants: [],
      });
    });

    expect(presetService.savePreset).toHaveBeenCalled();
    expect(presetService.createSnapshot).toHaveBeenCalled();
  });

  it('should delete a preset optimistically', async () => {
    (presetService.fetchPresets as Mock).mockResolvedValue([mockPreset]);
    const { result } = renderHook(() => usePresets(), { wrapper });

    await waitFor(() => expect(result.current.presets).toHaveLength(1));

    act(() => {
      result.current.deletePreset(mockPreset.id);
    });

    expect(result.current.presets).toHaveLength(0);
    expect(result.current.syncStatus).toBe('syncing');

    await waitFor(() => expect(result.current.syncStatus).toBe('synced'));
    expect(presetService.deletePreset).toHaveBeenCalledWith(mockPreset.id, 'user-1');
  });

  it('should handle offline status', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    const { result } = renderHook(() => usePresets(), { wrapper });

    await waitFor(() => {
      expect(result.current.syncStatus).toBe('offline');
    });
  });
});
