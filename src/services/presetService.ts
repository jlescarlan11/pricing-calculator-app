import { supabase } from '../lib/supabase';
import type { Preset, Competitor, SnapshotMetadata } from '../types';

const STORAGE_KEY = 'pricing_calculator_presets';
const SYNC_QUEUE_KEY = 'pricing_calculator_sync_queue';

type SyncAction = 'save' | 'delete';

interface SyncQueueItem {
  action: SyncAction;
  preset: Preset; // For delete, we just need ID, but storing full preset (or partial) is safer for retries if we want to restore
  timestamp: number;
}

// Helper to sanitize a preset to prevent crashes from missing fields
function sanitizePreset(preset: Partial<Preset> | null | undefined): Preset | null {
  if (!preset || !preset.id || !preset.name) return null;

  const baseRecipe = preset.baseRecipe as Record<string, unknown> | undefined;
  const pricingConfig = preset.pricingConfig as Record<string, unknown> | undefined;
  const snapshotMetadata = preset.snapshotMetadata;

  // Infer isSnapshot from metadata presence if not explicitly set
  // This handles migration from old data that didn't have isSnapshot
  const isSnapshot =
    typeof preset.isSnapshot === 'boolean'
      ? preset.isSnapshot
      : !!(snapshotMetadata && snapshotMetadata.isTrackedVersion);

  const common = {
    id: preset.id,
    userId: preset.userId,
    name: preset.name,
    presetType: (preset.presetType || 'default') as 'default' | 'variant',
    baseRecipe: {
      productName: String(baseRecipe?.productName || ''),
      batchSize: typeof baseRecipe?.batchSize === 'number' ? baseRecipe.batchSize : 1,
      ingredients: Array.isArray(baseRecipe?.ingredients) ? baseRecipe.ingredients : [],
      laborCost: typeof baseRecipe?.laborCost === 'number' ? baseRecipe.laborCost : 0,
      overhead: typeof baseRecipe?.overhead === 'number' ? baseRecipe.overhead : 0,
      hasVariants: !!baseRecipe?.hasVariants,
      variants: Array.isArray(baseRecipe?.variants) ? baseRecipe.variants : [],
      businessName: baseRecipe?.businessName as string | undefined,
      currentSellingPrice: baseRecipe?.currentSellingPrice as number | undefined,
    },
    variants: Array.isArray(preset.variants) ? preset.variants : [],
    pricingConfig: {
      strategy: (pricingConfig?.strategy || 'markup') as 'markup' | 'margin',
      value: typeof pricingConfig?.value === 'number' ? pricingConfig.value : 50,
    },
    createdAt: preset.createdAt || new Date().toISOString(),
    updatedAt: preset.updatedAt || new Date().toISOString(),
    lastSyncedAt: preset.lastSyncedAt,
    competitors: Array.isArray(preset.competitors) ? preset.competitors : [],
  };

  if (isSnapshot) {
    return {
      ...common,
      isSnapshot: true,
      snapshotMetadata: snapshotMetadata
        ? {
            snapshotDate: snapshotMetadata.snapshotDate,
            isTrackedVersion: snapshotMetadata.isTrackedVersion,
            versionNumber: snapshotMetadata.versionNumber,
            parentPresetId: snapshotMetadata.parentPresetId,
          }
        : {
            // Fallback if metadata is missing but isSnapshot was true (shouldn't happen)
            snapshotDate: common.createdAt,
            isTrackedVersion: true,
            versionNumber: 1,
          },
    } as Preset;
  } else {
    return {
      ...common,
      isSnapshot: false,
      snapshotMetadata: undefined,
    } as Preset;
  }
}

// Helper to get local presets
function getLocalPresets(): Preset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(sanitizePreset).filter((p): p is Preset => p !== null);
  } catch (e) {
    console.error('Error reading local presets', e);
    return [];
  }
}

function setLocalPresets(presets: Preset[]) {
  try {
    const sanitized = presets.map(sanitizePreset).filter((p): p is Preset => p !== null);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch {
    console.error('Error saving local presets');
  }
}

// Helper to get sync queue
function getSyncQueue(): SyncQueueItem[] {
  try {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Helper to set sync queue
function setSyncQueue(queue: SyncQueueItem[]) {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

function addToSyncQueue(action: SyncAction, preset: Preset) {
  const queue = getSyncQueue();
  // Remove existing pending action for this ID to avoid duplicates (last one wins)
  const filtered = queue.filter((item) => item.preset.id !== preset.id);
  filtered.push({ action, preset, timestamp: Date.now() });
  setSyncQueue(filtered);
}

// Mapper: DB -> App
function mapFromDb(row: {
  id: string;
  user_id?: string;
  name: string;
  preset_type: string;
  base_recipe: Record<string, unknown>;
  variants?: Record<string, unknown>[];
  pricing_config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  last_synced_at?: string | null;
  snapshot_date?: string | null;
  is_tracked_version?: boolean | null;
  version_number?: number | null;
  parent_preset_id?: string | null;
}): Preset {
  const snapshotMetadata: SnapshotMetadata | undefined =
    row.is_tracked_version && row.snapshot_date && row.version_number
      ? {
          snapshotDate: row.snapshot_date,
          isTrackedVersion: row.is_tracked_version,
          versionNumber: row.version_number,
          parentPresetId: row.parent_preset_id || undefined,
        }
      : undefined;

  const isSnapshot = !!snapshotMetadata;

  const presetPart = {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    presetType: row.preset_type as 'default' | 'variant',
    baseRecipe: row.base_recipe as unknown as Preset['baseRecipe'],
    variants: (row.variants || []) as unknown as Preset['variants'],
    pricingConfig: row.pricing_config as unknown as Preset['pricingConfig'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastSyncedAt: row.last_synced_at,
    isSnapshot,
    snapshotMetadata,
  };

  return sanitizePreset(presetPart) as Preset;
}

// Mapper: App -> DB
function mapToDb(preset: Preset) {
  return {
    id: preset.id,
    user_id: preset.userId,
    name: preset.name,
    preset_type: preset.presetType,
    base_recipe: preset.baseRecipe,
    variants: preset.variants,
    pricing_config: preset.pricingConfig,
    created_at: preset.createdAt,
    updated_at: preset.updatedAt,
    last_synced_at: new Date().toISOString(),
    snapshot_date: preset.snapshotMetadata?.snapshotDate,
    is_tracked_version: preset.snapshotMetadata?.isTrackedVersion ?? false,
    version_number: preset.snapshotMetadata?.versionNumber,
    parent_preset_id: preset.snapshotMetadata?.parentPresetId,
  };
}

export const presetService = {
  // Sync logic
  async syncPendingItems() {
    if (!navigator.onLine) return;
    const queue = getSyncQueue();
    if (queue.length === 0) return;

    const remainingQueue: SyncQueueItem[] = [];

    for (const item of queue) {
      try {
        if (item.action === 'save') {
          const { error } = await supabase.from('presets').upsert(mapToDb(item.preset));
          if (error) throw error;
        } else if (item.action === 'delete') {
          const { error } = await supabase.from('presets').delete().eq('id', item.preset.id);
          if (error) throw error;
        }
      } catch (e) {
        console.error('Sync failed for item', item.preset.id, e);
        remainingQueue.push(item); // Keep in queue if failed
      }
    }
    setSyncQueue(remainingQueue);
  },

  async fetchPresets(userId?: string): Promise<Preset[]> {
    // 1. Load Local
    const localPresets = getLocalPresets();

    // 2. If online and user logged in, fetch from Supabase
    if (userId && navigator.onLine) {
      try {
        const { data, error } = await supabase.from('presets').select('*').eq('user_id', userId);

        if (error) throw error;

        if (data) {
          const cloudPresets = data.map(mapFromDb);

          // 3. Merge Strategy (Last Write Wins based on updatedAt)
          const mergedMap = new Map<string, Preset>();

          // Add local first
          localPresets.forEach((p) => mergedMap.set(p.id, p));

          // Merge cloud
          cloudPresets.forEach((cloudP) => {
            const localP = mergedMap.get(cloudP.id);
            if (!localP) {
              mergedMap.set(cloudP.id, cloudP);
            } else {
              // Compare timestamps
              const localTime = new Date(localP.updatedAt).getTime();
              const cloudTime = new Date(cloudP.updatedAt).getTime();
              if (cloudTime > localTime) {
                mergedMap.set(cloudP.id, cloudP);
              }
            }
          });

          const merged = Array.from(mergedMap.values());
          // Update local storage with merged data
          setLocalPresets(merged);
          return merged;
        }
      } catch (e) {
        console.error('Error fetching presets from cloud', e);
        // Fallback to local
        return localPresets;
      }
    }

    return localPresets;
  },

  async savePreset(preset: Preset): Promise<Preset> {
    // 1. Save Local
    const localPresets = getLocalPresets();
    const index = localPresets.findIndex((p) => p.id === preset.id);
    if (index >= 0) {
      localPresets[index] = preset;
    } else {
      localPresets.push(preset);
    }
    setLocalPresets(localPresets);

    // 2. Sync or Queue
    if (navigator.onLine && preset.userId) {
      try {
        const { error } = await supabase.from('presets').upsert(mapToDb(preset));
        if (error) throw error;

        // 3. Save Competitors if present
        if (preset.competitors && preset.competitors.length > 0) {
          for (const comp of preset.competitors) {
            // Only sync if it has a presetId (which it should if it's attached)
            if (comp.presetId === preset.id) {
               await this.upsertCompetitor(preset.id, comp);
            }
          }
        }

      } catch (e) {
        console.error('Save to cloud failed, queuing', e);
        addToSyncQueue('save', preset);
      }
    } else {
      addToSyncQueue('save', preset);
    }

    return preset;
  },

  async deletePreset(id: string, userId?: string): Promise<void> {
    // 1. Delete Local
    const localPresets = getLocalPresets();
    const presetToDelete = localPresets.find((p) => p.id === id);
    const filtered = localPresets.filter((p) => p.id !== id);
    setLocalPresets(filtered);

    if (!presetToDelete) return; // Already gone?

    // 2. Sync or Queue
    if (navigator.onLine && userId) {
      try {
        const { error } = await supabase.from('presets').delete().eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error('Delete from cloud failed, queuing', e);
        addToSyncQueue('delete', presetToDelete);
      }
    } else {
      addToSyncQueue('delete', presetToDelete);
    }
  },

  async deleteAllPresets(userId?: string): Promise<void> {
    setLocalPresets([]);

    if (navigator.onLine && userId) {
      try {
        const { error } = await supabase.from('presets').delete().eq('user_id', userId);
        if (error) throw error;
      } catch (e) {
        console.error('Delete all from cloud failed', e);
        throw e;
      }
    }
  },

  async importPresets(
    presets: Preset[],
    strategy: 'merge' | 'replace',
    userId?: string
  ): Promise<void> {
    if (strategy === 'replace') {
      await this.deleteAllPresets(userId);
    }

    // 1. Local Update
    const localPresets = getLocalPresets();
    const mergedMap = new Map<string, Preset>();

    // If merge, start with existing
    if (strategy === 'merge') {
      localPresets.forEach((p) => mergedMap.set(p.id, p));
    }

    // Apply imports (overwrite on conflict)
    presets.forEach((p) => {
      // Ensure imported presets are owned by current user if logged in
      const presetToSave = { ...p, userId: userId || undefined };
      mergedMap.set(presetToSave.id, presetToSave);
    });

    const finalPresets = Array.from(mergedMap.values());
    setLocalPresets(finalPresets);

    // 2. Cloud Update
    if (navigator.onLine && userId) {
      // Upsert only the imported presets (modified to have correct userId)
      const presetsToSync = presets.map((p) => ({ ...p, userId }));

      try {
        const { error } = await supabase.from('presets').upsert(presetsToSync.map(mapToDb));
        if (error) throw error;
      } catch (e) {
        console.error('Import sync to cloud failed', e);
        presetsToSync.forEach((p) => addToSyncQueue('save', p));
      }
    } else {
      // Offline import - queue all for sync
      presets.forEach((p) => {
        const presetToSave = { ...p, userId: userId || undefined };
        addToSyncQueue('save', presetToSave);
      });
    }
  },

  async createSnapshot(presetId: string): Promise<Preset | null> {
    // 1. Fetch Source Preset
    const presets = getLocalPresets();
    const sourcePreset = presets.find((p) => p.id === presetId);

    if (!sourcePreset) {
      console.error('Snapshot creation failed: Base preset not found locally', presetId);
      return null;
    }

    // Validation: Ensure we don't snapshot a snapshot
    if (sourcePreset.isSnapshot) {
      console.error('Snapshot creation failed: Cannot create a snapshot from a snapshot');
      return null;
    }

    // 2. Determine Version Number
    // Check local snapshots for max version
    const localSnapshots = presets.filter(
      (p) =>
        p.isSnapshot &&
        p.snapshotMetadata?.parentPresetId === presetId
    );

    let nextVersion = 1;
    if (localSnapshots.length > 0) {
      const maxLocal = Math.max(...localSnapshots.map((p) => p.snapshotMetadata!.versionNumber));
      nextVersion = maxLocal + 1;
    }

    // If online, double check DB for higher version to ensure consistency
    if (navigator.onLine && sourcePreset.userId) {
      try {
        const { data } = await supabase
          .from('presets')
          .select('version_number')
          .eq('parent_preset_id', presetId)
          .order('version_number', { ascending: false })
          .limit(1);

        if (data && data.length > 0 && data[0].version_number) {
          nextVersion = Math.max(nextVersion, data[0].version_number + 1);
        }
      } catch (e) {
        console.warn('Could not fetch latest version from cloud, using local version', e);
      }
    }

    // 3. Create Snapshot Object
    const snapshotId = crypto.randomUUID();
    const now = new Date().toISOString();

    const snapshotPreset: Preset = {
      ...structuredClone(sourcePreset),
      id: snapshotId,
      createdAt: now,
      updatedAt: now,
      lastSyncedAt: undefined, // Needs sync
      isSnapshot: true,
      snapshotMetadata: {
        snapshotDate: now,
        isTrackedVersion: true,
        versionNumber: nextVersion,
        parentPresetId: sourcePreset.id,
      },
    };

    // 4. Handle Competitors (Deep Clone)
    // If the source preset has competitors, we need to clone them as new records linked to the snapshot
    if (Array.isArray(snapshotPreset.competitors) && snapshotPreset.competitors.length > 0) {
      snapshotPreset.competitors = snapshotPreset.competitors.map((comp) => ({
        ...comp,
        id: crypto.randomUUID(), // New ID
        presetId: snapshotId, // Link to snapshot
        createdAt: now,
        updatedAt: now,
      }));
    } else {
      snapshotPreset.competitors = [];
    }

    // 5. Save Snapshot
    return await this.savePreset(snapshotPreset);
  },

  async getSnapshots(parentPresetId: string): Promise<Preset[]> {
    // 1. Local
    const localPresets = getLocalPresets();
    const localSnapshots = localPresets
      .filter(
        (p) =>
          p.isSnapshot &&
          p.snapshotMetadata?.parentPresetId === parentPresetId
      )
      .sort((a, b) => (a.snapshotMetadata!.versionNumber - b.snapshotMetadata!.versionNumber));

    // 2. Cloud (if online)
    if (navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('presets')
          .select('*')
          .eq('parent_preset_id', parentPresetId)
          .eq('is_tracked_version', true)
          .order('version_number', { ascending: true });

        if (error) throw error;

        if (data) {
          const cloudSnapshots = data.map(mapFromDb);
          
          // Merge into local storage
          const allPresets = getLocalPresets();
          const mergedMap = new Map(allPresets.map(p => [p.id, p]));
          
          cloudSnapshots.forEach(s => mergedMap.set(s.id, s));
          setLocalPresets(Array.from(mergedMap.values()));

          return cloudSnapshots;
        }
      } catch (e) {
        console.error('Error fetching snapshots', e);
      }
    }

    return localSnapshots;
  },

  async getCompetitors(presetId: string): Promise<Competitor[]> {
    if (!navigator.onLine) return [];

    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .eq('preset_id', presetId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching competitors', error);
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      presetId: row.preset_id,
      competitorName: row.competitor_name,
      competitorPrice: Number(row.competitor_price),
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async upsertCompetitor(
    presetId: string,
    data: Omit<Competitor, 'id' | 'presetId' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<Competitor | null> {
    if (!navigator.onLine) {
      throw new Error('Cannot manage competitors while offline');
    }

    const payload = {
      preset_id: presetId,
      competitor_name: data.competitorName,
      competitor_price: data.competitorPrice,
      notes: data.notes,
      ...(data.id ? { id: data.id } : {}),
    };

    const { data: result, error } = await supabase
      .from('competitors')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      if (error.message.includes('Maximum of 5 competitors')) {
        throw new Error('Maximum of 5 competitors allowed per preset.');
      }
      throw error;
    }

    if (!result) return null;

    return {
      id: result.id,
      presetId: result.preset_id,
      competitorName: result.competitor_name,
      competitorPrice: Number(result.competitor_price),
      notes: result.notes,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  },
};