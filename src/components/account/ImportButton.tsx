import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../shared';
import { usePresets } from '../../hooks/use-presets';
import { presetService } from '../../services/presetService';
import { validateBackupJSON } from '../../utils/import';
import { useToast } from '../shared/Toast';
import { ImportStrategyModal } from './ImportStrategyModal';
import type { Preset } from '../../types/calculator';
import { useAuth } from '../../context/AuthContext';

export const ImportButton: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refresh } = usePresets();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [importData, setImportData] = useState<{ presets: Preset[]; total: number } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = validateBackupJSON(text);

      if (!result.valid || !result.data) {
        addToast(result.error || 'Invalid backup file', 'error');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setImportData({
        presets: result.data,
        total: result.stats?.total || result.data.length,
      });
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      addToast('Failed to read file', 'error');
    }
  };

  const handleConfirmImport = async (strategy: 'merge' | 'replace') => {
    if (!importData) return;

    setModalOpen(false);

    try {
      await presetService.importPresets(importData.presets, strategy, user?.id);
      await refresh();
      addToast(`Successfully imported ${importData.total} products`, 'success');
    } catch (e) {
      console.error(e);
      addToast('Import failed', 'error');
    } finally {
      setImportData(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
      <Button
        variant="secondary"
        onClick={onButtonClick}
        className="w-full sm:w-auto"
        aria-label="Import data from a JSON file"
      >
        <Upload className="w-4 h-4 mr-2" />
        Import Data
      </Button>

      {importData && (
        <ImportStrategyModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setImportData(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          onConfirm={handleConfirmImport}
          importStats={{ total: importData.total }}
        />
      )}
    </>
  );
};
