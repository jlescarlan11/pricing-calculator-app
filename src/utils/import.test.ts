import { describe, it, expect } from 'vitest';
import { validateBackupJSON } from './import';
import { BACKUP_VERSION } from './export';

describe('import utils', () => {
  it('validates a correct backup file', () => {
    const validJson = JSON.stringify({
      version: BACKUP_VERSION,
      source: 'pricing-calculator-app',
      data: {
        presets: [
          {
            id: '1',
            name: 'Test',
            presetType: 'default',
            baseRecipe: {},
            pricingConfig: {},
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
          },
        ],
      },
    });

    const result = validateBackupJSON(validJson);
    expect(result.valid).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].id).toBe('1');
  });

  it('rejects invalid JSON', () => {
    const result = validateBackupJSON('{ invalid json');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid JSON');
  });

  it('rejects missing version', () => {
    const result = validateBackupJSON(JSON.stringify({ data: { presets: [] } }));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid backup file format');
  });

  it('rejects unsupported version', () => {
    const result = validateBackupJSON(
      JSON.stringify({
        version: BACKUP_VERSION + 1,
        data: { presets: [] },
      })
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unsupported backup version');
  });

  it('rejects non-array presets', () => {
    const result = validateBackupJSON(
      JSON.stringify({
        version: BACKUP_VERSION,
        data: { presets: 'not-an-array' },
      })
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Corrupted data');
  });
});
