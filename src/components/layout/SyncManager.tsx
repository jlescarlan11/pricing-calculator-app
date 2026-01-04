import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePresets } from '../../hooks/use-presets';

/**
 * SyncManager handles automatic synchronization of local data to the cloud
 * when a user signs in.
 */
export const SyncManager: React.FC = () => {
  const { user } = useAuth();
  const { syncPresets } = usePresets();
  const prevUserRef = useRef<any>(null);

  useEffect(() => {
    // If user just logged in (transition from no user to user)
    if (user && !prevUserRef.current) {
      console.log('User logged in, triggering sync...');
      syncPresets();
    }
    prevUserRef.current = user;
  }, [user, syncPresets]);

  return null; // This component doesn't render anything
};
