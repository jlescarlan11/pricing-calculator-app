import { presetsService as cloudService } from './presets.service';
import type { SavedPreset, PricingStrategy, TableRow, TableInsert } from '../../types';

// Re-export the new service and types
export * from './presets.service';

/**
 * UI-facing presets service that handles mapping between
 * database rows (Preset) and application models (SavedPreset).
 * Uses the underlying cloud-backed PresetsService for CRUD operations.
 */
export const presetsService = {
  /**
   * Fetch all presets for the current user
   */
  getPresets: async (): Promise<SavedPreset[]> => {
    const data = await cloudService.getAll();
    return data.map(mapDbToPreset);
  },

  /**
   * Save a new preset or update an existing one
   */
  savePreset: async (preset: SavedPreset) => {
    // If it has an ID and exists, we could use update, but upsert is handled by the old service.
    // The new service separates create and update.
    // To maintain compatibility with the old savePreset (which was an upsert), 
    // we'll check if it's an update or create.
    
    // Actually, the old mapPresetToDb didn't have user_id in its signature,
    // but the new service's create/update handle user_id automatically.
    
    // We'll use the new service's methods.
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

export function mapDbToPreset(dbRecord: TableRow<'presets'>): SavedPreset {
  return {
    id: dbRecord.id,
    name: dbRecord.name,
    lastModified: dbRecord.updated_at ? new Date(dbRecord.updated_at).getTime() : Date.now(),
    created_at: dbRecord.created_at || undefined,
    last_synced_at: dbRecord.last_synced_at || undefined,
    input: {
      productName: dbRecord.name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ingredients: (dbRecord.ingredients as any) || [],
      laborCost: Number(dbRecord.labor_cost) || 0,
      overhead: Number(dbRecord.overhead_cost) || 0,
      batchSize: Number(dbRecord.batch_size) || 1,
      currentSellingPrice: dbRecord.current_selling_price ? Number(dbRecord.current_selling_price) : undefined,
    },
    config: {
      strategy: (dbRecord.pricing_strategy as PricingStrategy) || 'markup',
      value: Number(dbRecord.pricing_value) || 0,
    },
  };
}

export function mapPresetToDbInsert(preset: SavedPreset): Omit<TableInsert<'presets'>, 'user_id' | 'created_at' | 'updated_at' | 'last_synced_at'> {
  return {
    id: preset.id,
    name: preset.name,
    preset_type: 'single',
    batch_size: preset.input.batchSize,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ingredients: preset.input.ingredients as any,
    labor_cost: preset.input.laborCost,
    overhead_cost: preset.input.overhead,
    current_selling_price: preset.input.currentSellingPrice,
    pricing_strategy: preset.config.strategy,
    pricing_value: preset.config.value,
  };
}

export function mapPresetToDbUpdate(preset: SavedPreset): Omit<TableInsert<'presets'>, 'user_id' | 'id' | 'created_at' | 'updated_at' | 'last_synced_at'> {
  return {
    name: preset.name,
    preset_type: 'single',
    batch_size: preset.input.batchSize,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ingredients: preset.input.ingredients as any,
    labor_cost: preset.input.laborCost,
    overhead_cost: preset.input.overhead,
    current_selling_price: preset.input.currentSellingPrice,
    pricing_strategy: preset.config.strategy,
    pricing_value: preset.config.value,
  };
}