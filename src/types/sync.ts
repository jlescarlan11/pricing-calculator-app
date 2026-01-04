import type { SavedPreset } from './calculator';
import type { Preset } from './variants';

/**
 * Explicit representation of all possible synchronization states.
 */
export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error' | 'conflict';

/**
 * Models a pending CRUD action against presets in the offline queue.
 */
export interface QueuedOperation {
  /** Unique operation identifier (UUID) */
  id: string;
  /** The type of action to perform */
  type: 'create' | 'update' | 'delete';
  /** The ID of the preset being modified */
  presetId: string;
  /** Partial payload data for the operation (supports both legacy and variant presets) */
  payload?: Partial<SavedPreset | Preset>;
  /** Unix timestamp when the operation was created */
  timestamp: number;
  /** Number of failed attempts to process this operation */
  retryCount: number;
  /** Optional error message from the most recent failure */
  lastError?: string;
}

/**
 * Represents the global synchronization state of the application.
 */
export interface SyncState {
  /** Current synchronization status */
  status: SyncStatus;
  /** Unix timestamp of the last successful sync with the cloud */
  lastSyncedAt: number | null;
  /** Number of pending operations in the queue */
  queueLength: number;
  /** Optional description of the operation currently being processed */
  activeOperation?: string;
  /** Optional high-level error message */
  error?: string;
}
