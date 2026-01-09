import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { presetService } from '../services/presetService';
import type { Preset } from '../types';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface PresetsContextType {
  presets: Preset[];
  addPreset: (
    presetData: Omit<
      Preset,
      | 'id'
      | 'userId'
      | 'createdAt'
      | 'updatedAt'
      | 'lastSyncedAt'
      | 'isSnapshot'
      | 'snapshotMetadata'
    >
  ) => Promise<Preset>;
  updatePreset: (id: string, updates: Partial<Preset>) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;
  getPreset: (id: string) => Preset | undefined;
  getAllPresets: () => Preset[];
  createSnapshot: (presetId: string) => Promise<Preset | null>;
  getSnapshots: (presetId: string) => Promise<Preset[]>;
  syncStatus: SyncStatus;
  isSyncBlocked: boolean;
  setIsSyncBlocked: (blocked: boolean) => void;
  error: string | null;
  refresh: () => Promise<void>;
}

const PresetsContext = createContext<PresetsContextType | undefined>(undefined);

export const PresetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');
  const [isSyncBlocked, setIsSyncBlocked] = useState(false);
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
  }, [user]);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    const initialLoad = async () => {
      if (isMounted) {
        // Try to sync pending items first if online
        if (navigator.onLine) {
          await presetService.syncPendingItems().catch(console.error);
        }
        await loadPresets();
      }
    };

    initialLoad();

    return () => {
      isMounted = false;
    };
  }, [loadPresets]);

  // Sync listeners
  useEffect(() => {
    const handleOnline = () => {
      // Don't sync pending if blocked
      if (isSyncBlocked) return;
      
      setSyncStatus('syncing');
      presetService
        .syncPendingItems()
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
  }, [loadPresets, isSyncBlocked]);

  const addPreset = useCallback(
    async (
      presetData: Omit<
        Preset,
        | 'id'
        | 'userId'
        | 'createdAt'
        | 'updatedAt'
        | 'lastSyncedAt'
        | 'isSnapshot'
        | 'snapshotMetadata'
      >
    ) => {
      const presetId = crypto.randomUUID();

      // Inject presetId into competitors if they exist
      const competitors =
        presetData.competitors?.map((c) => ({
          ...c,
          presetId: presetId,
        })) || [];

      const newPreset: Preset = {
        ...presetData,
        id: presetId,
        userId: user?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSyncedAt: null,
        isSnapshot: false,
        snapshotMetadata: undefined,
        competitors: competitors,
      };

      // Optimistic update
      setPresets((prev) => [...prev, newPreset]);
      
      // If sync is blocked, we just keep it locally
      if (isSyncBlocked) {
        setSyncStatus('offline'); // Or a new status 'experimenting'?
        return newPreset;
      }

      setSyncStatus(navigator.onLine ? 'syncing' : 'offline');

      try {
        await presetService.savePreset(newPreset);

        // Auto-create Version 1 (Milestone)
        try {
          const snapshot = await presetService.createSnapshot(newPreset.id);
          if (snapshot) {
            setPresets((prev) => [...prev, snapshot]);
          }
        } catch (snapshotErr) {
          console.warn('Failed to auto-create version 1 snapshot', snapshotErr);
        }

        setSyncStatus(navigator.onLine ? 'synced' : 'offline');
        return newPreset;
      } catch (err) {
        console.error(err);
        setSyncStatus('error');
        throw err;
      }
    },
    [user, isSyncBlocked]
  );

  const updatePreset = useCallback(async (id: string, updates: Partial<Preset>) => {
    setPresets((prev) => {
      const index = prev.findIndex((p) => p.id === id);
      if (index === -1) return prev;

      const oldPreset = prev[index];
      const newPreset = {
        ...oldPreset,
        ...updates,
        updatedAt: new Date().toISOString(),
      } as Preset;

      // Only sync if not blocked
      if (!isSyncBlocked) {
        presetService
          .savePreset(newPreset)
          .then(() => setSyncStatus(navigator.onLine ? 'synced' : 'offline'))
          .catch(() => setSyncStatus('error'));
        setSyncStatus(navigator.onLine ? 'syncing' : 'offline');
      } else {
        // Keep it local-only
        setSyncStatus('offline');
      }

      const newArr = [...prev];
      newArr[index] = newPreset;
      return newArr;
    });
  }, [isSyncBlocked]);

  const deletePreset = useCallback(
    async (id: string) => {
      // Optimistic update
      setPresets((prev) => prev.filter((p) => p.id !== id));
      
      if (isSyncBlocked) {
        setSyncStatus('offline');
        return;
      }

      setSyncStatus(navigator.onLine ? 'syncing' : 'offline');

      try {
        await presetService.deletePreset(id, user?.id);
        setSyncStatus(navigator.onLine ? 'synced' : 'offline');
      } catch (err) {
        console.error(err);
        setSyncStatus('error');
      }
    },
    [user, isSyncBlocked]
  );

  const getPreset = useCallback(
    (id: string) => {
      return presets.find((p) => p.id === id);
    },
    [presets]
  );

  const getAllPresets = useCallback(() => {
    return presets;
  }, [presets]);

  const createSnapshot = useCallback(async (presetId: string) => {
    if (isSyncBlocked) {
      throw new Error('Cannot create version snapshots while experimenting in Soft-Apply mode.');
    }

    setSyncStatus(navigator.onLine ? 'syncing' : 'offline');
    try {
      const snapshot = await presetService.createSnapshot(presetId);
      if (snapshot) {
        setPresets((prev) => [...prev, snapshot]);
        setSyncStatus(navigator.onLine ? 'synced' : 'offline');
      }
      return snapshot;
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
      throw err;
    }
  }, [isSyncBlocked]);

  const getSnapshots = useCallback(async (presetId: string) => {
    try {
      return await presetService.getSnapshots(presetId);
    } catch (err) {
      console.error(err);
      return [];
    }
  }, []);

  const value = {
    presets,
    addPreset,
    updatePreset,
    deletePreset,
    getPreset,
    getAllPresets,
    createSnapshot,
    getSnapshots,
    syncStatus,
    isSyncBlocked,
    setIsSyncBlocked,
    error,
    refresh: loadPresets,
  };

  return <PresetsContext.Provider value={value}>{children}</PresetsContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePresetsContext = () => {
  const context = useContext(PresetsContext);
  if (context === undefined) {
    throw new Error('usePresetsContext must be used within a PresetsProvider');
  }
  return context;
};
