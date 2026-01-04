import { supabase } from '../../services/supabase';
import type { SavedPreset, PricingStrategy, TableRow, TableInsert } from '../../types';

export const presetsService = {
  /**
   * Fetch all presets for the current user
   */
  getPresets: async (): Promise<SavedPreset[]> => {
    const { data, error } = await supabase
      .from('presets')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(mapDbToPreset);
  },

  /**
   * Save a new preset or update an existing one
   */
  savePreset: async (preset: SavedPreset) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const dbPreset = mapPresetToDb(preset, user.id);

    const { data, error } = await supabase
      .from('presets')
      .upsert(dbPreset)
      .select()
      .single();

    if (error) throw error;
    return mapDbToPreset(data);
  },

  /**
   * Delete a preset by ID
   */
  deletePreset: async (id: string) => {
    const { error } = await supabase
      .from('presets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Delete all presets for the current user
   */
  deleteAllPresets: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('presets')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  },
};

// Mappers

function mapDbToPreset(dbRecord: TableRow<'presets'>): SavedPreset {
  return {
    id: dbRecord.id,
    name: dbRecord.name,
    lastModified: dbRecord.updated_at ? new Date(dbRecord.updated_at).getTime() : Date.now(),
    input: {
      productName: dbRecord.name,
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

function mapPresetToDb(preset: SavedPreset, userId: string): TableInsert<'presets'> {
  return {
    id: preset.id,
    user_id: userId,
    name: preset.name,
    preset_type: 'single', // Default to single for now
    
    // Flatten input
    batch_size: preset.input.batchSize,
    ingredients: preset.input.ingredients as any,
    labor_cost: preset.input.laborCost,
    overhead_cost: preset.input.overhead,
    current_selling_price: preset.input.currentSellingPrice,
    
    // Flatten config
    pricing_strategy: preset.config.strategy,
    pricing_value: preset.config.value,
    
    // Others
    updated_at: new Date().toISOString(),
  };
}
