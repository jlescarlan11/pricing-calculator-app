import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { presetService } from './presetService';
import { supabase } from '../lib/supabase';
import type { Preset } from '../types';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Helper to setup mock chain
interface MockChain {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  then: ReturnType<typeof vi.fn>;
}

const setupMockChain = (overrides: Partial<MockChain> = {}) => {
  const chain: MockChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockImplementation(() => {
      const upsertChain = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'mock-comp-id',
            preset_id: 'new-uuid-123',
            competitor_name: 'Rival',
            competitor_price: 100,
          },
          error: null,
        }),
        then: vi.fn().mockImplementation((onFulfilled) => {
          return Promise.resolve({ error: null }).then(onFulfilled);
        }),
      };
      return upsertChain;
    }),
    single: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((onFulfilled) => {
      return Promise.resolve({ data: [], error: null }).then(onFulfilled);
    }),
    ...overrides,
  };
  (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  return chain;
};

describe('presetService.createSnapshot', () => {
  const mockDate = '2026-01-08T12:00:00.000Z';
  const basePresetId = 'base-123';

  const basePreset: Preset = {
    id: basePresetId,
    name: 'Base Product',
    userId: 'user-1',
    presetType: 'default',
    baseRecipe: {
      productName: 'Base',
      batchSize: 1,
      ingredients: [],
      laborCost: 0,
      overhead: 0,
      hasVariants: false,
      variants: [],
    },
    variants: [],
    pricingConfig: { strategy: 'markup', value: 50 },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    competitors: [
      {
        id: 'comp-1',
        presetId: basePresetId,
        competitorName: 'Rival',
        competitorPrice: 100,
        notes: '',
        createdAt: '',
        updatedAt: '',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupMockChain();

    // Mock Date
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockDate));

    // Mock localStorage
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
    });

    // Mock crypto.randomUUID
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'new-uuid-123'),
    });

    // Mock Navigator
    vi.stubGlobal('navigator', {
      onLine: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should create a snapshot successfully', async () => {
    // Setup local storage with base preset
    localStorage.setItem('pricing_calculator_presets', JSON.stringify([basePreset]));

    // Execute
    const snapshot = await presetService.createSnapshot(basePresetId);

    // Assert
    expect(snapshot).not.toBeNull();
    expect(snapshot?.id).toBe('new-uuid-123');
    expect(snapshot?.isSnapshot).toBe(true);
    expect(snapshot?.snapshotMetadata).toEqual({
      snapshotDate: mockDate,
      isTrackedVersion: true,
      versionNumber: 1, // First snapshot
      parentPresetId: basePresetId,
    });

    // Check competitors cloned with new IDs
    expect(snapshot?.competitors).toHaveLength(1);
    expect(snapshot?.competitors?.[0].id).toBe('new-uuid-123'); // Our mock UUID
    expect(snapshot?.competitors?.[0].presetId).toBe('new-uuid-123');

    // Ensure savePreset was called (via local storage update)
    const stored = JSON.parse(localStorage.getItem('pricing_calculator_presets') || '[]');
    expect(stored).toHaveLength(2); // Base + Snapshot

    // Ensure competitors upsert was called for the snapshot
    const chain = (supabase.from as unknown as ReturnType<typeof vi.fn>)();
    expect(chain.upsert).toHaveBeenCalledTimes(2); // 1 for preset, 1 for competitor
  });

  it('should return null if base preset not found', async () => {
    localStorage.setItem('pricing_calculator_presets', JSON.stringify([]));
    const snapshot = await presetService.createSnapshot('missing-id');
    expect(snapshot).toBeNull();
  });

  it('should return null if base preset is already a snapshot', async () => {
    const snapshotPreset = { ...basePreset, isSnapshot: true };
    localStorage.setItem('pricing_calculator_presets', JSON.stringify([snapshotPreset]));

    const result = await presetService.createSnapshot(basePresetId);
    expect(result).toBeNull();
  });

  it('should increment version number based on local snapshots', async () => {
    const existingSnapshot = {
      ...basePreset,
      id: 'snap-1',
      isSnapshot: true,
      snapshotMetadata: {
        snapshotDate: 'old-date',
        isTrackedVersion: true,
        versionNumber: 2,
        parentPresetId: basePresetId,
      },
    };

    localStorage.setItem(
      'pricing_calculator_presets',
      JSON.stringify([basePreset, existingSnapshot])
    );

    const result = await presetService.createSnapshot(basePresetId);

    expect(result?.snapshotMetadata?.versionNumber).toBe(3);
  });

  it('should update existing snapshot if one exists for the same day', async () => {
    const today = new Date(mockDate).toISOString();
    const existingSnapshot = {
      ...basePreset,
      id: 'existing-snap-id',
      isSnapshot: true,
      snapshotMetadata: {
        snapshotDate: today,
        isTrackedVersion: true,
        versionNumber: 1,
        parentPresetId: basePresetId,
      },
      createdAt: today,
      updatedAt: today,
    };

    localStorage.setItem(
      'pricing_calculator_presets',
      JSON.stringify([basePreset, existingSnapshot])
    );

    // Call createSnapshot again on the same day (mockDate is set in beforeEach)
    const result = await presetService.createSnapshot(basePresetId);

    expect(result).not.toBeNull();
    // Should reuse ID
    expect(result?.id).toBe('existing-snap-id');
    // Should keep version number
    expect(result?.snapshotMetadata?.versionNumber).toBe(1);
    // Should have updated metadata (though in this test case date is same, logic path is key)
    
    // Check local storage contains only 2 items (base + updated snapshot), not 3
    const stored = JSON.parse(localStorage.getItem('pricing_calculator_presets') || '[]');
    expect(stored).toHaveLength(2);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(stored.find((p: any) => p.id === 'existing-snap-id')).toBeDefined();
  });
});

describe('presetService - Core Methods', () => {
  const mockPreset: Preset = {
    id: 'p1',
    name: 'Test',
    userId: 'u1',
    presetType: 'default',
    baseRecipe: {
      productName: 'Test',
      batchSize: 1,
      ingredients: [],
      laborCost: 0,
      overhead: 0,
      hasVariants: false,
      variants: [],
    },
    variants: [],
    pricingConfig: { strategy: 'markup', value: 50 },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupMockChain();
    localStorage.clear();
    vi.stubGlobal('navigator', { onLine: true });
  });

  describe('savePreset', () => {
    it('saves locally and attempts cloud upsert if online', async () => {
      await presetService.savePreset(mockPreset);

      // Verify local storage
      const stored = JSON.parse(localStorage.getItem('pricing_calculator_presets') || '[]');
      expect(stored[0].id).toBe('p1');

      // Verify cloud call
      expect(supabase.from).toHaveBeenCalledWith('presets');
    });

    it('adds to sync queue if offline', async () => {
      vi.stubGlobal('navigator', { onLine: false });
      await presetService.savePreset(mockPreset);

      const queue = JSON.parse(localStorage.getItem('pricing_calculator_sync_queue') || '[]');
      expect(queue[0].action).toBe('save');
      expect(queue[0].preset.id).toBe('p1');
    });
  });

  describe('fetchPresets', () => {
    it('merges cloud and local presets correctly', async () => {
      // Local preset
      localStorage.setItem('pricing_calculator_presets', JSON.stringify([mockPreset]));

      // Cloud preset
      const cloudPreset = { ...mockPreset, id: 'p2', name: 'Cloud' };
      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ 
          data: [{
            id: 'p2',
            user_id: 'u1',
            name: 'Cloud',
            preset_type: 'default',
            base_recipe: cloudPreset.baseRecipe,
            pricing_config: cloudPreset.pricingConfig,
            created_at: cloudPreset.createdAt,
            updated_at: cloudPreset.updatedAt,
          }], 
          error: null 
        }),
      });

      const result = await presetService.fetchPresets('u1');
      expect(result).toHaveLength(2);
      expect(result.find(p => p.id === 'p1')).toBeDefined();
      expect(result.find(p => p.id === 'p2')).toBeDefined();
    });
  });

  describe('deletePreset', () => {
    it('removes from local storage and calls cloud delete', async () => {
      localStorage.setItem('pricing_calculator_presets', JSON.stringify([mockPreset]));
      
      await presetService.deletePreset('p1', 'u1');

      const stored = JSON.parse(localStorage.getItem('pricing_calculator_presets') || '[]');
      expect(stored).toHaveLength(0);
      expect(supabase.from).toHaveBeenCalledWith('presets');
    });
  });

  describe('syncPendingItems', () => {
    it('processes save actions in the queue', async () => {
      const queueItem = {
        action: 'save' as const,
        preset: mockPreset,
        timestamp: Date.now(),
      };
      localStorage.setItem('pricing_calculator_sync_queue', JSON.stringify([queueItem]));

      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ upsert: mockUpsert });

      await presetService.syncPendingItems();

      expect(mockUpsert).toHaveBeenCalled();
      const queue = JSON.parse(localStorage.getItem('pricing_calculator_sync_queue') || '[]');
      expect(queue).toHaveLength(0);
    });

    it('keeps failed items in the queue', async () => {
      const queueItem = {
        action: 'save' as const,
        preset: mockPreset,
        timestamp: Date.now(),
      };
      localStorage.setItem('pricing_calculator_sync_queue', JSON.stringify([queueItem]));

      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: new Error('Network error') }),
      });

      await presetService.syncPendingItems();

      const queue = JSON.parse(localStorage.getItem('pricing_calculator_sync_queue') || '[]');
      expect(queue).toHaveLength(1);
    });
  });

  describe('importPresets', () => {
    it('merges presets in merge strategy', async () => {
      localStorage.setItem('pricing_calculator_presets', JSON.stringify([mockPreset]));
      const newPreset = { ...mockPreset, id: 'p2', name: 'Imported' };

      await presetService.importPresets([newPreset], 'merge', 'u1');

      const stored = JSON.parse(localStorage.getItem('pricing_calculator_presets') || '[]');
      expect(stored).toHaveLength(2);
    });

    it('replaces presets in replace strategy', async () => {
      localStorage.setItem('pricing_calculator_presets', JSON.stringify([mockPreset]));
      const newPreset = { ...mockPreset, id: 'p2', name: 'Imported' };

      await presetService.importPresets([newPreset], 'replace', 'u1');

      const stored = JSON.parse(localStorage.getItem('pricing_calculator_presets') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('p2');
    });
  });

  describe('getSnapshots', () => {
    it('returns snapshots for a given parent preset', async () => {
      const snapshot: Preset = {
        ...mockPreset,
        id: 's1',
        isSnapshot: true,
        snapshotMetadata: {
          snapshotDate: '2026-01-08',
          isTrackedVersion: true,
          versionNumber: 1,
          parentPresetId: 'p1',
        },
      };
      localStorage.setItem('pricing_calculator_presets', JSON.stringify([mockPreset, snapshot]));

      // Mock cloud response to include the snapshot
      setupMockChain({
        then: vi.fn().mockImplementation((onFulfilled) => {
          return Promise.resolve({ 
            data: [{
              id: 's1',
              name: snapshot.name,
              preset_type: 'default',
              base_recipe: snapshot.baseRecipe,
              pricing_config: snapshot.pricingConfig,
              created_at: snapshot.createdAt,
              updated_at: snapshot.updatedAt,
              is_tracked_version: true,
              snapshot_date: snapshot.snapshotMetadata?.snapshotDate,
              version_number: 1,
              parent_preset_id: 'p1'
            }], 
            error: null 
          }).then(onFulfilled);
        }),
      });

      const results = await presetService.getSnapshots('p1');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('s1');
    });
  });
});
