import { supabase } from '../lib/supabase';
import type { Preset } from '../types';

const STORAGE_KEY = 'pricing_calculator_presets';
const SYNC_QUEUE_KEY = 'pricing_calculator_sync_queue';

type SyncAction = 'save' | 'delete';

interface SyncQueueItem {
  action: SyncAction;
  preset: Preset; // For delete, we just need ID, but storing full preset (or partial) is safer for retries if we want to restore
  timestamp: number;
}

// Helper to sanitize a preset to prevent crashes from missing fields
function sanitizePreset(preset: any): Preset | null {
  if (!preset || !preset.id || !preset.name) return null;

  return {
    id: preset.id,
    userId: preset.userId,
    name: preset.name,
    presetType: (preset.presetType || 'default') as 'default' | 'variant',
    baseRecipe: {
      productName: preset.baseRecipe?.productName || '',
      batchSize: typeof preset.baseRecipe?.batchSize === 'number' ? preset.baseRecipe.batchSize : 1,
      ingredients: Array.isArray(preset.baseRecipe?.ingredients)
        ? preset.baseRecipe.ingredients
        : [],
      laborCost: typeof preset.baseRecipe?.laborCost === 'number' ? preset.baseRecipe.laborCost : 0,
      overhead: typeof preset.baseRecipe?.overhead === 'number' ? preset.baseRecipe.overhead : 0,
      hasVariants: !!preset.baseRecipe?.hasVariants,
      variants: Array.isArray(preset.baseRecipe?.variants) ? preset.baseRecipe.variants : [],
      businessName: preset.baseRecipe?.businessName,
      currentSellingPrice: preset.baseRecipe?.currentSellingPrice,
    },
    variants: Array.isArray(preset.variants) ? preset.variants : [],
    pricingConfig: {
      strategy: (preset.pricingConfig?.strategy || 'markup') as 'markup' | 'margin',
      value: typeof preset.pricingConfig?.value === 'number' ? preset.pricingConfig.value : 50,
    },
    createdAt: preset.createdAt || new Date().toISOString(),
    updatedAt: preset.updatedAt || new Date().toISOString(),
    lastSyncedAt: preset.lastSyncedAt,
  };
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
}): Preset {
  const preset = {
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
  };

  return sanitizePreset(preset) as Preset;
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
        // We can't easily queue "delete all", but since local is cleared,
        // next sync/fetch might be messy.
        // ideally we should track "reset" action.
        // For now, let's just log error.
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
        // Queue individual saves as fallback?
        // Or just let next sync handle it?
        // Since we updated local, next sync check might miss them if we don't queue.
        // Let's queue them to be safe.
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
};
