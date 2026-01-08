import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsService } from './analyticsService';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('navigator', { onLine: true });

    // Setup default mock implementation
    const mockInsert = vi.fn().mockReturnValue(Promise.resolve({ error: null }));
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      insert: mockInsert,
    });
  });

  describe('trackEvent', () => {
    it('should call supabase insert with correct parameters', async () => {
      const userId = 'user-123';
      const presetId = 'preset-456';
      const eventType = 'click';
      const metadata = { foo: 'bar' };

      const mockInsert = vi.fn().mockReturnValue(Promise.resolve({ error: null }));
      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: mockInsert,
      });

      await analyticsService.trackEvent(userId, presetId, eventType, metadata);

      expect(supabase.from).toHaveBeenCalledWith('analytics');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: userId,
        preset_id: presetId,
        event_type: eventType,
        metadata,
      });
    });

    it('should handle supabase errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        insert: vi.fn().mockReturnValue(Promise.resolve({ error: { message: 'DB Error' } })),
      });

      await analyticsService.trackEvent('u', 'p', 'click');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to track event'), 'DB Error');
      consoleSpy.mockRestore();
    });

    it('should handle unexpected exceptions gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('Crash');
      });

      await analyticsService.trackEvent('u', 'p', 'click');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unexpected error tracking event'), expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should not track if navigator is offline', async () => {
      vi.stubGlobal('navigator', { onLine: false });

      await analyticsService.trackEvent('u', 'p', 'click');

      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should not track if userId is missing', async () => {
      await analyticsService.trackEvent('', 'p', 'click');

      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('trackAnalysisClick', () => {
    it('should call trackEvent with specific analysis click metadata', async () => {
      const trackSpy = vi.spyOn(analyticsService, 'trackEvent');

      await analyticsService.trackAnalysisClick('user-1', 'preset-1');

      expect(trackSpy).toHaveBeenCalledWith('user-1', 'preset-1', 'click', {
        context: 'preset_analysis',
        source: 'preset_list',
      });
    });
  });
});
