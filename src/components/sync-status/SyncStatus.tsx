import React, { useState } from 'react';
import { CheckCircle, RefreshCw, CloudOff, AlertCircle } from 'lucide-react';
import { useSync } from '../../hooks/useSync';
import { Tooltip } from '../shared/Tooltip';
import { formatDistanceToNow } from 'date-fns';

/**
 * Compact status indicator that displays the current synchronization state.
 * Fixed to the top-right corner of the application.
 */
export const SyncStatus: React.FC = () => {
  const { status, lastSyncedAt, queueLength, syncFromCloud, error } = useSync();
  const [isRotating, setIsRotating] = useState(false);

  const handleManualSync = async () => {
    if (status === 'syncing') return;

    if (status === 'offline') {
      // TODO: Open a detailed queue inspection view/modal
      console.log('Open offline queue view', queueLength);
      return;
    }

    setIsRotating(true);
    await syncFromCloud();
    setTimeout(() => setIsRotating(false), 500);
  };

  const renderStatus = () => {
    switch (status) {
      case 'synced':
        return {
          icon: <CheckCircle className="w-4 h-4 text-moss" />,
          label: 'Synced',
          bgColor: 'bg-moss/10',
          textColor: 'text-moss',
        };
      case 'syncing':
        return {
          icon: <RefreshCw className={`w-4 h-4 text-blue-500 ${isRotating || status === 'syncing' ? 'animate-spin' : ''}`} />,
          label: 'Syncing...',
          bgColor: 'bg-blue-500/10',
          textColor: 'text-blue-600',
        };
      case 'offline':
        return {
          icon: <CloudOff className="w-4 h-4 text-[#D4A017]" />,
          label: `Offline (${queueLength} changes queued)`,
          bgColor: 'bg-[#D4A017]/10',
          textColor: 'text-[#B8860B]',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4 text-rust" />,
          label: 'Sync failed (tap to retry)',
          bgColor: 'bg-rust/10',
          textColor: 'text-rust',
        };
      default:
        return null;
    }
  };

  const currentStatus = renderStatus();
  if (!currentStatus) return null;

  const lastSyncedText = lastSyncedAt 
    ? `Last synced ${formatDistanceToNow(lastSyncedAt, { addSuffix: true })}`
    : 'Never synced';

  const tooltipContent = (
    <div className="flex flex-col gap-xs py-xs">
      <p className="font-medium">{currentStatus.label}</p>
      <p className="text-xs opacity-80">{lastSyncedText}</p>
      {error && status === 'error' && (
        <p className="text-xs mt-xs border-t border-white/20 pt-xs italic">{error}</p>
      )}
    </div>
  );

  return (
    <div className="fixed top-4 right-4 z-[60] pointer-events-none md:top-6 md:right-8">
      <Tooltip content={tooltipContent} position="left">
        <button
          onClick={handleManualSync}
          className={`
            pointer-events-auto
            flex items-center gap-sm px-md py-sm rounded-full
            ${currentStatus.bgColor} ${currentStatus.textColor}
            border border-current/10 shadow-level-1
            hover:shadow-level-2 hover:scale-105
            active:scale-95 transition-all duration-300
            cursor-pointer group
          `}
          aria-label={`Sync status: ${currentStatus.label}`}
        >
          <span className="flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
            {currentStatus.icon}
          </span>
          <span className="text-xs font-medium whitespace-nowrap hidden sm:inline">
            {currentStatus.label}
          </span>
        </button>
      </Tooltip>
    </div>
  );
};
