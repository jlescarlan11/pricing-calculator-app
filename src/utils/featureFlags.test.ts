import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { shouldEnableLLM } from './featureFlags';
import { supabase } from '../lib/supabase';

// Mock supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('shouldEnableLLM', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true if at least 25 unique users have clicked Analyze', async () => {
    // Mock 25 unique users
    const mockData = Array.from({ length: 25 }, (_, i) => ({ user_id: `user-${i}` }));

    (supabase.from as Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    }));

    const result = await shouldEnableLLM();
    expect(result).toBe(true);
  });

  it('returns false if fewer than 25 unique users have clicked Analyze', async () => {
    // Mock 24 unique users
    const mockData = Array.from({ length: 24 }, (_, i) => ({ user_id: `user-${i}` }));

    (supabase.from as Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    }));

    const result = await shouldEnableLLM();
    expect(result).toBe(false);
  });

  it('returns false if multiple clicks are from the same 25 users (non-unique check)', async () => {
    // 50 clicks but only 10 unique users
    const mockData = Array.from({ length: 50 }, (_, i) => ({ user_id: `user-${i % 10}` }));

    (supabase.from as Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    }));

    const result = await shouldEnableLLM();
    expect(result).toBe(false);
  });

  it('returns false if there is a database error', async () => {
    (supabase.from as Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } }),
    }));

    const result = await shouldEnableLLM();
    expect(result).toBe(false);
  });

  it('returns false if no data is returned', async () => {
    (supabase.from as Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ data: [], error: null }),
    }));

    const result = await shouldEnableLLM();
    expect(result).toBe(false);
  });
});
