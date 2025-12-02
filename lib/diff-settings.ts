export interface DiffSettings {
  showAdditions: boolean;
  showDeletions: boolean;
  showLineNumbers: boolean;
}

export const DEFAULT_DIFF_SETTINGS: DiffSettings = {
  showAdditions: true,
  showDeletions: true,
  showLineNumbers: true,
};

/**
 * Extract diff settings from project settings JSON
 */
export function extractDiffSettings(projectSettings: unknown): DiffSettings {
  if (
    projectSettings &&
    typeof projectSettings === "object" &&
    "diff" in projectSettings &&
    typeof projectSettings.diff === "object" &&
    projectSettings.diff !== null
  ) {
    const diff = projectSettings.diff as Partial<DiffSettings>;
    return {
      ...DEFAULT_DIFF_SETTINGS,
      ...diff,
    };
  }
  return DEFAULT_DIFF_SETTINGS;
}
