import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useSync } from './useSync';
import { syncService } from '../services/sync/sync.service';
import { mapDbToPreset, mapPresetToDbInsert, mapPresetToDbUpdate } from '../services/presets';
import type { SavedPreset } from '../types';

/**
 * Custom hook for managing saved calculation presets.
 * Supports cloud synchronization with offline-first behavior using the sync layer.
 */
export function usePresets() {
  const { user } = useAuth();
  const { syncFromCloud, syncToCloud, status, error: syncError } = useSync();
  const [presets, setPresets] = useState<SavedPreset[]>(() => 
    syncService.getLocalCache().map(mapDbToPreset)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads presets from the cloud and updates local state.
   * Falls back to local cache if offline or sync fails.
   */
  const loadPresets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await syncFromCloud();
      setPresets(syncService.getLocalCache().map(mapDbToPreset));
    } catch (err) {
      console.error('[usePresets] Load failed:', err);
      setError(err instanceof Error ? err.message : 'Could not synchronize with cloud.');
      // State is already initialized from cache, so we don't need to do anything else
    } finally {
      setIsLoading(false);
    }
  }, [syncFromCloud]);

  // Load presets on mount or when user changes
  useEffect(() => {
    loadPresets();
  }, [user, loadPresets]);

  /**
   * Adds a new preset with optimistic updates.
   */
  const addPreset = useCallback(async (presetData: Omit<SavedPreset, 'id' | 'lastModified'>) => {
    const id = crypto.randomUUID?.() || Math.random().toString(36).substring(2);
    const now = new Date().toISOString();
    const newPreset: SavedPreset = {
      ...presetData,
      id,
      lastModified: Date.now(),
      created_at: now,
    };

    // Optimistic Update
    setPresets(prev => [newPreset, ...prev]);

    try {
      const dbInsert = mapPresetToDbInsert(newPreset);
      await syncToCloud('create', id, dbInsert);
      return newPreset;
    } catch (err) {
      console.error('[usePresets] Add failed:', err);
      // We don't revert here as the operation is likely queued in the offline queue
      // and will eventually sync.
      throw err;
    }
  }, [syncToCloud]);

  /**
   * Updates an existing preset with optimistic updates.
   */
  const updatePreset = useCallback(async (id: string, updates: Partial<Omit<SavedPreset, 'id' | 'lastModified'>>) => {
    const existing = presets.find(p => p.id === id);
    if (!existing) return;

    const updatedPreset: SavedPreset = {
      ...existing,
      ...updates,
      lastModified: Date.now(),
    };

    // Optimistic Update
    setPresets(prev => prev.map(p => p.id === id ? updatedPreset : p));

    try {
      const dbUpdate = mapPresetToDbUpdate(updatedPreset);
      await syncToCloud('update', id, dbUpdate);
    } catch (err) {
      console.error('[usePresets] Update failed:', err);
      throw err;
    }
  }, [presets, syncToCloud]);

  /**
   * Deletes a preset with optimistic updates.
   */
  const deletePreset = useCallback(async (id: string) => {
    // Optimistic Update
    setPresets(prev => prev.filter(p => p.id !== id));

    try {
      await syncToCloud('delete', id);
      return true;
    } catch (err) {
      console.error('[usePresets] Delete failed:', err);
      throw err;
    }
  }, [syncToCloud]);

  /**
   * Retrieves a specific preset by ID.
   */
  const getPreset = useCallback((id: string) => {
    return presets.find(p => p.id === id);
  }, [presets]);

  /**
   * Returns all saved presets.
   */
  const getAllPresets = useCallback(() => {
    return presets;
  }, [presets]);

  /**
   * Triggers a manual synchronization of the offline queue and pulls latest data.
   */
  const syncPresets = useCallback(async () => {
    setIsLoading(true);
    try {
      await syncService.processQueue();
      await syncFromCloud();
      setPresets(syncService.getLocalCache().map(mapDbToPreset));
    } catch (err) {
      console.error('[usePresets] Sync failed:', err);
      setError('Some changes could not be synced.');
    } finally {
      setIsLoading(false);
    }
  }, [syncFromCloud]);

  return {
    presets,
    loading: isLoading || status === 'syncing',
    error: error || (status === 'error' ? syncError : null),
    addPreset,
    updatePreset,
    deletePreset,
    getPreset,
    getAllPresets,
    syncPresets,
    refresh: loadPresets,
    syncStatus: status,
  };
}