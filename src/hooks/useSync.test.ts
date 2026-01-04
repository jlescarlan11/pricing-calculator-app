import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSync } from './useSync';
import { syncService } from '../services/sync/sync.service';
import { offlineQueue } from '../lib/offline-queue/offline-queue';

// Mock services
vi.mock('../services/sync/sync.service', () => ({
  syncService: {
    pullFromCloud: vi.fn(),
    syncToCloud: vi.fn(),
    processQueue: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../lib/offline-queue/offline-queue', () => ({
  offlineQueue: {
    getCount: vi.fn().mockResolvedValue(0),
  },
}));

describe('useSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Default to online
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize and trigger initial cloud pull on mount', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (syncService.pullFromCloud as any).mockResolvedValue([]);
    
    const { result } = renderHook(() => useSync());

    // Should immediately call syncFromCloud which sets status to syncing
    expect(result.current.status).toBe('syncing');
    
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(syncService.pullFromCloud).toHaveBeenCalled();
    expect(result.current.status).toBe('synced');
    expect(result.current.lastSyncedAt).not.toBeNull();
  });

  it('should handle offline status on mount', async () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      configurable: true,
    });

    const { result } = renderHook(() => useSync());

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.status).toBe('offline');
    expect(result.current.isOnline).toBe(false);
    expect(syncService.pullFromCloud).not.toHaveBeenCalled();
  });

  it('should respond to online/offline events', async () => {
    const { result } = renderHook(() => useSync());

    // Wait for initial mount sync to complete
    await act(async () => { await vi.runOnlyPendingTimersAsync(); });

    // Transition to offline
    await act(async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.status).toBe('offline');

    // Transition back to online
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolveQueue: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (syncService.processQueue as any).mockReturnValue(new Promise(resolve => { resolveQueue = resolve; }));

    await act(async () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.status).toBe('syncing');

    await act(async () => {
      resolveQueue();
      await vi.runOnlyPendingTimersAsync();
    });

    expect(syncService.processQueue).toHaveBeenCalled();
    expect(syncService.pullFromCloud).toHaveBeenCalled();
    expect(result.current.status).toBe('synced');
  });

  it('should debounce syncToCloud calls', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (syncService.syncToCloud as any).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSync());
    
    // Wait for initial mount sync to complete
    await act(async () => { await vi.runOnlyPendingTimersAsync(); });

    await act(async () => {
      result.current.syncToCloud('create', '123', { name: 'Test' });
    });

    // Should not have called service yet due to debounce
    expect(syncService.syncToCloud).not.toHaveBeenCalled();
    expect(result.current.status).toBe('syncing');

    // Advance timers
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(syncService.syncToCloud).toHaveBeenCalledWith('create', '123', { name: 'Test' });
    expect(result.current.status).toBe('synced');
  });

  it('should handle sync errors gracefully', async () => {
    const errorMessage = 'Network Failure';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (syncService.pullFromCloud as any).mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useSync());

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(errorMessage);
  });

  it('should poll for queue length updates', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (offlineQueue.getCount as any).mockResolvedValue(0);
    const { result } = renderHook(() => useSync());
    
    // Wait for initial mount sync to complete
    await act(async () => { await vi.runOnlyPendingTimersAsync(); });

    expect(result.current.queueLength).toBe(0);

    // Update mock for next poll
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (offlineQueue.getCount as any).mockResolvedValue(5);

    // Advance timers by 5 seconds
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(result.current.queueLength).toBe(5);
  });

  it('should clean up listeners and intervals on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() => useSync());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('should provide optimistic updates during syncToCloud', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolveSync: any;
    const syncPromise = new Promise(resolve => { resolveSync = resolve; });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (syncService.syncToCloud as any).mockReturnValue(syncPromise);
    
    const { result } = renderHook(() => useSync());
    
    // Wait for initial mount sync to complete
    await act(async () => { await vi.runOnlyPendingTimersAsync(); });

    act(() => {
      result.current.syncToCloud('update', '123', { price: 10 });
    });

    // Status should be syncing immediately (optimistic)
    expect(result.current.status).toBe('syncing');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500); // Trigger debounce
    });

    expect(syncService.syncToCloud).toHaveBeenCalled();
    expect(result.current.status).toBe('syncing'); // Still syncing while promise is pending
    
    await act(async () => {
      resolveSync();
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.status).toBe('synced');
  });
});