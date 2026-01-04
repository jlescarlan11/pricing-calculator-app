import { useEffect } from 'react';
import { syncService } from '../services/sync';

export function useSync() {
  useEffect(() => {
    // Setup sync listeners
  }, []);

  const triggerSync = async () => {
    await syncService.sync();
  };

  return {
    triggerSync,
  };
}
