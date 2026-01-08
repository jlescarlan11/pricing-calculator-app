import { describe, it, expect, vi, beforeEach } from 'vitest';
import { presetService } from '../services/presetService';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('SimpleGateCheck - Analytics Integrity', () => {
  let db: { presets: string[]; analytics: { id: string; preset_id: string }[] };

  beforeEach(() => {
    db = {
      presets: ['preset-1'],
      analytics: [
        { id: 'a1', preset_id: 'preset-1' },
        { id: 'a2', preset_id: 'preset-1' },
        { id: 'a3', preset_id: 'preset-2' },
      ],
    };

    vi.clearAllMocks();
    vi.stubGlobal('navigator', { onLine: true });

    // Mock local storage
    const store: Record<string, string> = {
      pricing_calculator_presets: JSON.stringify([{ id: 'preset-1', name: 'Test', userId: 'user-1' }]),
    };
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
    });

    // Mock implementation for Supabase that simulates ON DELETE CASCADE
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation((table: string) => ({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation((column: string, value: string) => {
        if (table === 'presets' && column === 'id') {
          db.presets = db.presets.filter((id) => id !== value);
          // Simulate DB Cascade: Purge analytics where preset_id matches
          db.analytics = db.analytics.filter((a) => a.preset_id !== value);
        }
        return Promise.resolve({ error: null });
      }),
    }));
  });

  it('confirms that deleting a preset purges associated analytics via simulated cascade', async () => {
    const presetId = 'preset-1';
    const userId = 'user-1';

    // Verify initial state
    expect(db.presets).toContain(presetId);
    expect(db.analytics.filter((a) => a.preset_id === presetId)).toHaveLength(2);

    // Act
    await presetService.deletePreset(presetId, userId);

    // Verify parent deletion call
    expect(supabase.from).toHaveBeenCalledWith('presets');

    // Verify state after deletion (simulated cascade)
    expect(db.presets).not.toContain(presetId);
    expect(db.analytics.filter((a) => a.preset_id === presetId)).toHaveLength(0);

    // Verify referential integrity: Unrelated records remain
    expect(db.analytics.filter((a) => a.preset_id === 'preset-2')).toHaveLength(1);
  });

  it('verifies referential integrity during bulk deletion', async () => {
    const userId = 'user-1';
    db.presets = ['p1', 'p2', 'p3'];
    db.analytics = [
      { id: 'a1', preset_id: 'p1' },
      { id: 'a2', preset_id: 'p2' },
      { id: 'a3', preset_id: 'p3' },
    ];

    // Mock bulk delete implementation
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation((table: string) => ({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation((column: string, value: string) => {
        if (table === 'presets' && column === 'user_id' && value === userId) {
          db.presets = [];
          db.analytics = [];
        }
        return Promise.resolve({ error: null });
      }),
    }));

    await presetService.deleteAllPresets(userId);

    expect(db.presets).toHaveLength(0);
    expect(db.analytics).toHaveLength(0);
  });
});