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

  it('should add a preset', () => {
    const { result } = renderHook(() => usePresets());
    
    let addedPreset;
    act(() => {
      addedPreset = result.current.addPreset({
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

  it('should update a preset and refresh lastModified', () => {
    const { result } = renderHook(() => usePresets());
    
    let id = '';
    let initialModified = 0;
    act(() => {
      const added = result.current.addPreset({
        name: 'Original Name',
        input: mockInput,
        config: mockConfig,
      });
      id = added.id;
      initialModified = added.lastModified;
    });

    // Ensure some time passes for lastModified change
    vi.advanceTimersByTime(100);

    act(() => {
      result.current.updatePreset(id, { name: 'Updated Name' });
    });

    expect(result.current.presets[0].name).toBe('Updated Name');
    expect(result.current.presets[0].lastModified).toBeGreaterThan(initialModified);
  });

  it('should delete a preset after confirmation', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { result } = renderHook(() => usePresets());
    
    let id = '';
    act(() => {
      const added = result.current.addPreset({
        name: 'To Be Deleted',
        input: mockInput,
        config: mockConfig,
      });
      id = added.id;
    });

    expect(result.current.presets).toHaveLength(1);

    act(() => {
      const deleted = result.current.deletePreset(id);
      expect(deleted).toBe(true);
    });

    expect(result.current.presets).toHaveLength(0);
    expect(confirmSpy).toHaveBeenCalled();
  });

  it('should not delete a preset if not confirmed', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { result } = renderHook(() => usePresets());
    
    let id = '';
    act(() => {
      const added = result.current.addPreset({
        name: 'Stayin Alive',
        input: mockInput,
        config: mockConfig,
      });
      id = added.id;
    });

    act(() => {
      const deleted = result.current.deletePreset(id);
      expect(deleted).toBe(false);
    });

    expect(result.current.presets).toHaveLength(1);
    expect(confirmSpy).toHaveBeenCalled();
  });

  it('should get a preset by ID', () => {
    const { result } = renderHook(() => usePresets());
    
    let id = '';
    act(() => {
      const added = result.current.addPreset({
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

  it('should get all presets', () => {
    const { result } = renderHook(() => usePresets());
    
    act(() => {
      result.current.addPreset({ name: 'P1', input: mockInput, config: mockConfig });
      result.current.addPreset({ name: 'P2', input: mockInput, config: mockConfig });
    });

    expect(result.current.getAllPresets()).toHaveLength(2);
    expect(result.current.getAllPresets()).toEqual(result.current.presets);
  });
});
