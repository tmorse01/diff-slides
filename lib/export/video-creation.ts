import { exec } from "child_process";
import { promisify } from "util";
import { join, dirname } from "path";

const execAsync = promisify(exec);

/**
 * Create MP4 video from image frames using ffmpeg
 * @param framePaths - Array of paths to frame images (already in sequential order: 0.png, 1.png, etc.)
 * @param outputPath - Path where the MP4 will be saved
 * @param frameRate - Input frame rate (how fast to read frames)
 * @param width - Video width
 * @param height - Video height
 * @param frameDelay - Duration each frame should be displayed (in seconds)
 */
export async function createMp4FromFrames(
  framePaths: string[],
  outputPath: string,
  frameRate: number,
  width: number,
  height: number,
  frameDelay?: number
): Promise<void> {
  console.log(`[MP4 Creation] Creating MP4 from ${framePaths.length} frames`);

  if (framePaths.length === 0) {
    throw new Error("No frames provided for video creation");
  }

  const mp4FuncStart = Date.now();
  const baseDir = dirname(framePaths[0]);

  // Verify all frames exist
  const { stat } = await import("fs/promises");
  console.log(
    `[MP4 Creation] Verifying ${framePaths.length} frame files exist...`
  );
  for (let i = 0; i < framePaths.length; i++) {
    try {
      const stats = await stat(framePaths[i]);
      if (stats.size === 0) {
        throw new Error(`Frame ${i} is empty: ${framePaths[i]}`);
      }
    } catch (error) {
      throw new Error(
        `Frame ${i} missing or invalid: ${framePaths[i]} - ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
  console.log(`[MP4 Creation] ✅ All ${framePaths.length} frames verified`);

  // Ensure dimensions are divisible by 2 for libx264 (required for yuv420p)
  const evenWidth = width % 2 === 0 ? width : width - 1;
  const evenHeight = height % 2 === 0 ? height : height - 1;

  // If frameDelay is provided, duplicate frames to achieve the desired duration per frame
  // frameDelay is the duration PER FRAME in seconds
  // At 1 fps, each frame = 1 second, so we need to duplicate each frame frameDelay times
  let framesToUse: string[] = framePaths;

  if (frameDelay) {
    const copiesPerFrame = Math.ceil(frameDelay); // Round up to ensure we have enough frames
    console.log(
      `[MP4 Creation] Duplicating ${framePaths.length} frames ${copiesPerFrame} times each (${frameDelay}s per frame)...`
    );

    const { copyFile, rename } = await import("fs/promises");
    const { join } = await import("path");
    const duplicatedFrames: string[] = [];

    // First, rename all original frames to temporary names to avoid conflicts
    const tempFrames: string[] = [];
    for (let i = 0; i < framePaths.length; i++) {
      const tempPath = join(baseDir, `temp_${i}.png`);
      await rename(framePaths[i], tempPath);
      tempFrames.push(tempPath);
    }

    // Now duplicate each frame
    let frameIndex = 0;
    for (let i = 0; i < tempFrames.length; i++) {
      const sourcePath = tempFrames[i];
      let firstCopyPath: string | null = null;

      // Create copies of this frame
      for (let copy = 0; copy < copiesPerFrame; copy++) {
        const destPath = join(baseDir, `${frameIndex}.png`);

        if (copy === 0) {
          // First copy: rename the temp frame
          await rename(sourcePath, destPath);
          firstCopyPath = destPath;
          duplicatedFrames.push(destPath);
        } else {
          // Subsequent copies: copy from the first copy
          if (firstCopyPath) {
            await copyFile(firstCopyPath, destPath);
            duplicatedFrames.push(destPath);
          }
        }
        frameIndex++;
      }
    }

    framesToUse = duplicatedFrames;
    console.log(
      `[MP4 Creation] Created ${framesToUse.length} frame files (${framePaths.length} original × ${copiesPerFrame} copies)`
    );

    // Verify all duplicated frames exist
    console.log(
      `[MP4 Creation] Verifying ${framesToUse.length} duplicated frames exist...`
    );
    for (let i = 0; i < framesToUse.length; i++) {
      try {
        const stats = await stat(framesToUse[i]);
        if (stats.size === 0) {
          throw new Error(`Duplicated frame ${i} is empty: ${framesToUse[i]}`);
        }
      } catch (error) {
        throw new Error(
          `Duplicated frame ${i} missing or invalid: ${framesToUse[i]} - ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
    console.log(
      `[MP4 Creation] ✅ All ${framesToUse.length} duplicated frames verified`
    );
  }

  // Calculate timing
  // Total duration = number of frames * frameDelay (if frameDelay is set)
  // Otherwise use frameRate to calculate duration
  const totalDuration = frameDelay
    ? framePaths.length * frameDelay // Use original frame count * delay per frame
    : framesToUse.length / frameRate;

  // Input framerate: if frameDelay is set, use 1 fps (each duplicated frame = 1 second)
  // Otherwise use the provided frameRate
  const inputFramerate = frameDelay ? 1 : frameRate;
  const outputFps = frameDelay ? 1 : frameRate;

  console.log(`[MP4 Creation] Configuration:`);
  console.log(`  - Original frames: ${framePaths.length}`);
  console.log(`  - Frames to encode: ${framesToUse.length}`);
  console.log(`  - Frame delay: ${frameDelay ?? "N/A"}s per frame`);
  console.log(`  - Total duration: ${totalDuration.toFixed(2)}s`);
  console.log(`  - Input framerate: ${inputFramerate} fps`);
  console.log(`  - Output framerate: ${outputFps} fps`);
  console.log(`  - Resolution: ${evenWidth}x${evenHeight}`);

  // FFmpeg pattern for sequential frames (0.png, 1.png, 2.png, etc.)
  // Frames are now in sequential order starting from 0
  const inputPattern = join(baseDir, "%d.png");

  // Escape paths for Windows (replace backslashes with forward slashes for ffmpeg)
  const escapedInputPattern = inputPattern.replace(/\\/g, "/");
  const escapedOutputPath = outputPath.replace(/\\/g, "/");

  // Build video filter - scale to even dimensions
  const videoFilter = `scale=${evenWidth}:${evenHeight}:flags=lanczos`;

  // FFmpeg command:
  // -framerate sets input frame rate (how fast to read frames from disk)
  // -start_number 0 ensures we start from frame 0
  // -i reads numbered images using pattern
  // -vf applies video filter (scale)
  // -r sets output frame rate
  // -c:v libx264 for H.264 encoding
  // -pix_fmt yuv420p for compatibility
  // -t sets total duration
  // -y to overwrite output
  const command = `ffmpeg -framerate ${inputFramerate} -start_number 0 -i "${escapedInputPattern}" -vf "${videoFilter}" -r ${outputFps} -c:v libx264 -pix_fmt yuv420p -t ${totalDuration} -y "${escapedOutputPath}"`;

  console.log(`[MP4 Creation] Executing ffmpeg command...`);
  console.log(`[MP4 Creation DEBUG] Command: ${command}`);
  console.log(`[MP4 Creation DEBUG] Input pattern: ${escapedInputPattern}`);
  console.log(
    `[MP4 Creation DEBUG] Expected frames: 0.png through ${
      framesToUse.length - 1
    }.png (${framesToUse.length} total)`
  );

  const ffmpegStart = Date.now();
  try {
    const result = await execAsync(command);
    if (result.stdout) {
      console.log(`[MP4 Creation] ffmpeg stdout: ${result.stdout}`);
    }
    if (result.stderr && !result.stderr.includes("frame=")) {
      // FFmpeg writes progress to stderr, so only log if it's not progress info
      console.log(`[MP4 Creation] ffmpeg stderr: ${result.stderr}`);
    }
    console.log(
      `[MP4 Creation] ✅ MP4 created in ${Date.now() - ffmpegStart}ms`
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stderr = (error as { stderr?: string })?.stderr || "";
    const fullError = stderr
      ? `${errorMessage}\n\nFFmpeg stderr:\n${stderr}`
      : errorMessage;
    console.error(`[MP4 Creation] ❌ FFmpeg failed:`, fullError);
    throw new Error(`Failed to create MP4: ${fullError}`);
  }

  console.log(
    `[MP4 Creation] Total MP4 creation time: ${Date.now() - mp4FuncStart}ms`
  );
}
