import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCalculatorState } from './useCalculatorState';
import { usePresets } from './use-presets';
import type { Preset } from '../types/calculator';

// Mock dependencies
vi.mock('./use-presets', () => ({
  usePresets: vi.fn(),
}));

// Mock sessionStorage
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
vi.stubGlobal('sessionStorage', storageMock);

describe('useCalculatorState Regression', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageMock.clear();
    (usePresets as any).mockReturnValue({
      presets: [],
      addPreset: vi.fn(),
      deletePreset: vi.fn(),
    });
  });

  it('should handle loading a preset with missing baseRecipe', async () => {
    const { result } = renderHook(() => useCalculatorState());

    const malformedPreset = {
      id: 'p1',
      name: 'Bad Preset',
      presetType: 'default',
      pricingConfig: { strategy: 'margin', value: 25 },
      // baseRecipe missing
    } as unknown as Preset;

    act(() => {
      result.current.loadPreset(malformedPreset);
    });

    // Should not crash and should use default values for input
    expect(result.current.input.productName).toBe('');
    expect(result.current.input.batchSize).toBe(1);
    expect(result.current.config.strategy).toBe('margin');
    expect(result.current.config.value).toBe(25);
  });
});
