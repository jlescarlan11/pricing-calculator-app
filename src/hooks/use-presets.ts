import { useCallback } from 'react';
import { useSessionStorage } from './use-session-storage';
import type { SavedPreset } from '../types';

const PRESETS_STORAGE_KEY = 'pricing_calculator_presets';

/**
 * Custom hook for managing saved calculation presets.
 * Persists presets in sessionStorage.
 */
export function usePresets() {
  const [presets, setPresets] = useSessionStorage<SavedPreset[]>(PRESETS_STORAGE_KEY, []);

  /**
   * Adds a new preset to the list.
   * Generates a unique ID and sets the lastModified timestamp.
   */
  const addPreset = useCallback((presetData: Omit<SavedPreset, 'id' | 'lastModified'>) => {
    try {
      const newPreset: SavedPreset = {
        ...presetData,
        id: crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).substring(2),
        lastModified: Date.now(),
      };
      setPresets(prev => [...prev, newPreset]);
      return newPreset;
    } catch (error) {
      console.error('Failed to add preset:', error);
      throw new Error('Could not save preset. Please try again.');
    }
  }, [setPresets]);

  /**
   * Updates an existing preset by ID.
   * Refreshes the lastModified timestamp.
   */
  const updatePreset = useCallback((id: string, updates: Partial<Omit<SavedPreset, 'id' | 'lastModified'>>) => {
    try {
      setPresets(prev => {
        const index = prev.findIndex(p => p.id === id);
        if (index === -1) return prev;

        const updatedPresets = [...prev];
        updatedPresets[index] = {
          ...updatedPresets[index],
          ...updates,
          lastModified: Date.now(),
        };
        return updatedPresets;
      });
    } catch (error) {
      console.error('Failed to update preset:', error);
      throw new Error('Could not update preset. Please try again.');
    }
  }, [setPresets]);

  /**
   * Deletes a preset by ID.
   */
  const deletePreset = useCallback((id: string) => {
    try {
      setPresets(prev => prev.filter(preset => preset.id !== id));
      return true;
    } catch (error) {
      console.error('Failed to delete preset:', error);
      throw new Error('Could not delete preset. Please try again.');
    }
  }, [setPresets]);

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

  return {
    presets,
    addPreset,
    updatePreset,
    deletePreset,
    getPreset,
    getAllPresets,
  };
}
