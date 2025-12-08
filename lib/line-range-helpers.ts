import type { Step } from "@/types/database";

export interface LineRange {
  startLine: number; // 1-based line number (inclusive)
  endLine: number; // 1-based line number (inclusive)
}

/**
 * Check if a value is defined and not null
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== undefined && value !== null;
}

/**
 * Check if a step has a valid line range
 */
export function hasLineRange(step: Step): boolean {
  return (
    isDefined(step.line_range_start) &&
    isDefined(step.line_range_end) &&
    step.line_range_start >= 1 &&
    step.line_range_end >= step.line_range_start
  );
}

/**
 * Extract line range from a step if it exists and is valid
 */
export function getLineRangeFromStep(step: Step): LineRange | undefined {
  if (hasLineRange(step)) {
    return {
      startLine: step.line_range_start!,
      endLine: step.line_range_end!,
    };
  }
  return undefined;
}

/**
 * Validate a line range against total lines
 */
export function validateLineRange(
  start: number,
  end: number,
  totalLines: number
): { valid: boolean; error?: string } {
  if (start < 1 || end < 1) {
    return { valid: false, error: "Line numbers must be at least 1" };
  }
  if (start > end) {
    return {
      valid: false,
      error: "Start line must be less than or equal to end line",
    };
  }
  if (end > totalLines) {
    return {
      valid: false,
      error: `End line (${end}) exceeds total lines (${totalLines})`,
    };
  }
  return { valid: true };
}
