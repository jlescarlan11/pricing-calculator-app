import { offlineQueue } from '../lib/offline-queue';
import type { QueuedOperation } from '../types/sync';

export function useOfflineQueue() {
  const addToQueue = (item: QueuedOperation) => {
    offlineQueue.enqueue(item);
  };

  return {
    addToQueue,
  };
}
