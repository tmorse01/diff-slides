/**
 * Export Service - Client-side service for project exports
 */

export type ExportFormat = "gif" | "mp4";

export interface ExportOptions {
  projectId: string;
  format: ExportFormat;
  duration: number;
  projectSlug: string;
}

export interface ExportResult {
  success: boolean;
  blob: Blob;
  filename: string;
}

/**
 * Export a project as a video or animated GIF
 */
export async function exportProject(
  options: ExportOptions
): Promise<ExportResult> {
  const { projectId, format, duration, projectSlug } = options;

  const params = new URLSearchParams({
    duration: duration.toString(),
  });

  const response = await fetch(
    `/api/projects/${projectId}/export/${format}?${params.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `Failed to export ${format.toUpperCase()}`,
    }));
    throw new Error(error.error || `Failed to export ${format.toUpperCase()}`);
  }

  const blob = await response.blob();
  const filename = `${projectSlug}-export.${format}`;

  return {
    success: true,
    blob,
    filename,
  };
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
