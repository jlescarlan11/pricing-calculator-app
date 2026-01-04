import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ExportImport } from './ExportImport';
import * as usePresetsHook from '../../hooks/use-presets';
import * as useAuthHook from '../../hooks/useAuth';
import { exportService } from '../../services/export.service';

// Mock services and hooks
vi.mock('../../hooks/use-presets');
vi.mock('../../hooks/useAuth');
vi.mock('../../services/export.service', () => ({
  exportService: {
    exportAllPresets: vi.fn(),
    downloadAsFile: vi.fn(),
  },
}));

describe('ExportImport Component', () => {
  const mockPresets = [
    { id: '1', name: 'Cake', ingredients: [], labor: 0, overhead: 0, lastModified: 123, created_at: '2023-01-01' },
    { id: '2', name: 'Bread', ingredients: [], labor: 0, overhead: 0, lastModified: 123, created_at: '2023-01-01' },
  ];

  const mockAddPreset = vi.fn();
  const mockDeletePreset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (usePresetsHook.usePresets as any).mockReturnValue({
      presets: mockPresets,
      addPreset: mockAddPreset,
      deletePreset: mockDeletePreset,
    });

    (useAuthHook.useAuth as any).mockReturnValue({
      user: { email: 'test@example.com' },
    });
  });

  it('renders export and import sections', () => {
    render(<ExportImport />);
    expect(screen.getByText(/Export Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Import Data/i)).toBeInTheDocument();
    expect(screen.getByText(/2 Presets/i)).toBeInTheDocument();
  });

  it('handles export flow', async () => {
    (exportService.exportAllPresets as any).mockReturnValue('{"mock":"json"}');
    
    render(<ExportImport />);
    
    // Click Export Button
    fireEvent.click(screen.getByText('Export All Presets'));
    
    // Check for Confirmation Modal
    expect(screen.getByText(/Confirm Export/i)).toBeInTheDocument();
    
    // Confirm
    fireEvent.click(screen.getByText('Download Export'));
    
    await waitFor(() => {
      expect(exportService.exportAllPresets).toHaveBeenCalledWith(mockPresets, 'test@example.com');
      expect(exportService.downloadAsFile).toHaveBeenCalledWith('{"mock":"json"}', expect.stringContaining('pricing-calculator-export'));
    });
  });

  it('validates invalid file upload', async () => {
    render(<ExportImport />);
    
    const file = new File(['invalid json'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Upload JSON file/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/Please upload a valid .json file/i)).toBeInTheDocument();
    });
  });

  it('handles valid file upload and shows preview', async () => {
    render(<ExportImport />);
    
    const importData = {
      meta: { version: '1.0.0', count: 2, timestamp: '2023' },
      presets: [
        { name: 'Imported 1', ingredients: [] },
        { name: 'Imported 2', ingredients: [] }
      ]
    };
    
    const file = new File([JSON.stringify(importData)], 'backup.json', { type: 'application/json' });
    const input = screen.getByLabelText(/Upload JSON file/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('backup.json')).toBeInTheDocument();
      // "2 Presets" appears in Export section (from mockPresets) AND Import preview
      expect(screen.getAllByText('2 Presets')).toHaveLength(2);
    });
  });

  it('executes merge import', async () => {
    render(<ExportImport />);
    
    // 1. Upload File
    const importData = {
      meta: { version: '1.0.0', count: 1 },
      presets: [{ name: 'New Item', ingredients: [] }]
    };
    const file = new File([JSON.stringify(importData)], 'backup.json', { type: 'application/json' });
    fireEvent.change(screen.getByLabelText(/Upload JSON file/i), { target: { files: [file] } });
    
    // 2. Wait for preview
    await waitFor(() => screen.getByText('backup.json'));
    
    // 3. Select Merge (Default) and Click Import
    fireEvent.click(screen.getByText('Import Presets'));
    
    await waitFor(() => {
      expect(mockAddPreset).toHaveBeenCalledTimes(1);
      expect(mockAddPreset).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Item' }));
      expect(screen.getByText(/Import Complete/i)).toBeInTheDocument();
    });
  });

  it('executes replace import with confirmation', async () => {
    render(<ExportImport />);
    
    // 1. Upload File
    const importData = {
      meta: { version: '1.0.0', count: 1 },
      presets: [{ name: 'Replacement Item', ingredients: [] }]
    };
    const file = new File([JSON.stringify(importData)], 'backup.json', { type: 'application/json' });
    fireEvent.change(screen.getByLabelText(/Upload JSON file/i), { target: { files: [file] } });
    
    // 2. Wait for preview
    await waitFor(() => screen.getByText('backup.json'));
    
    // 3. Select Replace Mode
    fireEvent.click(screen.getByLabelText(/Replace all data/i));
    
    // 4. Click Import -> Should show Warning Modal
    fireEvent.click(screen.getByText('Import Presets'));
    expect(screen.getByText(/Warning: Replace Data/i)).toBeInTheDocument();
    
    // 5. Confirm Replace
    fireEvent.click(screen.getByText('Yes, Replace Everything'));
    
    await waitFor(() => {
      // Should delete existing 2 presets
      expect(mockDeletePreset).toHaveBeenCalledTimes(2);
      expect(mockDeletePreset).toHaveBeenCalledWith('1');
      expect(mockDeletePreset).toHaveBeenCalledWith('2');
      
      // Should add new preset
      expect(mockAddPreset).toHaveBeenCalledTimes(1);
      expect(mockAddPreset).toHaveBeenCalledWith(expect.objectContaining({ name: 'Replacement Item' }));
      
      expect(screen.getByText(/Import Complete/i)).toBeInTheDocument();
    });
  });
});
