import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePresets, type Preset } from './use-presets';
import { useAuth } from './useAuth';
import { useSync } from './useSync';
import { syncService } from '../services/sync/sync.service';
import type { CalculationInput, PricingConfig } from '../types';

// Mock dependencies
vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('./useSync', () => ({
  useSync: vi.fn(),
}));

vi.mock('../services/sync/sync.service', () => ({
  syncService: {
    getLocalCache: vi.fn(),
    processQueue: vi.fn(),
  },
}));

const mockInput: CalculationInput = {
  productName: 'Test Product',
  batchSize: 10,
  ingredients: [],
  laborCost: 100,
  overhead: 50,
};

const mockConfig: PricingConfig = {
  strategy: 'markup',
  value: 50,
};

describe('usePresets', () => {
  const mockSyncFromCloud = vi.fn();
  const mockSyncToCloud = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useAuth as any).mockReturnValue({ user: { id: 'user-123' } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useSync as any).mockReturnValue({
      syncFromCloud: mockSyncFromCloud.mockResolvedValue(undefined),
      syncToCloud: mockSyncToCloud.mockResolvedValue(undefined),
      status: 'synced',
      error: null,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (syncService.getLocalCache as any).mockReturnValue([]);
  });

  it('should initialize with local cache and trigger syncFromCloud on mount', async () => {
    const cachedPresets = [
      {
        id: '1',
        name: 'Cached',
        preset_type: 'single',
        batch_size: 10,
        ingredients: [],
        labor_cost: 100,
        overhead_cost: 50,
        pricing_strategy: 'markup',
        pricing_value: 50,
        updated_at: new Date().toISOString(),
      }
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (syncService.getLocalCache as any).mockReturnValue(cachedPresets);

    const { result } = renderHook(() => usePresets());

    // Initial state from cache (synchronous via lazy initializer)
    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe('Cached');

    // Wait for the async loadPresets to finish
    await waitFor(() => {
      expect(mockSyncFromCloud).toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });
  });

  it('should add a preset optimistically and call syncToCloud', async () => {
    const { result } = renderHook(() => usePresets());
    
    // Wait for initial load to finish
    await waitFor(() => expect(result.current.loading).toBe(false));

    let addedPreset: Preset | undefined;
    await act(async () => {
      addedPreset = await result.current.addPreset({
        name: 'New Product',
        input: mockInput,
        config: mockConfig,
      });
    });

    // Optimistic update
    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe('New Product');
    
    // Verify sync call
    expect(mockSyncToCloud).toHaveBeenCalledWith(
      'create',
      expect.any(String),
      expect.objectContaining({
        name: 'New Product',
        preset_type: 'single',
      })
    );

    if (!addedPreset) throw new Error('addedPreset is undefined');
    expect(addedPreset.id).toBe(result.current.presets[0].id);
  });

  it('should update a preset optimistically and call syncToCloud', async () => {
    // Start with one preset
    const initialPreset = {
      id: 'p1',
      name: 'Old Name',
      preset_type: 'single',
      batch_size: 10,
      ingredients: [],
      labor_cost: 100,
      overhead_cost: 50,
      pricing_strategy: 'markup',
      pricing_value: 50,
      updated_at: new Date().toISOString(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (syncService.getLocalCache as any).mockReturnValue([initialPreset]);

    const { result } = renderHook(() => usePresets());
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    await act(async () => {
      await result.current.updatePreset('p1', { name: 'New Name' });
    });

    // Optimistic update
    expect(result.current.presets[0].name).toBe('New Name');

    // Verify sync call
    expect(mockSyncToCloud).toHaveBeenCalledWith(
      'update',
      'p1',
      expect.objectContaining({
        name: 'New Name',
      })
    );
  });

  it('should delete a preset optimistically and call syncToCloud', async () => {
    const initialPreset = {
      id: 'p1',
      name: 'To Delete',
      preset_type: 'single',
      batch_size: 10,
      ingredients: [],
      labor_cost: 100,
      overhead_cost: 50,
      pricing_strategy: 'markup',
      pricing_value: 50,
      updated_at: new Date().toISOString(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (syncService.getLocalCache as any).mockReturnValue([initialPreset]);

    const { result } = renderHook(() => usePresets());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.presets).toHaveLength(1);

    await act(async () => {
      await result.current.deletePreset('p1');
    });

    // Optimistic delete
    expect(result.current.presets).toHaveLength(0);

    // Verify sync call
    expect(mockSyncToCloud).toHaveBeenCalledWith('delete', 'p1');
  });

  it('should reflect loading state from useSync', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useSync as any).mockReturnValue({
      syncFromCloud: vi.fn().mockResolvedValue(undefined),
      syncToCloud: vi.fn().mockResolvedValue(undefined),
      status: 'syncing',
      error: null,
    });

    const { result } = renderHook(() => usePresets());
    expect(result.current.loading).toBe(true);
  });

  it('should reflect error state from useSync', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useSync as any).mockReturnValue({
      syncFromCloud: vi.fn().mockResolvedValue(undefined),
      syncToCloud: vi.fn().mockResolvedValue(undefined),
      status: 'error',
      error: 'Cloud sync failed',
    });

    const { result } = renderHook(() => usePresets());
    expect(result.current.error).toBe('Cloud sync failed');
  });

  it('should handle manual syncPresets call', async () => {
    const { result } = renderHook(() => usePresets());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.syncPresets();
    });

    expect(syncService.processQueue).toHaveBeenCalled();
    expect(mockSyncFromCloud).toHaveBeenCalledTimes(2); // One on mount, one in syncPresets
  });

  it('should refresh presets from cache after manual refresh', async () => {
    const { result } = renderHook(() => usePresets());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Setup: cache will change
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (syncService.getLocalCache as any).mockReturnValue([
      { id: 'new-id', name: 'Refreshed Product', preset_type: 'single', updated_at: '2026-01-04T12:00:00Z' }
    ]);

    await act(async () => {
      await result.current.refresh();
    });

    // Should have refreshed from cache
    expect(result.current.presets[0].name).toBe('Refreshed Product');
    expect(result.current.presets[0].id).toBe('new-id');
  });
});