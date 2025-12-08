import { writeFile, stat } from "fs/promises";
import { join } from "path";
import type { Step } from "@/types/database";
import type { VideoExportOptions } from "./types";
import { captureStepFrame } from "./frame-capture";
import type { Browser } from "puppeteer-core";
import {
  getPuppeteerLaunchOptions,
  getPuppeteerInstance,
} from "./puppeteer-config";

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
  const puppeteer = await getPuppeteerInstance();
  const launchOptions = await getPuppeteerLaunchOptions();
  const browser = await puppeteer.default.launch(launchOptions);

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
          `${logPrefix} [Step ${index + 1}/${steps.length}] Capturing: ${
            step.title || "Untitled"
          }`
        );

        // Log step details for debugging
        console.log(
          `${logPrefix} [Step ${index + 1}] Code length: ${
            step.code?.length || 0
          } chars, Language: ${step.language}`
        );

        // Check browser health
        try {
          const pages = await browser.pages();
          console.log(
            `${logPrefix} [Step ${index + 1}] Browser has ${
              pages.length
            } open page(s)`
          );
        } catch (browserError) {
          console.error(
            `${logPrefix} [Step ${index + 1}] Browser health check failed:`,
            browserError
          );
          throw new Error(
            `Browser is not in a valid state: ${
              browserError instanceof Error
                ? browserError.message
                : String(browserError)
            }`
          );
        }

        const frameBuffers = await captureStepFrame(step, previousStep, {
          width: options.width,
          height: options.height,
          browser,
          currentStepIndex: index,
          totalSteps: steps.length,
        });

        if (!frameBuffers || frameBuffers.length === 0) {
          throw new Error("captureStepFrame returned no frames");
        }

        // Save each frame to disk with sequential numbering
        for (
          let frameIndex = 0;
          frameIndex < frameBuffers.length;
          frameIndex++
        ) {
          const globalFrameIndex = framePaths.length; // Use current length as global index
          const framePath = join(tempDir, `${globalFrameIndex}.png`);
          await writeFile(framePath, frameBuffers[frameIndex]);

          // Validate frame was actually saved
          const stats = await stat(framePath);
          if (stats.size === 0) {
            throw new Error(`Frame file is empty: ${framePath}`);
          }

          framePaths.push(framePath);
        }

        console.log(
          `${logPrefix} [Step ${index + 1}/${steps.length}] ✅ Saved ${
            frameBuffers.length
          } frame(s) (total: ${framePaths.length}) in ${
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

        // Use console.error to ensure it shows up
        console.error(
          `${logPrefix} [Step ${index + 1}/${
            steps.length
          }] ❌ FAILED after ${elapsed}ms (Step: "${stepTitle}"): ${errorMessage}`
        );

        // Log full error stack for debugging
        if (error instanceof Error) {
          console.error(
            `${logPrefix} [Step ${index + 1}] Error name: ${error.name}`
          );
          if (error.stack) {
            console.error(
              `${logPrefix} [Step ${index + 1}] Error stack:`,
              error.stack
            );
          }
          if (error.cause) {
            console.error(
              `${logPrefix} [Step ${index + 1}] Error cause:`,
              error.cause
            );
          }
        }

        errors.push({ index, error: errorMessage });
        // Continue to next step instead of throwing
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
