import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { presetService } from './presetService';
import type { Preset } from '../types';

// Mock Supabase
const mockUpsert = vi.fn();
// Make upsert return a Promise that also has a select() method
mockUpsert.mockImplementation(() => {
  const p: any = Promise.resolve({ error: null });
  p.select = vi.fn(() => ({
    single: vi.fn().mockResolvedValue({ 
      data: { 
        id: 'mock-comp-id', 
        preset_id: 'new-uuid-123',
        competitor_name: 'Rival',
        competitor_price: 100 
      }, 
      error: null 
    })
  }));
  return p;
});

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      delete: vi.fn().mockResolvedValue({ error: null }),
      upsert: mockUpsert,
    })),
  },
}));

describe('presetService.createSnapshot', () => {
  const mockDate = '2026-01-08T12:00:00.000Z';
  const basePresetId = 'base-123';
  
  const basePreset: Preset = {
    id: basePresetId,
    name: 'Base Product',
    userId: 'user-1',
    presetType: 'default',
    baseRecipe: { productName: 'Base', batchSize: 1, ingredients: [], laborCost: 0, overhead: 0, hasVariants: false, variants: [] },
    variants: [],
    pricingConfig: { strategy: 'markup', value: 50 },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    competitors: [
      { id: 'comp-1', presetId: basePresetId, competitorName: 'Rival', competitorPrice: 100, notes: '', createdAt: '', updatedAt: '' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Date
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockDate));

    // Mock localStorage
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => { store[key] = value; }),
      removeItem: vi.fn((key) => { delete store[key]; }),
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
    expect(mockUpsert).toHaveBeenCalledTimes(2); // 1 for preset, 1 for competitor
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
        parentPresetId: basePresetId
      }
    };

    localStorage.setItem('pricing_calculator_presets', JSON.stringify([basePreset, existingSnapshot]));

    const result = await presetService.createSnapshot(basePresetId);
    
    expect(result?.snapshotMetadata?.versionNumber).toBe(3);
  });
});