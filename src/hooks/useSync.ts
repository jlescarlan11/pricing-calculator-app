import { useState, useEffect, useCallback, useRef } from 'react';
import { syncService } from '../services/sync/sync.service';
import { offlineQueue } from '../lib/offline-queue/offline-queue';
import type { SyncState, SyncStatus } from '../types/sync';

/**
 * Orchestrates client-side synchronization state and interactions.
 * Provides a unified interface for syncing presets and monitoring health.
 */
export function useSync() {
  const [state, setState] = useState<SyncState>({
    status: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced',
    lastSyncedAt: null,
    queueLength: 0,
    error: undefined,
  });

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  /**
   * Updates the sync status and optional error state.
   */
  const updateStatus = useCallback((status: SyncStatus, error?: string) => {
    if (!isMounted.current) return;
    setState((prev) => ({
      ...prev,
      status,
      error: error || (status === 'error' ? prev.error : undefined),
      lastSyncedAt: status === 'synced' ? Date.now() : prev.lastSyncedAt,
      activeOperation: status === 'syncing' ? prev.activeOperation : undefined,
    }));
  }, []);

  /**
   * Refreshes the current offline queue length.
   */
  const refreshQueueLength = useCallback(async () => {
    try {
      const count = await offlineQueue.getCount();
      if (isMounted.current) {
        setState((prev) => ({ ...prev, queueLength: count }));
      }
    } catch (err) {
      console.error('[useSync] Failed to refresh queue length:', err);
    }
  }, []);

  /**
   * Pulls the latest data from the cloud.
   */
  const syncFromCloud = useCallback(async () => {
    if (!navigator.onLine) {
      updateStatus('offline');
      return;
    }

    if (isMounted.current) {
      setState(prev => ({ ...prev, status: 'syncing', activeOperation: 'Pulling from cloud' }));
    }

    try {
      await syncService.pullFromCloud();
      updateStatus('synced');
      await refreshQueueLength();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cloud pull failed';
      updateStatus('error', message);
    }
  }, [updateStatus, refreshQueueLength]);

  /**
   * Pushes a change to the cloud (or enqueues it if offline).
   * Implements debouncing to prevent redundant calls.
   */
  const syncToCloud = useCallback(
    async (type: 'create' | 'update' | 'delete', id: string, payload?: any) => {
      // Optimistic update: we assume it will eventually sync
      if (isMounted.current) {
        setState(prev => ({ 
          ...prev, 
          status: 'syncing', 
          activeOperation: `${type.charAt(0).toUpperCase() + type.slice(1)} ${id}` 
        }));
      }

      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      return new Promise<void>((resolve, reject) => {
        syncTimeoutRef.current = setTimeout(async () => {
          try {
            await syncService.syncToCloud(type, id, payload);
            if (navigator.onLine) {
              updateStatus('synced');
            } else {
              updateStatus('offline');
            }
            await refreshQueueLength();
            resolve();
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Cloud sync failed';
            updateStatus('error', message);
            reject(err);
          }
        }, 500); // 500ms debounce
      });
    },
    [updateStatus, refreshQueueLength]
  );

  // Initial mount behavior & listeners
  useEffect(() => {
    isMounted.current = true;
    
    // Trigger initial pull
    syncFromCloud();

    const handleOnline = () => {
      setIsOnline(true);
      updateStatus('syncing');
      syncService.processQueue().then(() => {
        syncFromCloud();
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateStatus('offline');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    // Polling interval for queue length
    const intervalId = setInterval(refreshQueueLength, 5000);

    return () => {
      isMounted.current = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      clearInterval(intervalId);
    };
  }, [syncFromCloud, updateStatus, refreshQueueLength]);

  return {
    ...state,
    isOnline,
    syncToCloud,
    syncFromCloud,
    refreshQueueLength,
  };
}