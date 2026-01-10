import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalculatorState } from './useCalculatorState';
import { usePresets } from './use-presets';
import type { Preset } from '../types/calculator';

vi.mock('./use-presets');

describe('useCalculatorState Soft-Apply', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
    vi.mocked(usePresets).mockReturnValue({
      presets: [],
      addPreset: vi.fn(),
      updatePreset: vi.fn(),
      deletePreset: vi.fn(),
      getPreset: vi.fn(),
      getAllPresets: vi.fn(),
      syncStatus: 'synced',
      setIsSyncBlocked: vi.fn(),
      error: null,
      refresh: vi.fn(),
    } as ReturnType<typeof usePresets>);
  });

  it('should enter preview mode when applying strategy', () => {
    const { result } = renderHook(() => useCalculatorState());

    act(() => {
      result.current.updateConfig({ strategy: 'markup', value: 50 });
    });

    expect(result.current.isPreviewMode).toBe(false);

    act(() => {
      result.current.applyStrategy(25);
    });

    expect(result.current.isPreviewMode).toBe(true);
    expect(result.current.config.strategy).toBe('margin');
    expect(result.current.config.value).toBe(25);
  });

  it('should discard preview and revert to original config', () => {
    const { result } = renderHook(() => useCalculatorState());

    act(() => {
      result.current.updateConfig({ strategy: 'markup', value: 50 });
    });

    act(() => {
      result.current.applyStrategy(25);
    });

    expect(result.current.config.value).toBe(25);

    act(() => {
      result.current.discardPreview();
    });

    expect(result.current.isPreviewMode).toBe(false);
    expect(result.current.config.strategy).toBe('markup');
    expect(result.current.config.value).toBe(50);
  });

  it('should commit preview and keep changes', () => {
    const { result } = renderHook(() => useCalculatorState());

    act(() => {
      result.current.updateConfig({ strategy: 'markup', value: 50 });
    });

    act(() => {
      result.current.applyStrategy(25);
    });

    act(() => {
      result.current.commitPreview();
    });

    expect(result.current.isPreviewMode).toBe(false);
    expect(result.current.config.strategy).toBe('margin');
    expect(result.current.config.value).toBe(25);
  });

  it('should reset preview mode on reset', () => {
    const { result } = renderHook(() => useCalculatorState());

    act(() => {
      result.current.applyStrategy(25);
    });

    expect(result.current.isPreviewMode).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isPreviewMode).toBe(false);
  });

  it('should reset preview mode when loading a preset', () => {
    const { result } = renderHook(() => useCalculatorState());

    act(() => {
      result.current.applyStrategy(25);
    });

    const mockPreset = {
      id: '1',
      name: 'Loaded Preset',
      baseRecipe: { productName: 'Product', batchSize: 1, ingredients: [], laborCost: 0, overhead: 0 },
      pricingConfig: { strategy: 'markup', value: 40 },
      updatedAt: new Date().toISOString(),
    } as Preset;

    act(() => {
      result.current.loadPreset(mockPreset);
    });

    expect(result.current.isPreviewMode).toBe(false);
    expect(result.current.config.value).toBe(40);
  });
});
