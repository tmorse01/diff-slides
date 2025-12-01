import { writeFile, stat } from "fs/promises";
import { join } from "path";
import type { Step } from "@/types/database";
import type { VideoExportOptions } from "./types";
import { captureStepFrame } from "./frame-capture";
import puppeteer, { type Browser } from "puppeteer";

/**
 * Capture all frames for a project using server-side rendering
 * Returns the paths to the captured frame files
 */
export async function captureAllFrames(
  _projectSlug: string,
  steps: Step[],
  _baseUrl: string,
  options: VideoExportOptions,
  tempDir: string,
  logPrefix: string = "[Export]"
): Promise<{ framePaths: string[]; browser: Browser | null }> {
  console.log(
    `${logPrefix} Starting frame capture for ${steps.length} steps...`
  );
  const captureStart = Date.now();

  if (steps.length === 0) {
    throw new Error("No steps to capture");
  }

  // Launch a single browser instance to reuse across all frames
  console.log(`${logPrefix} Launching browser...`);
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const framePaths: string[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  try {
    // Capture frames sequentially - continue even if one fails
    for (let index = 0; index < steps.length; index++) {
      const step = steps[index];
      const frameStartTime = Date.now();
      const previousStep = index > 0 ? steps[index - 1] : null;

      try {
        console.log(
          `${logPrefix} [Frame ${index + 1}/${steps.length}] Capturing: ${
            step.title || "Untitled"
          }`
        );

        const frameBuffer = await captureStepFrame(step, previousStep, {
          width: options.width,
          height: options.height,
          browser,
        });

        // Save frame to disk with 0-based index (for ffmpeg compatibility)
        const framePath = join(tempDir, `${index}.png`);
        await writeFile(framePath, frameBuffer);

        // Validate frame was actually saved
        const stats = await stat(framePath);
        if (stats.size === 0) {
          throw new Error(`Frame file is empty: ${framePath}`);
        }

        framePaths.push(framePath);
        console.log(
          `${logPrefix} [Frame ${index + 1}/${
            steps.length
          }] ✅ Saved: ${framePath.split(/[/\\]/).pop()} (${(
            frameBuffer.length / 1024
          ).toFixed(2)}KB, ${stats.size} bytes) in ${
            Date.now() - frameStartTime
          }ms`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Unknown error rendering frame ${index + 1}`;
        const elapsed = Date.now() - frameStartTime;
        const stepTitle = step.title || "Untitled";

        console.error(
          `${logPrefix} [Frame ${index + 1}/${
            steps.length
          }] ❌ FAILED after ${elapsed}ms (Step: "${stepTitle}"): ${errorMessage}`
        );

        errors.push({ index, error: errorMessage });
        // Continue to next frame instead of throwing
      }
    }
  } finally {
    // Close browser after all frames are captured
    console.log(`${logPrefix} Closing browser...`);
    await browser.close();
  }

  const totalTime = Date.now() - captureStart;
  console.log(
    `${logPrefix} Frame capture completed in ${totalTime}ms: ${framePaths.length}/${steps.length} frames captured`
  );

  if (errors.length > 0) {
    console.warn(
      `${logPrefix} ⚠️  ${errors.length} frame(s) failed to capture:`
    );
    errors.forEach(({ index, error }) => {
      console.warn(`  - Frame ${index + 1}: ${error}`);
    });
  }

  if (framePaths.length === 0) {
    throw new Error(
      `Failed to capture any frames. ${errors.length} error(s) occurred.`
    );
  }

  if (framePaths.length < steps.length) {
    console.warn(
      `${logPrefix} ⚠️  Only captured ${framePaths.length} out of ${steps.length} frames. Video will be shorter than expected.`
    );
  }

  // Log all captured frame paths for debugging
  console.log(
    `${logPrefix} Captured frames:`,
    framePaths.map((p, i) => `${i}: ${p.split(/[/\\]/).pop()}`).join(", ")
  );

  return { framePaths, browser: null };
}
