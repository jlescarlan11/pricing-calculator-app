import { offlineQueue } from '../lib/offline-queue';

export function useOfflineQueue() {
  const addToQueue = (item: any) => {
    offlineQueue.add(item);
  };

  return {
    addToQueue,
  };
}
