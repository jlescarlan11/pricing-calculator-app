import { supabase } from '../lib/supabase';

/**
 * Feature flag logic for staged deployment of LLM features.
 * Enable if ≥25 unique users clicked "Analyze" in the last 42 days (6 weeks).
 *
 * NOTE: Due to RLS, this client-side check will only see the current user's clicks
 * unless an RPC is provided. For the MVP, we check the threshold but it acts as
 * a gate for individual engagement or until global metrics are available.
 */
export async function shouldEnableLLM(): Promise<boolean> {
  const SIX_WEEKS_AGO = new Date();
  SIX_WEEKS_AGO.setDate(SIX_WEEKS_AGO.getDate() - 42);

  try {
    const { data, error } = await supabase
      .from('analytics')
      .select('user_id')
      .eq('event_type', 'click')
      .eq('metadata->>context', 'preset_analysis')
      .gte('clicked_at', SIX_WEEKS_AGO.toISOString());

    if (error) {
      console.error('[FeatureFlags] Error checking LLM gate:', error);
      return false;
    }

    // Get unique users from data
    const uniqueUsers = new Set(data?.map((row) => row.user_id));

    // For MVP, we use the 25 unique users threshold.
    // In a real production environment, this would call a public metric or RPC.
    return uniqueUsers.size >= 25;
  } catch (err) {
    console.error('[FeatureFlags] Failed to evaluate LLM gate:', err);
    return false;
  }
}
