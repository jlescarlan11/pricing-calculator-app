import { authService } from '../auth';
import { presetsService as cloudService } from '../presets/presets.service';
import { offlineQueue } from '../../lib/offline-queue';
import type { Preset, PresetUpdate } from '../presets/presets.service';
import type { QueuedOperation, SyncStatus } from '../../types/sync';

/**
 * Centralized synchronization service for managing bi-directional preset syncing.
 */
export class SyncService {
  private static instance: SyncService;
  private isProcessing = false;
  private readonly CACHE_KEY = 'presets_cache';

  private constructor() {
    this.setupNetworkListeners();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Internal method to reset the singleton instance for testing.
   * @internal
   */
  public static _resetInstance(): void {
    if (SyncService.instance && typeof window !== 'undefined') {
      window.removeEventListener('online', SyncService.instance.handleOnline);
    }
    SyncService.instance = undefined as any;
  }

  /**
   * Initialize network listeners to trigger sync when coming back online.
   */
  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
    }
  }

  private handleOnline = () => {
    console.log('[SyncService] Online detected, starting queue processing...');
    this.processQueue();
    this.pullFromCloud();
  };

  /**
   * Syncs a single preset to the cloud with online/offline awareness.
   */
  public async syncToCloud(
    type: 'create' | 'update' | 'delete',
    presetId: string,
    payload?: any
  ): Promise<void> {
    const isOnline = navigator.onLine;

    if (!isOnline) {
      console.log(`[SyncService] Offline: Enqueueing ${type} operation for ${presetId}`);
      await offlineQueue.enqueue({ type, presetId, payload });
      return;
    }

    try {
      const user = await authService.getUser();
      if (!user) {
        // Not logged in, store in offline queue to be processed when logged in and online
        // Or handle as local-only. The requirement implies cloud sync for logged in users.
        await offlineQueue.enqueue({ type, presetId, payload });
        return;
      }

      await this.executeOperation(type, presetId, payload);
      
      // Update local cache after successful cloud sync (except for delete)
      if (type !== 'delete') {
        const updatedPreset = await cloudService.getById(presetId);
        this.updateLocalCache(updatedPreset);
      } else {
        this.removeFromLocalCache(presetId);
      }
    } catch (error) {
      console.error(`[SyncService] Sync failed for ${presetId}:`, error);
      // Enqueue for retry if it was a network error or transient failure
      await offlineQueue.enqueue({ type, presetId, payload });
    }
  }

  /**
   * Pulls all presets from the cloud and merges them into the local cache.
   */
  public async pullFromCloud(): Promise<Preset[]> {
    if (!navigator.onLine) {
      return this.getLocalCache();
    }

    try {
      const user = await authService.getUser();
      if (!user) return this.getLocalCache();

      const cloudPresets = await cloudService.getAll();
      this.mergeWithLocalCache(cloudPresets);
      return cloudPresets;
    } catch (error) {
      console.error('[SyncService] Failed to pull from cloud:', error);
      return this.getLocalCache();
    }
  }

  /**
   * Processes the offline queue with retry logic and ordering.
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) return;

    this.isProcessing = true;
    
    try {
      const user = await authService.getUser();
      if (!user) {
        this.isProcessing = false;
        return;
      }

      console.log('[SyncService] Processing offline queue...');

      let hasMore = true;
      while (hasMore) {
        hasMore = await offlineQueue.processNext(async (op) => {
          await this.executeOperation(op.type, op.presetId, op.payload);
          
          // Post-operation cache update
          if (op.type !== 'delete') {
            try {
              const updated = await cloudService.getById(op.presetId);
              this.updateLocalCache(updated);
            } catch (e) {
              // If getById fails, we still processed the operation
              console.warn(`[SyncService] Could not refresh cache for ${op.presetId} after sync`);
            }
          } else {
            this.removeFromLocalCache(op.presetId);
          }
        });
      }
      console.log('[SyncService] Queue processing complete');
    } catch (error) {
      console.error('[SyncService] Error processing queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Executes a cloud operation based on type.
   */
  private async executeOperation(
    type: 'create' | 'update' | 'delete',
    id: string,
    payload?: any
  ): Promise<void> {
    switch (type) {
      case 'create':
        await cloudService.create({ ...payload, id });
        break;
      case 'update':
        // Verify existence before update to ensure consistency
        await cloudService.getById(id);
        await cloudService.update(id, payload as PresetUpdate);
        break;
      case 'delete':
        await cloudService.delete(id);
        break;
    }
  }

  /**
   * Merges cloud presets into local cache using last-write-wins.
   */
  private mergeWithLocalCache(cloudPresets: Preset[] = []): void {
    const localPresets = this.getLocalCache();
    const localMap = new Map(localPresets.map(p => [p.id, p]));
    
    if (Array.isArray(cloudPresets)) {
      cloudPresets.forEach(cloud => {
      const local = localMap.get(cloud.id);
      
      if (!local) {
        // Cloud-only, add to local
        localMap.set(cloud.id, cloud);
      } else {
        // Both exist, compare updated_at
        const cloudTime = new Date(cloud.updated_at || 0).getTime();
        const localTime = new Date(local.updated_at || 0).getTime();
        
        if (cloudTime >= localTime) {
          localMap.set(cloud.id, cloud);
        }
      }
    });
    }

    // Note: local-only presets are preserved in localMap (Last-write-wins + cloud primary source)
    this.saveToLocalCache(Array.from(localMap.values()));
  }

  /**
   * Updates a single preset in the local cache.
   */
  private updateLocalCache(preset: Preset): void {
    const cache = this.getLocalCache();
    const index = cache.findIndex(p => p.id === preset.id);
    
    if (index > -1) {
      cache[index] = preset;
    } else {
      cache.unshift(preset);
    }
    
    this.saveToLocalCache(cache);
  }

  /**
   * Removes a preset from the local cache.
   */
  private removeFromLocalCache(id: string): void {
    const cache = this.getLocalCache().filter(p => p.id !== id);
    this.saveToLocalCache(cache);
  }

  /**
   * Retrieves presets from local storage.
   */
  public getLocalCache(): Preset[] {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  /**
   * Saves presets to local storage.
   */
  private saveToLocalCache(presets: Preset[]): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(presets));
    } catch (e) {
      console.error('[SyncService] Failed to save to local cache:', e);
    }
  }
}

export const syncService = SyncService.getInstance();