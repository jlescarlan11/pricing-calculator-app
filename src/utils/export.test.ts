import { describe, it, expect } from 'vitest';
import { generateBackupJSON, BACKUP_VERSION } from './export';
import type { Preset } from '../types/calculator';

describe('export utils', () => {
  it('generateBackupJSON creates correct structure', () => {
    const mockPresets: Preset[] = [
      {
        id: '1',
        name: 'Test',
        presetType: 'default',
        baseRecipe: {} as unknown as Preset['baseRecipe'],
        variants: [],
        pricingConfig: {} as unknown as Preset['pricingConfig'],
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      },
    ];

    const json = generateBackupJSON(mockPresets);
    const parsed = JSON.parse(json);

    expect(parsed.version).toBe(BACKUP_VERSION);
    expect(parsed.source).toBe('pricing-calculator-app');
    expect(parsed.timestamp).toBeDefined();
    expect(parsed.data.presets).toHaveLength(1);
    expect(parsed.data.presets[0].id).toBe('1');
  });
});
