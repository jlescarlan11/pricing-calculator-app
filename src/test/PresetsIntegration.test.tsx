import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePresets } from '../hooks/use-presets';
import { PresetsProvider } from '../context/PresetsContext';
import { AuthProvider } from '../context/AuthContext';

// Mock dependencies to focus on state synchronization
vi.mock('../services/presetService', () => ({
  presetService: {
    fetchPresets: vi.fn().mockResolvedValue([]),
    savePreset: vi.fn().mockImplementation((p) => Promise.resolve(p)),
    deletePreset: vi.fn().mockResolvedValue(undefined),
    syncPendingItems: vi.fn().mockResolvedValue(undefined),
    createSnapshot: vi.fn().mockResolvedValue(null),
  },
}));

// Component A: Checks for name availability (simulating SavePresetModal)
const NameChecker = () => {
  const { presets } = usePresets();
  const nameToCheck = 'Test Preset';
  const isTaken = presets.some((p) => p.name === nameToCheck);

  return (
    <div data-testid="name-checker">
      Status: {isTaken ? 'Taken' : 'Available'}
    </div>
  );
};

// Component B: Manages presets (simulating PresetsList or CalculatorForm)
const PresetManager = () => {
  const { addPreset, deletePreset, presets } = usePresets();

  const handleAdd = async () => {
    await addPreset({
      name: 'Test Preset',
      baseRecipe: { productName: 'Test Preset', batchSize: 1, ingredients: [], laborCost: 0, overhead: 0, hasVariants: false, variants: [] },
      pricingConfig: { strategy: 'markup', value: 50 },
      presetType: 'default',
      variants: [],
    });
  };

  const handleDelete = async () => {
    const preset = presets.find((p) => p.name === 'Test Preset');
    if (preset) {
      await deletePreset(preset.id);
    }
  };

  return (
    <div>
      <button onClick={handleAdd}>Add Preset</button>
      <button onClick={handleDelete}>Delete Preset</button>
    </div>
  );
};

const TestApp = () => (
  <AuthProvider>
    <PresetsProvider>
      <NameChecker />
      <PresetManager />
    </PresetsProvider>
  </AuthProvider>
);

describe('Presets Context Synchronization', () => {
  it('updates name availability immediately across components when a preset is deleted', async () => {
    render(<TestApp />);

    // Initial state: Available
    expect(screen.getByTestId('name-checker')).toHaveTextContent('Status: Available');

    // 1. Add Preset
    fireEvent.click(screen.getByText('Add Preset'));
    await waitFor(() => {
      expect(screen.getByTestId('name-checker')).toHaveTextContent('Status: Taken');
    });

    // 2. Delete Preset
    fireEvent.click(screen.getByText('Delete Preset'));
    
    // The Bug: If state isn't shared, this might fail or timeout
    await waitFor(() => {
      expect(screen.getByTestId('name-checker')).toHaveTextContent('Status: Available');
    });
  });
});
