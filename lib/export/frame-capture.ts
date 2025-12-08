import type { Step } from "@/types/database";
import type { Browser } from "puppeteer-core";
import { renderDiffViewToImage } from "./server-diff-view-simple";
import { getLineRangeFromStep } from "@/lib/line-range-helpers";

/**
 * Capture a screenshot of a single step using server-side rendering
 * Returns a single frame with the specified line range (if provided)
 */
export async function captureStepFrame(
  step: Step,
  previousStep: Step | null,
  options: {
    width?: number;
    height?: number;
    browser?: Browser;
    currentStepIndex?: number;
    totalSteps?: number;
  } = {}
): Promise<Buffer[]> {
  const startTime = Date.now();
  const stepIndex = step.index; // Already 0-based
  const stepTitle = step.title || "Untitled";

  console.log(`[Frame Capture ${stepIndex + 1}] Rendering step: ${stepTitle}`);

  // Get line range from step if available
  const lineRange = getLineRangeFromStep(step);

  if (lineRange) {
    console.log(
      `[Frame Capture ${stepIndex + 1}] Using line range: ${
        lineRange.startLine
      }-${lineRange.endLine}`
    );
  }

  const props = {
    previousCode: previousStep?.code || "",
    currentCode: step.code,
    language: step.language,
    stepTitle: step.title || undefined,
    fileName: undefined, // Could extract from step if we store it
    width: options.width || 1200,
    height: options.height || 800,
    browser: options.browser, // Pass browser instance if provided
    currentStepIndex: options.currentStepIndex ?? stepIndex,
    totalSteps: options.totalSteps ?? 1,
    lineRange, // Pass line range if specified
  };

  // Always capture single frame (no scrolling)
  const imageBuffer = await renderDiffViewToImage(props);

  console.log(
    `[Frame Capture ${stepIndex + 1}] Successfully rendered in ${
      Date.now() - startTime
    }ms (${(imageBuffer.length / 1024).toFixed(2)}KB)`
  );

  return [imageBuffer];
}
