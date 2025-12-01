import type { Step } from "@/types/database";
import type { Browser } from "puppeteer";
import { renderDiffViewToImage } from "./server-diff-view-simple";

/**
 * Capture a screenshot of a single step using server-side rendering
 * No browser needed - renders React component directly to image
 */
export async function captureStepFrame(
  step: Step,
  previousStep: Step | null,
  options: { width?: number; height?: number; browser?: Browser } = {}
): Promise<Buffer> {
  const startTime = Date.now();
  const stepIndex = step.index; // Already 0-based
  const stepTitle = step.title || "Untitled";

  console.log(`[Frame Capture ${stepIndex + 1}] Rendering step: ${stepTitle}`);

  // Let errors bubble up naturally - no complex wrapping
  const imageBuffer = await renderDiffViewToImage({
    previousCode: previousStep?.code || "",
    currentCode: step.code,
    language: step.language,
    stepTitle: step.title || undefined,
    fileName: undefined, // Could extract from step if we store it
    width: options.width || 1200,
    height: options.height || 800,
    browser: options.browser, // Pass browser instance if provided
  });

  console.log(
    `[Frame Capture ${stepIndex + 1}] Successfully rendered in ${
      Date.now() - startTime
    }ms (${(imageBuffer.length / 1024).toFixed(2)}KB)`
  );

  return imageBuffer;
}
