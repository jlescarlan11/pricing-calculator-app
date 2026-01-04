import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncService } from './sync.service';
import { authService } from '../auth';
import { presetsService as cloudService } from '../presets/presets.service';
import type { Preset } from '../presets/presets.service';
import { offlineQueue } from '../../lib/offline-queue';

// Mock dependencies
vi.mock('../auth', () => ({
  authService: {
    getUser: vi.fn(),
  },
}));

vi.mock('../presets/presets.service', () => ({
  presetsService: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../lib/offline-queue', () => ({
  offlineQueue: {
    enqueue: vi.fn(),
    processNext: vi.fn(),
    getAll: vi.fn(),
    getCount: vi.fn(),
  },
}));

describe('SyncService', () => {
  let service: SyncService;
  const mockUser = { id: 'user-123' };
  const mockPreset = {
    id: 'preset-1',
    user_id: 'user-123',
    name: 'Test Preset',
    updated_at: new Date().toISOString(),
    ingredients: [],
    batch_size: 1,
    labor_cost: 0,
    overhead_cost: 0,
    preset_type: 'single',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    SyncService._resetInstance();
    service = SyncService.getInstance();
    localStorage.clear();
    // Default online
    vi.stubGlobal('navigator', { onLine: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(authService.getUser).mockResolvedValue(mockUser as unknown as any); // Mock partial user
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('syncToCloud', () => {
    it('should execute operation immediately when online and logged in', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(cloudService.getById).mockResolvedValue(mockPreset as unknown as any);

      await service.syncToCloud('create', mockPreset.id, mockPreset);

      expect(cloudService.create).toHaveBeenCalled();
      expect(offlineQueue.enqueue).not.toHaveBeenCalled();
      expect(service.getLocalCache()).toContainEqual(mockPreset);
    });

    it('should enqueue operation when offline', async () => {
      vi.stubGlobal('navigator', { onLine: false });

      await service.syncToCloud('update', mockPreset.id, { name: 'Updated' });

      expect(cloudService.update).not.toHaveBeenCalled();
      expect(offlineQueue.enqueue).toHaveBeenCalledWith({
        type: 'update',
        presetId: mockPreset.id,
        payload: { name: 'Updated' },
      });
    });

    it('should enqueue operation when not logged in', async () => {
      vi.mocked(authService.getUser).mockResolvedValue(null);

      await service.syncToCloud('create', mockPreset.id, mockPreset);

      expect(cloudService.create).not.toHaveBeenCalled();
      expect(offlineQueue.enqueue).toHaveBeenCalled();
    });

    it('should enqueue for retry if cloud operation fails', async () => {
      vi.mocked(cloudService.create).mockRejectedValue(new Error('Network error'));

      await service.syncToCloud('create', mockPreset.id, mockPreset);

      expect(offlineQueue.enqueue).toHaveBeenCalled();
    });
  });

  describe('pullFromCloud', () => {
    it('should pull from cloud and update local cache', async () => {
      const cloudPresets = [mockPreset];
      vi.mocked(cloudService.getAll).mockResolvedValue(cloudPresets as unknown as Preset[]);

      const result = await service.pullFromCloud();

      expect(result).toEqual(cloudPresets);
      expect(service.getLocalCache()).toEqual(cloudPresets);
    });

    it('should return local cache when offline', async () => {
      vi.stubGlobal('navigator', { onLine: false });
      const localData = [mockPreset];
      localStorage.setItem('presets_cache', JSON.stringify(localData));

      const result = await service.pullFromCloud();

      expect(cloudService.getAll).not.toHaveBeenCalled();
      expect(result).toEqual(localData);
    });

    it('should handle conflicts using last-write-wins', async () => {
      const olderDate = new Date(2023, 1, 1).toISOString();
      const newerDate = new Date(2023, 1, 2).toISOString();
      
      const localPreset = { ...mockPreset, updated_at: olderDate, name: 'Local Old' };
      const cloudPreset = { ...mockPreset, updated_at: newerDate, name: 'Cloud New' };
      
      localStorage.setItem('presets_cache', JSON.stringify([localPreset]));
      vi.mocked(cloudService.getAll).mockResolvedValue([cloudPreset] as unknown as Preset[]);

      const result = await service.pullFromCloud();

      expect(result[0].name).toBe('Cloud New');
      expect(service.getLocalCache()[0].name).toBe('Cloud New');
    });

    it('should preserve local-only presets', async () => {
      const localOnly = { ...mockPreset, id: 'local-only' };
      localStorage.setItem('presets_cache', JSON.stringify([localOnly]));
      vi.mocked(cloudService.getAll).mockResolvedValue([mockPreset] as unknown as Preset[]);

      await service.pullFromCloud();

      const cache = service.getLocalCache();
      expect(cache).toHaveLength(2);
      expect(cache.find(p => p.id === 'local-only')).toBeDefined();
    });
  });

  describe('processQueue', () => {
    it('should process all items in the queue', async () => {
      const operations = [
        { type: 'create', presetId: '1', payload: { name: 'P1' } },
        { type: 'delete', presetId: '2' },
      ];

      vi.mocked(offlineQueue.processNext)
        .mockImplementationOnce(async (fn) => {
          await fn(operations[0] as unknown as any);
          return true;
        })
        .mockImplementationOnce(async (fn) => {
          await fn(operations[1] as unknown as any);
          return true;
        })
        .mockResolvedValueOnce(false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(cloudService.getById).mockResolvedValue({ id: '1', name: 'P1' } as unknown as any);

      await service.processQueue();

      expect(cloudService.create).toHaveBeenCalledWith({ name: 'P1', id: '1' });
      expect(cloudService.delete).toHaveBeenCalledWith('2');
      expect(service.getLocalCache().find(p => p.id === '1')).toBeDefined();
    });

    it('should not process if already processing', async () => {
      vi.mocked(offlineQueue.processNext).mockImplementation(async () => {
        // Simulate long processing
        await new Promise(r => setTimeout(r, 50));
        return false;
      });

      const p1 = service.processQueue();
      const p2 = service.processQueue();

      await Promise.all([p1, p2]);

      expect(offlineQueue.processNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('network transitions', () => {
    it('should trigger queue processing when coming online', async () => {
      const processSpy = vi.spyOn(service, 'processQueue');
      const pullSpy = vi.spyOn(service, 'pullFromCloud');

      window.dispatchEvent(new Event('online'));

      expect(processSpy).toHaveBeenCalled();
      expect(pullSpy).toHaveBeenCalled();
    });
  });
});
