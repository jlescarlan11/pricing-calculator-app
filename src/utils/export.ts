import type { Preset } from '../types/calculator';

export interface BackupData {
  version: number;
  timestamp: string;
  source: string;
  data: {
    presets: Preset[];
  };
}

export const BACKUP_VERSION = 1;

export function generateBackupJSON(presets: Preset[]): string {
  const backup: BackupData = {
    version: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    source: 'pricing-calculator-app',
    data: {
      presets,
    },
  };

  return JSON.stringify(backup, null, 2);
}

export function downloadBackupFile(presets: Preset[]) {
  const json = generateBackupJSON(presets);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pricing-calculator-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
