import { useState, useCallback, useMemo } from "react";
import { extractDiffSettings, type DiffSettings } from "@/lib/diff-settings";
import {
  updateProjectSettings,
  mergeSettings,
} from "@/lib/services/project-settings.service";
import type { Json } from "@/types/database";

interface UseDiffSettingsOptions {
  projectId: string;
  projectSettings?: Json | null;
}

interface UseDiffSettingsReturn {
  settings: DiffSettings;
  updateSettings: (newSettings: Partial<DiffSettings>) => Promise<void>;
}

/**
 * Hook to manage diff settings from project settings
 * Handles both reading and updating settings
 */
export function useDiffSettings({
  projectId,
  projectSettings,
}: UseDiffSettingsOptions): UseDiffSettingsReturn {
  // Initialize settings from project settings
  const initialSettings = useMemo(
    () => extractDiffSettings(projectSettings),
    [projectSettings]
  );

  const [diffSettings, setDiffSettings] =
    useState<DiffSettings>(initialSettings);

  // Update settings in database
  const updateSettings = useCallback(
    async (newSettings: Partial<DiffSettings>) => {
      const updatedSettings = { ...diffSettings, ...newSettings };
      setDiffSettings(updatedSettings);

      try {
        // Merge with existing settings to preserve other settings
        const mergedSettings = mergeSettings(projectSettings ?? {}, {
          diff: updatedSettings,
        });

        await updateProjectSettings({
          projectId,
          settings: mergedSettings,
        });
      } catch (error) {
        console.error("Error saving settings to database:", error);
        // Revert on error
        setDiffSettings(diffSettings);
        throw error;
      }
    },
    [diffSettings, projectId, projectSettings]
  );

  return {
    settings: diffSettings,
    updateSettings,
  };
}
