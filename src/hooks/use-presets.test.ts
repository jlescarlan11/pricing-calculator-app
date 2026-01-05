import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePresets } from './use-presets';
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
  userId: 'user-1'
};

describe('usePresets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({ user: { id: 'user-1' } });
    (presetService.fetchPresets as Mock).mockResolvedValue([]);
    (presetService.savePreset as Mock).mockImplementation(async (p) => p);
    (presetService.deletePreset as Mock).mockResolvedValue(undefined);
    (presetService.syncPendingItems as Mock).mockResolvedValue(undefined);
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
        value: true,
        configurable: true,
        writable: true
    });
  });

  it('should fetch presets on mount', async () => {
    (presetService.fetchPresets as Mock).mockResolvedValue([mockPreset]);
    
    const { result } = renderHook(() => usePresets());
    
    // Initial state might be syncing or synced depending on how fast the promise resolves or if we check immediately
    // In strict mode, effects run twice.
    
    await waitFor(() => {
        expect(result.current.presets).toHaveLength(1);
    });
    
    expect(presetService.fetchPresets).toHaveBeenCalledWith('user-1');
    expect(result.current.syncStatus).toBe('synced');
  });

  it('should add a preset optimistically', async () => {
    const { result } = renderHook(() => usePresets());
    
    await waitFor(() => expect(result.current.syncStatus).toBe('synced'));

    let newPresetPromise: Promise<Preset>;
    act(() => {
      newPresetPromise = result.current.addPreset({
        name: 'New Preset',
        baseRecipe: mockPreset.baseRecipe,
        pricingConfig: mockPreset.pricingConfig,
        presetType: 'default',
        variants: []
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

  it('should delete a preset optimistically', async () => {
    (presetService.fetchPresets as Mock).mockResolvedValue([mockPreset]);
    const { result } = renderHook(() => usePresets());
    
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
    
    const { result } = renderHook(() => usePresets());
    
    await waitFor(() => {
       expect(result.current.syncStatus).toBe('offline'); 
    });
  });
});