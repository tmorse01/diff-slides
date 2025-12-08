import { useMemo, useCallback } from "react";
import {
  updateProjectSettings,
  mergeSettings,
} from "@/lib/services/project-settings.service";
import type { Json } from "@/types/database";

export interface LineRange {
  startLine: number; // 1-based line number (inclusive)
  endLine: number; // 1-based line number (inclusive)
}

interface UseLineRangesOptions {
  projectId: string;
  projectSettings: Json | null;
}

interface UseLineRangesReturn {
  getLineRange: (stepId: string) => LineRange | undefined;
  setLineRange: (stepId: string, range: LineRange | null) => Promise<void>;
  clearLineRange: (stepId: string) => Promise<void>;
}

/**
 * Extract line ranges from project settings
 */
function extractLineRanges(
  projectSettings: Json | null
): Record<string, LineRange> {
  if (!projectSettings || typeof projectSettings !== "object") {
    return {};
  }

  const settings = projectSettings as Record<string, unknown>;
  const lineRanges = settings.lineRanges as
    | Record<string, { startLine: number; endLine: number }>
    | undefined;

  if (!lineRanges || typeof lineRanges !== "object") {
    return {};
  }

  const result: Record<string, LineRange> = {};
  for (const [stepId, range] of Object.entries(lineRanges)) {
    if (
      range &&
      typeof range.startLine === "number" &&
      typeof range.endLine === "number"
    ) {
      result[stepId] = {
        startLine: range.startLine,
        endLine: range.endLine,
      };
    }
  }

  return result;
}

/**
 * Hook to manage line ranges from project settings
 */
export function useLineRanges({
  projectId,
  projectSettings,
}: UseLineRangesOptions): UseLineRangesReturn {
  // Derive line ranges directly from projectSettings instead of using state
  const lineRanges = useMemo(
    () => extractLineRanges(projectSettings),
    [projectSettings]
  );

  const getLineRange = useCallback(
    (stepId: string): LineRange | undefined => {
      return lineRanges[stepId];
    },
    [lineRanges]
  );

  const setLineRange = useCallback(
    async (stepId: string, range: LineRange | null) => {
      const updatedRanges = { ...lineRanges };
      if (range) {
        updatedRanges[stepId] = range;
      } else {
        delete updatedRanges[stepId];
      }

      try {
        // Merge with existing settings to preserve other settings
        const mergedSettings = mergeSettings(projectSettings ?? {}, {
          lineRanges: updatedRanges,
        });

        await updateProjectSettings({
          projectId,
          settings: mergedSettings,
        });
      } catch (error) {
        console.error("Error saving line range to database:", error);
        throw error;
      }
    },
    [lineRanges, projectId, projectSettings]
  );

  const clearLineRange = useCallback(
    async (stepId: string) => {
      await setLineRange(stepId, null);
    },
    [setLineRange]
  );

  return {
    getLineRange,
    setLineRange,
    clearLineRange,
  };
}
