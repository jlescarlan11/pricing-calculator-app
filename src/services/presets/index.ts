import { presetsService as cloudService } from './presets.service';
import type { SavedPreset, PricingStrategy, TableRow, TableInsert, Preset, VariantInput } from '../../types';

// Re-export the new service and types
export * from './presets.service';

/**
 * UI-facing presets service that handles mapping between
 * database rows (Preset) and application models (SavedPreset | Preset).
 * Uses the underlying cloud-backed PresetsService for CRUD operations.
 */
export const presetsService = {
  /**
   * Fetch all presets for the current user
   */
  getPresets: async (): Promise<(SavedPreset | Preset)[]> => {
    const data = await cloudService.getAll();
    return data.map(mapDbToPreset);
  },

  /**
   * Save a new preset or update an existing one
   */
  savePreset: async (preset: SavedPreset | Preset) => {
    try {
      // Try to get by ID to see if it exists
      await cloudService.getById(preset.id);
      
      // If it exists, update it
      const dbUpdates = mapPresetToDbUpdate(preset);
      const data = await cloudService.update(preset.id, dbUpdates);
      return mapDbToPreset(data);
    } catch {
      // If not found or other error (e.g. 404/ValidationError from getById)
      // we attempt to create it
      const dbInsert = mapPresetToDbInsert(preset);
      const data = await cloudService.create(dbInsert);
      return mapDbToPreset(data);
    }
  },

  /**
   * Delete a preset by ID
   */
  deletePreset: async (id: string) => {
    await cloudService.delete(id);
  },

  /**
   * Delete all presets for the current user
   */
  deleteAllPresets: async () => {
    await cloudService.deleteAll();
  },
};

// Mappers

export function mapDbToPreset(dbRecord: TableRow<'presets'>): SavedPreset | Preset {
  // We prefer the unified Preset structure if it matches the new schema
  // But we can also map to SavedPreset if needed for legacy compatibility.
  // For now, let's map to the unified Preset structure if possible, 
  // or fallback to SavedPreset if the UI expects that nested 'input' structure.
  
  // Actually, to support the unified model, we should return the flat Preset structure
  // if the record has the necessary fields.
  
  return {
    id: dbRecord.id,
    user_id: dbRecord.user_id,
    name: dbRecord.name,
    preset_type: (dbRecord.preset_type as 'single' | 'variants') || 'single',
    ingredients: (dbRecord.ingredients as any) || [],
    batch_size: Number(dbRecord.batch_size) || 0,
    labor_cost: Number(dbRecord.labor_cost) || 0,
    overhead_cost: Number(dbRecord.overhead_cost) || 0,
    variants: (dbRecord.variants as unknown as VariantInput[]) || [],
    pricing_strategy: (dbRecord.pricing_strategy as PricingStrategy) || 'markup',
    pricing_value: Number(dbRecord.pricing_value) || 50,
    current_selling_price: dbRecord.current_selling_price ? Number(dbRecord.current_selling_price) : null,
    created_at: dbRecord.created_at,
    updated_at: dbRecord.updated_at,
    last_synced_at: dbRecord.last_synced_at,
  };
}

export function mapPresetToDbInsert(preset: SavedPreset | Preset): Omit<TableInsert<'presets'>, 'user_id' | 'created_at' | 'updated_at' | 'last_synced_at'> {

  const p = preset as any;
  // Determine if it has variants.
  const variants = p.variants || p.input?.variants || [];
  const hasVariants = variants.length > 0;
  
  return {
    id: p.id,
    name: p.name,
    preset_type: hasVariants ? 'variants' : 'single',
    batch_size: p.batch_size || (p.input?.batchSize),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ingredients: (p.ingredients || p.input?.ingredients) as any,
    labor_cost: p.labor_cost || p.input?.laborCost,
    overhead_cost: p.overhead_cost || p.input?.overhead,
    variants: variants as any,
    pricing_strategy: p.pricing_strategy || p.config?.strategy || 'markup',
    pricing_value: p.pricing_value ?? p.config?.value ?? 50,
    current_selling_price: p.current_selling_price ?? p.input?.currentSellingPrice ?? null,
  };
}

export function mapPresetToDbUpdate(preset: SavedPreset | Preset): Omit<TableInsert<'presets'>, 'user_id' | 'id' | 'created_at' | 'updated_at' | 'last_synced_at'> {

  const p = preset as any;
  const variants = p.variants || p.input?.variants || [];
  const hasVariants = variants.length > 0;

  return {
    name: p.name,
    preset_type: hasVariants ? 'variants' : 'single',
    batch_size: p.batch_size || p.input?.batchSize,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ingredients: (p.ingredients || p.input?.ingredients) as any,
    labor_cost: p.labor_cost || p.input?.laborCost,
    overhead_cost: p.overhead_cost || p.input?.overhead,
    variants: variants as any,
    pricing_strategy: p.pricing_strategy || p.config?.strategy || 'markup',
    pricing_value: p.pricing_value ?? p.config?.value ?? 50,
    current_selling_price: p.current_selling_price ?? p.input?.currentSellingPrice ?? null,
  };
}

