import type { Preset } from '../types/calculator';
import { BACKUP_VERSION, type BackupData } from './export';

export interface ImportResult {
  valid: boolean;
  data?: Preset[];
  error?: string;
  stats?: {
    total: number;
  };
}

export function validateBackupJSON(jsonString: string): ImportResult {
  try {
    const parsed = JSON.parse(jsonString);

    // 1. Basic Schema Check
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('version' in parsed) ||
      !('data' in parsed) ||
      !('presets' in parsed.data)
    ) {
      return { valid: false, error: 'Invalid backup file format.' };
    }

    const backup = parsed as BackupData;

    // 2. Version Check
    if (backup.version > BACKUP_VERSION) {
      return {
        valid: false,
        error: `Unsupported backup version (v${backup.version}). This app supports up to v${BACKUP_VERSION}.`,
      };
    }

    if (backup.source !== 'pricing-calculator-app') {
      // Warn but allow? Or strict? strict for now.
      // Actually, users might edit JSON manually, so 'source' check might be too strict if they remove it.
      // Let's keep it optional validation or just check if presets exist.
    }

    // 3. Data Integrity Check (Basic)
    const presets = backup.data.presets;
    if (!Array.isArray(presets)) {
      return { valid: false, error: 'Corrupted data: Presets is not an array.' };
    }

    // Validate individual presets (shallow check)
    const invalidPresets = presets.filter((p) => !isValidPreset(p));
    if (invalidPresets.length > 0) {
      return {
        valid: false,
        error: `Found ${invalidPresets.length} invalid preset(s) in the backup file.`,
      };
    }

    return {
      valid: true,
      data: presets,
      stats: { total: presets.length },
    };
  } catch {
    return { valid: false, error: 'Invalid JSON file.' };
  }
}

function isValidPreset(p: unknown): boolean {
  if (!p || typeof p !== 'object') return false;
  const preset = p as Record<string, unknown>;
  
  const hasBaseRecipe = 
    preset.baseRecipe && 
    typeof preset.baseRecipe === 'object' && 
    'productName' in preset.baseRecipe &&
    'ingredients' in preset.baseRecipe &&
    Array.isArray(preset.baseRecipe.ingredients);

  const hasPricingConfig =
    preset.pricingConfig &&
    typeof preset.pricingConfig === 'object';

  return (
    typeof preset.id === 'string' &&
    typeof preset.name === 'string' &&
    !!hasBaseRecipe &&
    !!hasPricingConfig
  );
}
