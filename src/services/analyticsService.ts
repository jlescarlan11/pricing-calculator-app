import { supabase } from '../lib/supabase';
import type { AnalyticsEventType } from '../types';

export const analyticsService = {
  /**
   * Tracks a generic analytics event.
   * Fire-and-forget implementation to ensure no impact on core application performance.
   */
  async trackEvent(
    userId: string,
    presetId: string,
    eventType: AnalyticsEventType,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    if (!navigator.onLine || !userId) return;

    try {
      const { error } = await supabase
        .from('analytics')
        .insert({
          user_id: userId,
          preset_id: presetId,
          event_type: eventType,
          metadata,
        });

      if (error) {
        // Silent fail for analytics to not disturb user flow
        console.debug('[Analytics] Failed to track event:', error.message);
      }
    } catch (e) {
      console.debug('[Analytics] Unexpected error tracking event:', e);
    }
  },

  /**
   * Specifically tracks when a user clicks to analyze a preset.
   */
  async trackAnalysisClick(userId: string, presetId: string): Promise<void> {
    return this.trackEvent(userId, presetId, 'click', {
      context: 'preset_analysis',
      source: 'preset_list',
    });
  },
};
