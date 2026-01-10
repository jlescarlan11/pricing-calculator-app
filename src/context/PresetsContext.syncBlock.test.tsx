import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import React from 'react';
import { PresetsProvider, usePresetsContext } from './PresetsContext';
import { presetService } from '../services/presetService';
import { AuthProvider } from './AuthContext';
import type { CalculationInput, PricingConfig, Preset } from '../types/calculator';

vi.mock('../services/presetService');
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
    },
  },
}));

const TestComponent = () => {
  const { isSyncBlocked, setIsSyncBlocked, updatePreset, presets, addPreset } = usePresetsContext();
  return (
    <div>
      <div data-testid="is-blocked">{isSyncBlocked ? 'yes' : 'no'}</div>
      <button onClick={() => setIsSyncBlocked(true)}>Block</button>
      <button onClick={() => setIsSyncBlocked(false)}>Unblock</button>
      <button onClick={() => updatePreset('1', { name: 'Updated' })}>Update</button>
      <button onClick={() => addPreset({ 
        name: 'New', 
        baseRecipe: {} as CalculationInput, 
        pricingConfig: {} as PricingConfig, 
        presetType: 'default', 
        variants: [], 
        competitors: [] 
      })}>Add</button>
      <div data-testid="presets-count">{presets.length}</div>
    </div>
  );
};

describe('PresetsContext Sync Blocking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(presetService.fetchPresets).mockResolvedValue([{ id: '1', name: 'Original' } as Preset]);
    vi.mocked(presetService.syncPendingItems).mockResolvedValue(undefined as void);
    vi.mocked(presetService.savePreset).mockResolvedValue(undefined as void);
    vi.mocked(presetService.createSnapshot).mockResolvedValue({ id: 's1' } as Preset);
  });

  it('should block sync when isSyncBlocked is true', async () => {
    render(
      <AuthProvider>
        <PresetsProvider>
          <TestComponent />
        </PresetsProvider>
      </AuthProvider>
    );

    // Wait for initial load
    await waitFor(() => expect(screen.getByTestId('presets-count')).toHaveTextContent('1'));

    // Block sync
    act(() => {
      screen.getByText('Block').click();
    });
    expect(screen.getByTestId('is-blocked')).toHaveTextContent('yes');

    // Attempt update
    act(() => {
      screen.getByText('Update').click();
    });

    // Check that presetService.savePreset was NOT called
    expect(presetService.savePreset).not.toHaveBeenCalled();
  });

  it('should allow sync when isSyncBlocked is false', async () => {
    render(
      <AuthProvider>
        <PresetsProvider>
          <TestComponent />
        </PresetsProvider>
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('presets-count')).toHaveTextContent('1'));

    // Attempt update (blocked by default is false)
    await act(async () => {
      screen.getByText('Update').click();
    });

    // Check that presetService.savePreset WAS called
    expect(presetService.savePreset).toHaveBeenCalled();
  });
});
