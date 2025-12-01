import { mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import type { Step } from "@/types/database";
import type { GifExportOptions } from "./types";
import { captureAllFrames } from "./capture-frames";
import { createMp4FromFrames } from "./video-creation";
import { convertMp4ToGif } from "./gif-conversion";

/**
 * Export project steps as an animated GIF via MP4
 */
export async function exportProjectAsGif(
  projectSlug: string,
  steps: Step[],
  baseUrl: string,
  options: GifExportOptions
): Promise<Buffer> {
  const startTime = Date.now();
  console.log(
    `[GIF Export] Starting export for project: ${projectSlug}, steps: ${steps.length}`
  );

  if (steps.length === 0) {
    throw new Error("Project has no steps to export");
  }

  // Limit number of steps to prevent very long exports
  const MAX_STEPS = 50;
  if (steps.length > MAX_STEPS) {
    throw new Error(
      `Project has too many steps (${steps.length}). Maximum ${MAX_STEPS} steps allowed for export.`
    );
  }

  const tempDir = join(tmpdir(), `gif-export-${Date.now()}`);
  let mp4Path: string;
  let gifPath: string;

  try {
    // Create temp directory
    console.log(`[GIF Export] Creating temp directory: ${tempDir}`);
    const tempDirStart = Date.now();
    await mkdir(tempDir, { recursive: true });
    console.log(
      `[GIF Export] Temp directory created in ${Date.now() - tempDirStart}ms`
    );

    // Capture all frames (server-side rendering - no browser needed!)
    const { framePaths } = await captureAllFrames(
      projectSlug,
      steps,
      baseUrl,
      options,
      tempDir,
      "[GIF Export]"
    );

    // Calculate frame rate - use a reasonable fps (10) for smooth animation
    // The frame delay option determines how long each frame is shown in the final GIF
    // For MP4 creation, we use a standard frame rate, then adjust timing in GIF conversion
    const frameRate = 10; // Use 10 fps for MP4 creation (smooth but not too large)
    console.log(
      `[GIF Export] Frame rate: ${frameRate} fps (frame delay: ${options.frameDelay}s)`
    );

    // Get dimensions from first frame (we'll read it to get actual size)
    console.log(`[GIF Export] Reading first frame to get dimensions...`);
    const dimStart = Date.now();
    const fs = await import("fs/promises");
    const firstFrameBuffer = await fs.readFile(framePaths[0]);
    const { PNG } = await import("pngjs");
    const firstFramePng = PNG.sync.read(firstFrameBuffer);
    const width = options.width ?? firstFramePng.width;
    const height = options.height ?? firstFramePng.height;
    console.log(
      `[GIF Export] Dimensions: ${width}x${height} (read in ${
        Date.now() - dimStart
      }ms)`
    );

    // Create MP4 from frames
    console.log(
      `[GIF Export] Creating MP4 from ${framePaths.length} frames...`
    );
    const mp4Start = Date.now();
    mp4Path = join(tempDir, "output.mp4");
    await createMp4FromFrames(framePaths, mp4Path, frameRate, width, height);
    console.log(`[GIF Export] MP4 created in ${Date.now() - mp4Start}ms`);

    // Convert MP4 to GIF
    console.log(`[GIF Export] Converting MP4 to GIF...`);
    const gifStart = Date.now();
    gifPath = join(tempDir, "output.gif");
    await convertMp4ToGif(mp4Path, gifPath, width, options.frameDelay);
    console.log(`[GIF Export] GIF created in ${Date.now() - gifStart}ms`);

    // Read GIF file
    console.log(`[GIF Export] Reading GIF file...`);
    const readStart = Date.now();
    const gifBuffer = await fs.readFile(gifPath);
    console.log(
      `[GIF Export] GIF file read in ${Date.now() - readStart}ms (${(
        gifBuffer.length / 1024
      ).toFixed(2)}KB)`
    );

    console.log(`[GIF Export] Total export time: ${Date.now() - startTime}ms`);

    return gifBuffer;
  } catch (error) {
    // Re-throw with more context
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      `Export failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  } finally {
    // Clean up temp files (no browser to close anymore!)
    try {
      const { rm } = await import("fs/promises");
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    } catch (error) {
      console.error("Error cleaning up temp files:", error);
    }
  }
}
