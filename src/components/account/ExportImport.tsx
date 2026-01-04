import React, { useState, useRef, useCallback } from 'react';
import { Download, Upload, FileJson, AlertTriangle, CheckCircle, XCircle, Trash2, Info } from 'lucide-react';
import { usePresets } from '../../hooks/use-presets';
import { useAuth } from '../../hooks/useAuth';
import { exportService, ExportData } from '../../services/export.service';
import { Card, Button, Modal, Badge } from '../shared';
import type { SavedPreset } from '../../types';

export const ExportImport: React.FC = () => {
  const { presets, addPreset, deletePreset } = usePresets();
  const { user } = useAuth();
  
  // Export State
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ExportData | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Export Logic ---

  const handleExportClick = () => {
    setShowExportConfirm(true);
    setExportSuccess(null);
  };

  const confirmExport = () => {
    try {
      const json = exportService.exportAllPresets(presets, user?.email || 'guest');
      const filename = `pricing-calculator-export-${new Date().toISOString().split('T')[0]}.json`;
      exportService.downloadAsFile(json, filename);
      setExportSuccess(filename);
      setShowExportConfirm(false);
    } catch (error) {
      console.error('Export failed:', error);
      // In a real app, we might show a toast here
    }
  };

  // --- Import Logic ---

  const resetImport = () => {
    setImportFile(null);
    setImportPreview(null);
    setImportResults(null);
    setImportProgress(0);
    setParseError(null);
    setIsImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = (file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setParseError('Please upload a valid .json file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as ExportData;

        // Basic validation
        if (!data.meta || !Array.isArray(data.presets)) {
          throw new Error('Invalid file format: Missing meta or presets array.');
        }

        setImportPreview(data);
        setImportFile(file);
        setParseError(null);
      } catch (err) {
        setParseError('Failed to parse JSON file. Please check the file content.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleImportClick = () => {
    if (importMode === 'replace') {
      setShowImportConfirm(true);
    } else {
      executeImport();
    }
  };

  const executeImport = async () => {
    if (!importPreview) return;
    
    setShowImportConfirm(false);
    setIsImporting(true);
    setImportProgress(0);
    
    const results = { imported: 0, skipped: 0, errors: [] as string[] };
    const total = importPreview.presets.length + (importMode === 'replace' ? presets.length : 0);
    let processed = 0;

    const updateProgress = () => {
      processed++;
      setImportProgress(Math.round((processed / total) * 100));
    };

    try {
      // 1. Handle Replace Mode (Delete existing)
      if (importMode === 'replace') {
        const idsToDelete = presets.map(p => p.id);
        for (const id of idsToDelete) {
          await deletePreset(id);
          updateProgress();
        }
      }

      // 2. Import New Presets
      for (const preset of importPreview.presets) {
        try {
          // Omit user_id and allow system to generate new ID and timestamps
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, user_id, lastModified, created_at, ...cleanPreset } = preset as any;
          
          await addPreset(cleanPreset as Omit<SavedPreset, 'id' | 'lastModified' | 'created_at'>);
          results.imported++;
        } catch (err) {
          console.error('Import error for preset:', preset, err);
          results.errors.push((preset as any).name || 'Unknown Preset');
          results.skipped++;
        }
        updateProgress();
      }

      setImportResults(results);
    } catch (err) {
      console.error('Import process failed:', err);
      results.errors.push('Critical system error during import.');
      setImportResults(results);
    } finally {
      setIsImporting(false);
      setImportProgress(100);
    }
  };

  return (
    <div className="space-y-xl">
      {/* Export Section */}
      <Card title="Export Data" className="bg-surface">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-lg">
          <div>
            <p className="text-ink-700 mb-xs">
              Download a backup of your data.
            </p>
            <div className="flex items-center gap-sm">
              <Badge variant="info">
                {presets.length} Presets
              </Badge>
              {exportSuccess && (
                <span className="text-sm text-moss flex items-center animate-fade-in">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {exportSuccess}
                </span>
              )}
            </div>
          </div>
          <Button 
            onClick={handleExportClick} 
            disabled={presets.length === 0}
            className="w-full md:w-auto"
            variant="secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All Presets
          </Button>
        </div>
      </Card>

      {/* Import Section */}
      <Card title="Import Data" className="bg-surface">
        {!importPreview ? (
          // File Upload State
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-xl text-center transition-all
              ${dragActive ? 'border-clay bg-clay/5' : 'border-border-base hover:border-clay/50 hover:bg-surface-hover'}
              ${parseError ? 'border-rust/50 bg-rust/5' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Upload JSON file"
            />
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <div className={`p-md rounded-full mb-md ${parseError ? 'bg-rust/10 text-rust' : 'bg-surface-hover text-ink-500'}`}>
                {parseError ? <AlertTriangle className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
              </div>
              <h4 className="text-lg font-medium text-ink-900 mb-xs">
                {parseError ? 'Import Failed' : 'Click or drag file to upload'}
              </h4>
              <p className="text-ink-500 text-sm max-w-xs mx-auto">
                {parseError || 'Accepts .json files exported from this application.'}
              </p>
            </div>
          </div>
        ) : (
          // File Preview & Options State
          <div className="space-y-lg">
            {/* File Info */}
            <div className="flex items-center justify-between bg-surface-hover p-md rounded-lg">
              <div className="flex items-center gap-md">
                <div className="p-sm bg-bg-main rounded-md text-clay border border-border-subtle">
                  <FileJson className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-medium text-ink-900">{importFile?.name}</h4>
                  <div className="flex gap-sm text-xs text-ink-500 mt-0.5">
                    <span>Version: {importPreview.meta.version}</span>
                    <span>•</span>
                    <span>{importPreview.meta.count} Presets</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={resetImport}
                className="p-sm text-ink-500 hover:text-rust transition-colors"
                aria-label="Remove file"
                disabled={isImporting}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Results Display */}
            {importResults ? (
              <div className="bg-surface-hover rounded-lg p-lg border border-border-subtle">
                <h4 className="font-medium text-ink-900 mb-md flex items-center">
                  <CheckCircle className="w-5 h-5 text-moss mr-2" />
                  Import Complete
                </h4>
                <div className="space-y-xs text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-700">Successfully Imported:</span>
                    <span className="font-medium text-ink-900">{importResults.imported}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-700">Skipped:</span>
                    <span className="font-medium text-ink-900">{importResults.skipped}</span>
                  </div>
                </div>
                {importResults.errors.length > 0 && (
                   <div className="mt-md pt-md border-t border-border-subtle">
                     <p className="text-rust text-sm font-medium mb-xs">Errors:</p>
                     <ul className="text-xs text-rust/80 list-disc list-inside">
                       {importResults.errors.map((e, i) => (
                         <li key={i}>Failed to import: {e}</li>
                       ))}
                     </ul>
                   </div>
                )}
                <Button onClick={resetImport} variant="secondary" className="w-full mt-lg">
                  Done
                </Button>
              </div>
            ) : (
              // Import Options
              <>
                <div className="space-y-md">
                  <label className="block text-sm font-medium text-ink-900">Import Mode</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <label 
                      className={`
                        relative flex flex-col p-md rounded-lg border-2 cursor-pointer transition-all
                        ${importMode === 'merge' ? 'border-clay bg-clay/5' : 'border-border-base hover:border-clay/30'}
                      `}
                    >
                      <input 
                        type="radio" 
                        name="importMode" 
                        value="merge" 
                        checked={importMode === 'merge'} 
                        onChange={() => setImportMode('merge')}
                        className="sr-only"
                        disabled={isImporting}
                      />
                      <div className="flex items-center mb-xs">
                        <div className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center ${importMode === 'merge' ? 'border-clay' : 'border-ink-500'}`}>
                           {importMode === 'merge' && <div className="w-2 h-2 rounded-full bg-clay" />}
                        </div>
                        <span className="font-medium text-ink-900">Merge with existing</span>
                      </div>
                      <p className="text-xs text-ink-500 pl-6">
                        Adds imported presets to your current list. No data will be lost.
                      </p>
                    </label>

                    <label 
                      className={`
                        relative flex flex-col p-md rounded-lg border-2 cursor-pointer transition-all
                        ${importMode === 'replace' ? 'border-rust/50 bg-rust/5' : 'border-border-base hover:border-rust/30'}
                      `}
                    >
                      <input 
                        type="radio" 
                        name="importMode" 
                        value="replace" 
                        checked={importMode === 'replace'} 
                        onChange={() => setImportMode('replace')}
                        className="sr-only"
                        disabled={isImporting}
                      />
                      <div className="flex items-center mb-xs">
                         <div className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center ${importMode === 'replace' ? 'border-rust' : 'border-ink-500'}`}>
                           {importMode === 'replace' && <div className="w-2 h-2 rounded-full bg-rust" />}
                        </div>
                        <span className="font-medium text-rust">Replace all data</span>
                      </div>
                      <p className="text-xs text-ink-500 pl-6">
                        Deletes ALL current presets and replaces them with the imported file.
                      </p>
                    </label>
                  </div>
                </div>

                {isImporting && (
                  <div className="space-y-xs">
                    <div className="flex justify-between text-xs text-ink-500">
                      <span>Importing...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-clay transition-all duration-300 ease-out"
                        style={{ width: `${importProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-md pt-md border-t border-border-subtle">
                   <Button variant="ghost" onClick={resetImport} disabled={isImporting}>
                     Cancel
                   </Button>
                   <Button 
                     variant={importMode === 'replace' ? 'danger' : 'primary'}
                     onClick={handleImportClick}
                     disabled={isImporting}
                     isLoading={isImporting}
                   >
                     {isImporting ? 'Importing...' : 'Import Presets'}
                   </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Card>

      {/* Export Confirmation Modal */}
      <Modal
        isOpen={showExportConfirm}
        onClose={() => setShowExportConfirm(false)}
        title="Confirm Export"
      >
        <div className="space-y-lg">
          <p className="text-ink-700">
            You are about to export <strong>{presets.length} presets</strong> to a JSON file.
          </p>
          <div className="bg-surface-hover p-md rounded-lg flex items-start gap-md text-sm text-ink-700">
            <Info className="w-5 h-5 text-clay shrink-0 mt-0.5" />
            <p>
              This file can be used to restore your data later or transfer it to another device.
              Sensitive account information is excluded.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-md mt-xl">
          <Button variant="ghost" onClick={() => setShowExportConfirm(false)}>
            Cancel
          </Button>
          <Button onClick={confirmExport}>
            Download Export
          </Button>
        </div>
      </Modal>

      {/* Import Replace Confirmation Modal */}
      <Modal
        isOpen={showImportConfirm}
        onClose={() => setShowImportConfirm(false)}
        title="Warning: Replace Data"
      >
         <div className="space-y-lg">
          <div className="flex items-center gap-md text-rust mb-md">
            <AlertTriangle className="w-8 h-8" />
            <h3 className="font-semibold text-lg">Destructive Action</h3>
          </div>
          <p className="text-ink-700">
            You have selected <strong>Replace all data</strong>. This will permanently delete 
            your current <strong>{presets.length} presets</strong> and replace them with the 
            <strong>{importPreview?.meta.count} presets</strong> from the file.
          </p>
          <p className="text-ink-900 font-medium">
            This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-md mt-xl">
          <Button variant="ghost" onClick={() => setShowImportConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={executeImport}>
            Yes, Replace Everything
          </Button>
        </div>
      </Modal>
    </div>
  );
};
