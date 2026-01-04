import { useCallback, useEffect, useState } from 'react';
import { useSessionStorage } from './use-session-storage';
import { useAuth } from './useAuth';
import { presetsService } from '../services/presets';
import type { SavedPreset } from '../types';

const PRESETS_STORAGE_KEY = 'pricing_calculator_presets';

/**
 * Custom hook for managing saved calculation presets.
 * Supports both local session storage and Supabase cloud sync.
 */
export function usePresets() {
  const { user } = useAuth();
  const [localPresets, setLocalPresets] = useSessionStorage<SavedPreset[]>(PRESETS_STORAGE_KEY, []);
  const [cloudPresets, setCloudPresets] = useState<SavedPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine which source to use
  const presets = user ? cloudPresets : localPresets;

  /**
   * Fetch presets from cloud
   */
  const fetchCloudPresets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await presetsService.getPresets();
      setCloudPresets(data);
    } catch (err) {
      console.error('Failed to fetch cloud presets:', err);
      setError('Could not load your saved products from the cloud.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load cloud presets when user logs in
  useEffect(() => {
    if (user) {
      fetchCloudPresets();
    } else {
      setCloudPresets([]);
    }
  }, [user, fetchCloudPresets]);

  /**
   * Adds a new preset.
   */
  const addPreset = useCallback(async (presetData: Omit<SavedPreset, 'id' | 'lastModified'>) => {
    try {
      const newPreset: SavedPreset = {
        ...presetData,
        id: crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).substring(2),
        lastModified: Date.now(),
      };

      if (user) {
        const saved = await presetsService.savePreset(newPreset);
        setCloudPresets(prev => [saved, ...prev]);
        return saved;
      } else {
        setLocalPresets(prev => [newPreset, ...prev]);
        return newPreset;
      }
    } catch (error) {
      console.error('Failed to add preset:', error);
      throw new Error('Could not save preset. Please try again.');
    }
  }, [user, setLocalPresets]);

  /**
   * Updates an existing preset.
   */
  const updatePreset = useCallback(async (id: string, updates: Partial<Omit<SavedPreset, 'id' | 'lastModified'>>) => {
    try {
      const existing = presets.find(p => p.id === id);
      if (!existing) return;

      const updatedPreset: SavedPreset = {
        ...existing,
        ...updates,
        lastModified: Date.now(),
      };

      if (user) {
        const saved = await presetsService.savePreset(updatedPreset);
        setCloudPresets(prev => prev.map(p => p.id === id ? saved : p));
      } else {
        setLocalPresets(prev => prev.map(p => p.id === id ? updatedPreset : p));
      }
    } catch (error) {
      console.error('Failed to update preset:', error);
      throw new Error('Could not update preset. Please try again.');
    }
  }, [user, presets, setLocalPresets]);

  /**
   * Deletes a preset.
   */
  const deletePreset = useCallback(async (id: string) => {
    try {
      if (user) {
        await presetsService.deletePreset(id);
        setCloudPresets(prev => prev.filter(p => p.id !== id));
      } else {
        setLocalPresets(prev => prev.filter(p => p.id !== id));
      }
      return true;
    } catch (error) {
      console.error('Failed to delete preset:', error);
      throw new Error('Could not delete preset. Please try again.');
    }
  }, [user, setLocalPresets]);

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
   * Syncs local presets to the cloud.
   */
  const syncPresets = useCallback(async () => {
    if (!user || localPresets.length === 0) return;
    
    setLoading(true);
    try {
      // Simple strategy: Upload all local presets to cloud
      // (Could be improved with collision detection)
      for (const preset of localPresets) {
        await presetsService.savePreset(preset);
      }
      // After sync, clear local storage or leave as backup?
      // Clearing prevents double sync if logout/login occurs.
      setLocalPresets([]);
      await fetchCloudPresets();
    } catch (err) {
      console.error('Sync failed:', err);
      setError('Some items could not be synced to the cloud.');
    } finally {
      setLoading(false);
    }
  }, [user, localPresets, setLocalPresets, fetchCloudPresets]);

  return {
    presets,
    loading,
    error,
    addPreset,
    updatePreset,
    deletePreset,
    getPreset,
    getAllPresets,
    syncPresets,
    refresh: fetchCloudPresets,
  };
}