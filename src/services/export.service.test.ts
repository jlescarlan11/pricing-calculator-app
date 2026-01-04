import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportService, ExportService } from './export.service';
import type { Preset } from './presets/presets.service';

describe('ExportService', () => {
  const mockDate = new Date('2026-01-04T12:00:00.000Z');
  const mockEmail = 'test@example.com';
  
  const mockPresets: Preset[] = [
    {
      id: '1',
      name: 'Test Preset 1',
      user_id: 'user-123',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      last_synced_at: '2026-01-01T00:00:00Z',
      batch_size: 10,
      labor_cost: 100,
      overhead_cost: 50,
      preset_type: 'product',
      ingredients: [{ name: 'Flour', amount: 1000, cost: 50 }],
      variants: null,
      current_selling_price: null,
      pricing_strategy: 'markup',
      pricing_value: 50
    },
    {
      id: '2',
      name: 'Test Preset 2',
      user_id: 'user-123',
      created_at: '2026-01-02T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
      last_synced_at: '2026-01-02T00:00:00Z',
      batch_size: 5,
      labor_cost: 200,
      overhead_cost: 100,
      preset_type: 'product',
      ingredients: [],
      variants: null,
      current_selling_price: 150,
      pricing_strategy: 'margin',
      pricing_value: 30
    }
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = ExportService.getInstance();
      const instance2 = ExportService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('exportAllPresets', () => {
    it('should generate correct export data with metadata', () => {
      const json = exportService.exportAllPresets(mockPresets, mockEmail);
      const data = JSON.parse(json);

      expect(data.meta).toEqual({
        version: '1.0.0',
        timestamp: mockDate.toISOString(),
        user_email: mockEmail,
        count: 2,
        platform: 'web'
      });
    });

    it('should sanitize presets by removing user_id', () => {
      const json = exportService.exportAllPresets(mockPresets, mockEmail);
      const data = JSON.parse(json);

      data.presets.forEach((preset: any) => {
        expect(preset.user_id).toBeUndefined();
        expect(preset.id).toBeDefined();
        expect(preset.name).toBeDefined();
      });
    });

    it('should handle empty preset list', () => {
      const json = exportService.exportAllPresets([], mockEmail);
      const data = JSON.parse(json);

      expect(data.presets).toEqual([]);
      expect(data.meta.count).toBe(0);
    });

    it('should throw error if serialization fails (circular reference)', () => {
      const circular: any = { id: '1' };
      circular.self = circular;
      const presets = [circular as Preset];

      expect(() => exportService.exportAllPresets(presets, mockEmail)).toThrow(/Export failed/);
    });
  });

  describe('downloadAsFile', () => {
    it('should trigger file download with correct attributes', () => {
      // Mock DOM methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
        style: {}
      } as unknown as HTMLAnchorElement;
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
      
      // Mock URL methods
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      const content = JSON.stringify({ test: 'data' });
      exportService.downloadAsFile(content);

      // Verify Blob creation
      // Note: We can't easily check Blob constructor arguments directly with spyOn(global, 'Blob'), 
      // but verifying the flow is usually sufficient.

      // Verify link creation and click
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('blob:test-url');
      expect(mockLink.download).toBe('pricing-calculator-export-2026-01-04.json');
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(mockLink.click).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test-url');
    });

    it('should use provided filename if given', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
        style: {}
      } as unknown as HTMLAnchorElement;
      
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      const content = JSON.stringify({ test: 'data' });
      exportService.downloadAsFile(content, 'custom-name.json');

      expect(mockLink.download).toBe('custom-name.json');
    });

    it('should handle errors gracefully', () => {
      // Force an error
      vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
        throw new Error('URL error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => exportService.downloadAsFile('{}')).toThrow('Failed to download file');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
