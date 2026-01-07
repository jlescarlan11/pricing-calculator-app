import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Preset } from '../../src/types';

// Use vi.hoisted to ensure the variable is available for the mock factory
const { mockSupabaseClient } = vi.hoisted(() => {
  return {
    mockSupabaseClient: {
      from: vi.fn(),
    },
  };
});

vi.mock('../../src/lib/supabase', () => ({
  supabase: mockSupabaseClient,
}));

import { presetService } from '../../src/services/presetService';

// --- Mocks ---

// Helper to reset chainable mocks
const resetMocks = () => {
  vi.clearAllMocks();

  // We create a "chain" object that can handle the calls
  const defaultChain = {
    select: vi.fn(),
    insert: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve),
  };

  // Wire up the chain to return itself
  defaultChain.select.mockReturnValue(defaultChain);
  defaultChain.insert.mockReturnValue(defaultChain);
  defaultChain.upsert.mockReturnValue(defaultChain);
  defaultChain.delete.mockReturnValue(defaultChain);
  defaultChain.eq.mockReturnValue(defaultChain);
  defaultChain.order.mockReturnValue(defaultChain);
  defaultChain.limit.mockReturnValue(defaultChain);

  mockSupabaseClient.from.mockReturnValue(defaultChain);
};

describe('Foundation Validation Integration Tests', () => {
  const userId = 'test-user-id';

  beforeEach(() => {
    localStorage.clear();
    resetMocks();

    // Default: Online
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createBasePreset = (id: string, name: string): Preset => ({
    id,
    userId,
    name,
    presetType: 'default',
    baseRecipe: {
      productName: name,
      batchSize: 10,
      ingredients: [],
      laborCost: 10,
      overhead: 5,
    },
    variants: [],
    pricingConfig: {
      strategy: 'markup',
      value: 50,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSnapshot: false,
  });

  it('should create a snapshot correctly', async () => {
    const baseId = 'base-1';
    const basePreset = createBasePreset(baseId, 'My Product');

    // 1. Save base preset
    await presetService.savePreset(basePreset);

    // 2. Mock Supabase check for version (return empty to start at 1)
    const chain = mockSupabaseClient.from(); // Get the default chain
    chain.limit.mockResolvedValueOnce({ data: [] }); // No existing versions

    // 3. Create snapshot
    const snapshot = await presetService.createSnapshot(baseId);

    // 4. Assertions
    expect(snapshot).not.toBeNull();
    expect(snapshot?.isSnapshot).toBe(true);
    expect(snapshot?.snapshotMetadata).toEqual({
      snapshotDate: expect.any(String),
      isTrackedVersion: true,
      versionNumber: 1,
      parentPresetId: baseId,
    });

    // Verify it was saved to local storage
    const stored = await presetService.fetchPresets(userId);
    const storedSnapshot = stored.find((p) => p.id === snapshot?.id);
    expect(storedSnapshot).toBeDefined();

    // Verify it mimics the base preset data
    expect(storedSnapshot?.name).toBe('My Product');

    // Verify it was "synced" (upsert called)
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('presets');
    expect(chain.upsert).toHaveBeenCalled();
  });

  it('should auto-increment snapshot version numbers', async () => {
    const baseId = 'base-inc';
    const basePreset = createBasePreset(baseId, 'Product Inc');
    await presetService.savePreset(basePreset);

    // --- Create 1st Snapshot ---
    // Mock DB returning no versions
    const chain = mockSupabaseClient.from();
    chain.limit.mockResolvedValueOnce({ data: [] });

    const snap1 = await presetService.createSnapshot(baseId);
    expect(snap1?.snapshotMetadata?.versionNumber).toBe(1);

    // --- Create 2nd Snapshot ---
    // Mock DB returning version 1 exist
    chain.limit.mockResolvedValueOnce({
      data: [{ version_number: 1 }],
    });

    const snap2 = await presetService.createSnapshot(baseId);
    expect(snap2?.snapshotMetadata?.versionNumber).toBe(2);
    expect(snap2?.snapshotMetadata?.parentPresetId).toBe(baseId);

    // Verify local storage has both
    const stored = await presetService.fetchPresets(userId);
    const snapshots = stored.filter((p) => p.snapshotMetadata?.parentPresetId === baseId);
    expect(snapshots).toHaveLength(2);
    expect(snapshots.map((s) => s.snapshotMetadata?.versionNumber).sort()).toEqual([1, 2]);
  });

  it('should retrieve snapshots by parent_preset_id', async () => {
    const baseId = 'base-retrieve';
    const basePreset = createBasePreset(baseId, 'Product Retrieve');
    await presetService.savePreset(basePreset);

    // Manually inject snapshots into Local Storage to verify `getSnapshots`
    // We do this to ensure `getSnapshots` works even if createSnapshot fails (isolation)
    // But better to use the service methods to populate.

    // Create mocks for creation
    const chain = mockSupabaseClient.from();
    chain.limit.mockResolvedValue({ data: [] }); // Always say 0 exists remotely for creation flow in this test

    const s1 = await presetService.createSnapshot(baseId);
    // Force version 2 locally
    // (createSnapshot logic reads local to increment, so calling it again works)
    const s2 = await presetService.createSnapshot(baseId);

    expect(s1).toBeDefined();
    expect(s2).toBeDefined();

    // Now test retrieval
    // Mock Supabase returning these snapshots (simulating sync)
    // The service merges cloud data.
    const mockCloudSnapshots = [
        { ...s1 },
        { ...s2 }
    ];
    
    // We need to map these to DB format because service maps `fromDb`
    const dbSnapshots = mockCloudSnapshots.map(s => ({
        id: s?.id,
        user_id: s?.userId,
        name: s?.name,
        preset_type: s?.presetType,
        base_recipe: s?.baseRecipe,
        variants: s?.variants,
        pricing_config: s?.pricingConfig,
        created_at: s?.createdAt,
        updated_at: s?.updatedAt,
        snapshot_date: s?.snapshotMetadata?.snapshotDate,
        is_tracked_version: true,
        version_number: s?.snapshotMetadata?.versionNumber,
        parent_preset_id: s?.snapshotMetadata?.parentPresetId
    }));

    // Mock the getSnapshots DB call
    // supabase.from('presets').select('*').eq('parent_preset_id', ...).eq(...).order(...)
    chain.order.mockResolvedValueOnce({ data: dbSnapshots, error: null });

    const retrieved = await presetService.getSnapshots(baseId);

    expect(retrieved).toHaveLength(2);
    expect(retrieved[0].snapshotMetadata?.parentPresetId).toBe(baseId);
    expect(retrieved[1].snapshotMetadata?.parentPresetId).toBe(baseId);

    // Verify sorting (service sorts by version)
    expect(retrieved[0].snapshotMetadata?.versionNumber).toBe(1);
    expect(retrieved[1].snapshotMetadata?.versionNumber).toBe(2);
  });
});
