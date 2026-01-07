import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '../shared';
import { usePresets } from '../../hooks/use-presets';
import { downloadBackupFile } from '../../utils/export';
import { useToast } from '../shared/Toast';

export const ExportButton: React.FC = () => {
  const { presets } = usePresets();
  const { addToast } = useToast();

  const handleExport = () => {
    try {
      downloadBackupFile(presets);
      addToast('Backup file downloaded successfully', 'success');
    } catch (e) {
      console.error(e);
      addToast('Failed to generate backup', 'error');
    }
  };

  return (
    <Button
      variant="primary"
      onClick={handleExport}
      disabled={presets.length === 0}
      className="w-full sm:w-auto"
      aria-label="Export all data to a JSON file"
    >
      <Download className="w-4 h-4 mr-2" />
      Export Data
    </Button>
  );
};
