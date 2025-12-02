/**
 * Project Settings Service - Client-side service for updating project settings
 */

import type { Json } from "@/types/database";

export interface UpdateProjectSettingsOptions {
  projectId: string;
  settings: Record<string, unknown>;
}

/**
 * Update project settings
 */
export async function updateProjectSettings(
  options: UpdateProjectSettingsOptions
): Promise<void> {
  const { projectId, settings } = options;

  const response = await fetch(`/api/projects/${projectId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ settings }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Failed to update project settings",
    }));
    throw new Error(error.error || "Failed to update project settings");
  }
}

/**
 * Merge settings with existing project settings
 */
export function mergeSettings(
  currentSettings: Json | null,
  newSettings: Record<string, unknown>
): Record<string, unknown> {
  const current =
    currentSettings && typeof currentSettings === "object"
      ? (currentSettings as Record<string, unknown>)
      : {};

  return {
    ...current,
    ...newSettings,
  };
}
