import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePresets } from './use-presets';
import type { CalculationInput, PricingConfig } from '../types';

const mockInput: CalculationInput = {
  productName: 'Test Product',
  batchSize: 10,
  ingredients: [],
  laborCost: 100,
  overhead: 50,
};

const mockConfig: PricingConfig = {
  strategy: 'markup',
  value: 50,
};

describe('usePresets', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with an empty array', () => {
    const { result } = renderHook(() => usePresets());
    expect(result.current.presets).toEqual([]);
  });

  it('should add a preset', async () => {
    const { result } = renderHook(() => usePresets());
    
    let addedPreset;
    await act(async () => {
      addedPreset = await result.current.addPreset({
        name: 'New Preset',
        input: mockInput,
        config: mockConfig,
      });
    });

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe('New Preset');
    expect(result.current.presets[0].id).toBeDefined();
    expect(result.current.presets[0].lastModified).toBeDefined();
    expect(addedPreset).toEqual(result.current.presets[0]);
  });

  it('should update a preset and refresh lastModified', async () => {
    const { result } = renderHook(() => usePresets());
    
    let id = '';
    let initialModified = 0;
    await act(async () => {
      const added = await result.current.addPreset({
        name: 'Original Name',
        input: mockInput,
        config: mockConfig,
      });
      id = added.id;
      initialModified = added.lastModified;
    });

    // Ensure some time passes for lastModified change
    vi.advanceTimersByTime(100);

    await act(async () => {
      await result.current.updatePreset(id, { name: 'Updated Name' });
    });

    expect(result.current.presets[0].name).toBe('Updated Name');
    expect(result.current.presets[0].lastModified).toBeGreaterThan(initialModified);
  });

  it('should delete a preset', async () => {
    const { result } = renderHook(() => usePresets());
    
    let id = '';
    await act(async () => {
      const added = await result.current.addPreset({
        name: 'To Be Deleted',
        input: mockInput,
        config: mockConfig,
      });
      id = added.id;
    });

    expect(result.current.presets).toHaveLength(1);

    await act(async () => {
      const deleted = await result.current.deletePreset(id);
      expect(deleted).toBe(true);
    });

    expect(result.current.presets).toHaveLength(0);
  });

  it('should get a preset by ID', async () => {
    const { result } = renderHook(() => usePresets());
    
    let id = '';
    await act(async () => {
      const added = await result.current.addPreset({
        name: 'Target Preset',
        input: mockInput,
        config: mockConfig,
      });
      id = added.id;
    });

    const found = result.current.getPreset(id);
    expect(found?.name).toBe('Target Preset');
    
    const notFound = result.current.getPreset('non-existent');
    expect(notFound).toBeUndefined();
  });

  it('should get all presets', async () => {
    const { result } = renderHook(() => usePresets());
    
    await act(async () => {
      await result.current.addPreset({ name: 'P1', input: mockInput, config: mockConfig });
      await result.current.addPreset({ name: 'P2', input: mockInput, config: mockConfig });
    });

    expect(result.current.getAllPresets()).toHaveLength(2);
    expect(result.current.getAllPresets()).toEqual(result.current.presets);
  });
});
