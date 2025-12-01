/**
 * Shared types for export functionality
 */

export interface VideoExportOptions {
  frameDelay: number; // Delay in seconds per frame
  width?: number;
  height?: number;
  quality?: number; // 1-100, higher is better quality but larger file
  cookies?: Array<{ name: string; value: string }>; // Cookies for Puppeteer authentication
}

// Alias for backward compatibility
export type GifExportOptions = VideoExportOptions;

