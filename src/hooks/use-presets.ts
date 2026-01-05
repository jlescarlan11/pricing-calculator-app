import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { presetService } from '../services/presetService';
import type { Preset } from '../types';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export function usePresets() {
  const { user } = useAuth();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [error, setError] = useState<string | null>(null);

  const loadPresets = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const data = await presetService.fetchPresets(user?.id);
      setPresets(data);
      setSyncStatus(navigator.onLine ? 'synced' : 'offline');
    } catch (err) {
      console.error(err);
      setError('Failed to load presets');
      setSyncStatus('error');
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  // Sync listeners
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus('syncing');
      presetService.syncPendingItems()
        .then(() => loadPresets())
        .catch(() => setSyncStatus('error'));
    };
    const handleOffline = () => setSyncStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadPresets]);

  const addPreset = useCallback(async (presetData: Omit<Preset, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'lastSyncedAt'>) => {
    const newPreset: Preset = {
      ...presetData,
      id: crypto.randomUUID(),
      userId: user?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSyncedAt: null,
    };

    // Optimistic update
    setPresets(prev => [...prev, newPreset]);
    setSyncStatus(navigator.onLine ? 'syncing' : 'offline');

    try {
      await presetService.savePreset(newPreset);
      setSyncStatus(navigator.onLine ? 'synced' : 'offline');
      return newPreset;
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
      throw err;
    }
  }, [user?.id]);

  const updatePreset = useCallback(async (id: string, updates: Partial<Preset>) => {
    setPresets(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index === -1) return prev;

      const oldPreset = prev[index];
      const newPreset = { 
        ...oldPreset, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };

      // Trigger save (fire and forget for UI responsiveness)
      presetService.savePreset(newPreset)
        .then(() => setSyncStatus(navigator.onLine ? 'synced' : 'offline'))
        .catch(() => setSyncStatus('error'));
      
      const newArr = [...prev];
      newArr[index] = newPreset;
      return newArr;
    });
    
    setSyncStatus(navigator.onLine ? 'syncing' : 'offline');
  }, []);

  const deletePreset = useCallback(async (id: string) => {
    // Optimistic update
    setPresets(prev => prev.filter(p => p.id !== id));
    setSyncStatus(navigator.onLine ? 'syncing' : 'offline');

    try {
      await presetService.deletePreset(id, user?.id);
      setSyncStatus(navigator.onLine ? 'synced' : 'offline');
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
    }
  }, [user?.id]);

  const getPreset = useCallback((id: string) => {
    return presets.find(p => p.id === id);
  }, [presets]);

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
    syncStatus,
    error,
    refresh: loadPresets
  };
}