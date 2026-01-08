export const ANALYSIS_LIMIT_KEY = 'pricing_analysis_usage';
export const DAILY_LIMIT = 5;

export interface UsageData {
  count: number;
  lastReset: string;
}

export const checkRateLimit = (): { allowed: boolean; remaining: number } => {
  const stored = localStorage.getItem(ANALYSIS_LIMIT_KEY);
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  if (!stored) {
    return { allowed: true, remaining: DAILY_LIMIT };
  }

  try {
    const data: UsageData = JSON.parse(stored);
    if (data.lastReset !== today) {
      return { allowed: true, remaining: DAILY_LIMIT };
    }

    return {
      allowed: data.count < DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - data.count),
    };
  } catch (e) {
    console.warn('[RateLimit] Failed to parse usage data, resetting.', e);
    return { allowed: true, remaining: DAILY_LIMIT };
  }
};

export const incrementUsage = (): void => {
  const stored = localStorage.getItem(ANALYSIS_LIMIT_KEY);
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  let data: UsageData = { count: 1, lastReset: today };

  if (stored) {
    try {
      const existing: UsageData = JSON.parse(stored);
      if (existing.lastReset === today) {
        data = { count: existing.count + 1, lastReset: today };
      }
    } catch (e) {
      console.warn('[RateLimit] Failed to parse usage data during increment, resetting.', e);
    }
  }

  localStorage.setItem(ANALYSIS_LIMIT_KEY, JSON.stringify(data));
};
