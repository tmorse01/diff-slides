import { mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import type { Step } from "@/types/database";
import type { VideoExportOptions } from "./types";
import { captureAllFrames } from "./capture-frames";
import { createMp4FromFrames } from "./video-creation";

/**
 * Export project steps as an MP4 video
 */
export async function exportProjectAsMp4(
  projectSlug: string,
  steps: Step[],
  baseUrl: string,
  options: VideoExportOptions
): Promise<Buffer> {
  const startTime = Date.now();
  console.log(
    `[MP4 Export] Starting export for project: ${projectSlug}, steps: ${steps.length}`
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

  const tempDir = join(tmpdir(), `mp4-export-${Date.now()}`);
  let mp4Path: string;

  try {
    // Create temp directory
    console.log(`[MP4 Export] Creating temp directory: ${tempDir}`);
    const tempDirStart = Date.now();
    await mkdir(tempDir, { recursive: true });
    console.log(
      `[MP4 Export] Temp directory created in ${Date.now() - tempDirStart}ms`
    );

    // Capture all frames (server-side rendering - no browser needed!)
    const { framePaths } = await captureAllFrames(
      projectSlug,
      steps,
      baseUrl,
      options,
      tempDir,
      "[MP4 Export]"
    );

    // options.frameDelay is the duration PER FRAME (in seconds)
    // Total duration = number of frames * frameDelay per frame
    const frameDelayPerFrame = options.frameDelay;
    const totalDuration = framePaths.length * frameDelayPerFrame;
    const frameRate = 10; // Use 10 fps for MP4 creation (smooth but not too large)
    console.log(
      `[MP4 Export] Frame delay: ${frameDelayPerFrame}s per frame, Frames: ${framePaths.length}, Total duration: ${totalDuration}s, Frame rate: ${frameRate} fps`
    );

    // Get dimensions from first frame (we'll read it to get actual size)
    console.log(`[MP4 Export] Reading first frame to get dimensions...`);
    const dimStart = Date.now();
    const fs = await import("fs/promises");
    const firstFrameBuffer = await fs.readFile(framePaths[0]);
    const { PNG } = await import("pngjs");
    const firstFramePng = PNG.sync.read(firstFrameBuffer);
    const width = options.width ?? firstFramePng.width;
    const height = options.height ?? firstFramePng.height;
    console.log(
      `[MP4 Export] Dimensions: ${width}x${height} (read in ${
        Date.now() - dimStart
      }ms)`
    );

    // Create MP4 from frames
    console.log(
      `[MP4 Export] Creating MP4 from ${framePaths.length} frames...`
    );
    const mp4Start = Date.now();
    mp4Path = join(tempDir, "output.mp4");
    await createMp4FromFrames(
      framePaths,
      mp4Path,
      frameRate,
      width,
      height,
      frameDelayPerFrame
    );
    console.log(`[MP4 Export] MP4 created in ${Date.now() - mp4Start}ms`);

    // Read MP4 file
    console.log(`[MP4 Export] Reading MP4 file...`);
    const readStart = Date.now();
    const mp4Buffer = await fs.readFile(mp4Path);
    console.log(
      `[MP4 Export] MP4 file read in ${Date.now() - readStart}ms (${(
        mp4Buffer.length / 1024
      ).toFixed(2)}KB)`
    );

    // Validate MP4 file using ffprobe
    console.log(`[MP4 Export] Validating MP4 file...`);
    const validateStart = Date.now();
    try {
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);

      const escapedMp4Path = mp4Path.replace(/\\/g, "/");
      const ffprobeCommand = `ffprobe -v error -show_entries format=duration:stream=codec_type,width,height -of json "${escapedMp4Path}"`;

      const result = await execAsync(ffprobeCommand);
      const probeData = JSON.parse(result.stdout);

      const format = probeData.format;
      const videoStream = probeData.streams?.find(
        (s: { codec_type: string }) => s.codec_type === "video"
      );

      if (!videoStream) {
        throw new Error("MP4 file has no video stream");
      }

      const actualDuration = parseFloat(format.duration || "0");
      const expectedDuration = steps.length * options.frameDelay; // Total = frames * delay per frame

      console.log(`[MP4 Export] Validation results:`);
      console.log(
        `  - Duration: ${actualDuration.toFixed(
          2
        )}s (expected: ${expectedDuration.toFixed(2)}s)`
      );
      console.log(`  - Resolution: ${videoStream.width}x${videoStream.height}`);
      console.log(`  - File size: ${(mp4Buffer.length / 1024).toFixed(2)}KB`);

      // Allow small tolerance for duration (within 0.5 seconds)
      const durationDiff = Math.abs(actualDuration - expectedDuration);
      if (durationDiff > 0.5) {
        console.warn(
          `[MP4 Export] WARNING: Duration mismatch! Expected ${expectedDuration.toFixed(
            2
          )}s, got ${actualDuration.toFixed(2)}s (diff: ${durationDiff.toFixed(
            2
          )}s)`
        );
      } else {
        console.log(
          `[MP4 Export] ✅ Duration validation passed (diff: ${durationDiff.toFixed(
            2
          )}s)`
        );
      }

      if (actualDuration < 0.1) {
        throw new Error(
          `MP4 file is too short (${actualDuration.toFixed(
            2
          )}s). Expected at least ${expectedDuration.toFixed(2)}s.`
        );
      }

      console.log(
        `[MP4 Export] Validation completed in ${Date.now() - validateStart}ms`
      );
    } catch (error) {
      console.error(
        `[MP4 Export] Validation failed after ${Date.now() - validateStart}ms:`,
        error
      );
      // Don't throw - still return the file, but log the warning
      console.warn(
        `[MP4 Export] WARNING: MP4 validation failed, but returning file anyway`
      );
    }

    console.log(`[MP4 Export] Total export time: ${Date.now() - startTime}ms`);

    return mp4Buffer;
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
