import type { Preset } from './presets/presets.service';

export interface ExportData {
  meta: {
    version: string;
    timestamp: string;
    user_email: string;
    count: number;
    platform: string;
  };
  presets: Omit<Preset, 'user_id'>[];
}

export class ExportService {
  private static instance: ExportService;
  private readonly EXPORT_VERSION = '1.0.0';

  private constructor() {}

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  /**
   * Serializes presets into a formatted JSON string for export.
   * Removes sensitive fields like user_id.
   *
   * @param presets Array of Preset objects to export
   * @param userEmail Email of the user performing the export
   * @returns JSON string of ExportData
   * @throws Error if serialization fails
   */
  public exportAllPresets(presets: Preset[], userEmail: string): string {
    try {
      const sanitizedPresets = presets.map((preset) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user_id, ...rest } = preset;
        return rest;
      });

      const exportData: ExportData = {
        meta: {
          version: this.EXPORT_VERSION,
          timestamp: new Date().toISOString(),
          user_email: userEmail,
          count: sanitizedPresets.length,
          platform: 'web',
        },
        presets: sanitizedPresets,
      };

      // Ensure data is serializable
      const jsonString = JSON.stringify(exportData, null, 2);
      if (!jsonString) {
        throw new Error('Failed to serialize export data');
      }

      return jsonString;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Export failed: ${error.message}`);
      }
      throw new Error('Export failed: Unknown error');
    }
  }

  /**
   * Triggers a browser download of the exported data.
   *
   * @param content JSON string content to download
   * @param filename Optional filename (defaults to pricing-calculator-export-YYYY-MM-DD.json)
   */
  public downloadAsFile(content: string, filename?: string): void {
    try {
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const date = new Date().toISOString().split('T')[0];
      const defaultFilename = `pricing-calculator-export-${date}.json`;
      
      link.href = url;
      link.download = filename || defaultFilename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw new Error('Failed to download file');
    }
  }
}

export const exportService = ExportService.getInstance();
