import { presetService } from '../services/presetService';
import type { Preset } from '../types/calculator';

const STORAGE_KEY = 'pricing_calculator_presets';

/**
 * Checks for any locally saved presets that do not have a userId (guest mode presets).
 * If found, assigns the current userId to them and syncs them to the cloud.
 */
export async function migrateGuestPresets(userId: string) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const localPresets: Preset[] = stored ? JSON.parse(stored) : [];

    // Identify guest presets (no userId)
    const guestPresets = localPresets.filter((p) => !p.userId);

    if (guestPresets.length > 0) {
      console.log(
        `[Migration] Found ${guestPresets.length} guest presets. Migrating to user ${userId}...`
      );

      // Prepare them for import (assign new userId)
      const presetsToMigrate = guestPresets.map((p) => ({
        ...p,
        userId: userId,
        // Mark as updated now so they sync properly
        updatedAt: new Date().toISOString(),
      }));

      // Use the import service (merge strategy) to safely save and sync
      // 'merge' ensures we don't overwrite any existing cloud data for this user
      // unless IDs conflict (unlikely for UUIDs)
      await presetService.importPresets(presetsToMigrate, 'merge', userId);

      console.log('[Migration] Migration complete.');
    }
  } catch (error) {
    console.error('[Migration] Failed to migrate guest presets:', error);
  }
}
