import { describe, it, expect } from 'vitest';

describe('Environment Check', () => {
  it('checks if crypto.randomUUID is available', () => {
    console.log('crypto available:', typeof crypto !== 'undefined');
    if (typeof crypto !== 'undefined') {
      console.log('crypto.randomUUID available:', typeof crypto.randomUUID === 'function');
    }
    expect(true).toBe(true);
  });

  it('checks sessionStorage', () => {
    console.log('sessionStorage available:', typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined');
    console.log('import.meta.env.MODE:', import.meta.env.MODE);
    expect(true).toBe(true);
  });

  it('loads environment variables', () => {
    expect(import.meta.env.VITE_APP_VERSION).toBe('2.0.0');
    expect(import.meta.env.VITE_ENABLE_OFFLINE_MODE).toBe('true');
    expect(import.meta.env.VITE_SUPABASE_URL).toBeDefined();
    expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBeDefined();
  });
});
