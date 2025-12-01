import { exec } from "child_process";
import { promisify } from "util";
import { unlink } from "fs/promises";

const execAsync = promisify(exec);

/**
 * Convert MP4 to GIF using ffmpeg with palette optimization
 */
export async function convertMp4ToGif(
  mp4Path: string,
  gifPath: string,
  width: number,
  frameDelay: number
): Promise<void> {
  console.log(
    `[GIF Conversion] Starting MP4 to GIF conversion (frame delay: ${frameDelay}s)`
  );
  const gifFuncStart = Date.now();
  const palettePath = mp4Path.replace(".mp4", "_palette.png");

  // Escape paths for Windows
  const escapedMp4Path = mp4Path.replace(/\\/g, "/");
  const escapedGifPath = gifPath.replace(/\\/g, "/");
  const escapedPalettePath = palettePath.replace(/\\/g, "/");

  // For GIF conversion, we need to ensure we have frames to output
  // The frameDelay is how long each frame should be displayed in the final GIF
  // But we need to use a reasonable fps that will actually produce frames
  // Use a minimum of 1 fps to ensure we get at least some frames, then adjust delay in GIF
  // For very short videos, we'll use the original frame rate and let GIF handle the timing
  const minFps = 1; // Minimum 1 fps to ensure frames are output
  const gifFps = Math.max(minFps, 1 / frameDelay);
  // Clamp to reasonable range (1 to 10 fps)
  const clampedFps = Math.max(1, Math.min(10, gifFps));
  console.log(
    `[GIF Conversion] Using ${clampedFps} fps for GIF conversion (frame delay will be ${frameDelay}s per frame in final GIF)`
  );

  try {
    // Verify MP4 file exists before generating palette
    const { stat: statFs } = await import("fs/promises");
    try {
      const mp4Stats = await statFs(mp4Path);
      console.log(
        `[GIF Conversion] MP4 file verified: ${mp4Path} (${mp4Stats.size} bytes)`
      );
    } catch {
      throw new Error(`MP4 file does not exist: ${mp4Path}`);
    }

    // Step 1: Generate palette from video
    console.log(`[GIF Conversion] Step 1: Generating palette...`);
    const paletteStart = Date.now();
    // Ensure width is even for palette generation too
    const evenWidth = width % 2 === 0 ? width : width - 1;
    // Try a simpler palette command that should work even for very short videos
    const paletteCommand = `ffmpeg -i "${escapedMp4Path}" -vf "scale=${evenWidth}:-1:flags=lanczos,palettegen" -frames:v 1 -y "${escapedPalettePath}"`;
    console.log(`[GIF Conversion] Palette command: ${paletteCommand}`);
    console.log(`[GIF Conversion] Palette output path: ${palettePath}`);
    try {
      const paletteResult = await execAsync(paletteCommand, {
        maxBuffer: 10 * 1024 * 1024,
      });
      console.log(`[GIF Conversion] Palette stdout: ${paletteResult.stdout}`);
      if (paletteResult.stderr) {
        console.log(`[GIF Conversion] Palette stderr: ${paletteResult.stderr}`);
        // Check if stderr contains actual errors (not just warnings/info)
        const stderrLower = paletteResult.stderr.toLowerCase();
        if (
          stderrLower.includes("error opening") ||
          stderrLower.includes("no such file") ||
          (stderrLower.includes("error") && !stderrLower.includes("deprecated"))
        ) {
          throw new Error(`FFmpeg reported errors: ${paletteResult.stderr}`);
        }
      }
    } catch (paletteError: unknown) {
      const errorMessage =
        paletteError instanceof Error
          ? paletteError.message
          : String(paletteError);
      const stderr = (paletteError as { stderr?: string })?.stderr || "";
      const fullError = stderr
        ? `${errorMessage}\n\nFFmpeg stderr:\n${stderr}`
        : errorMessage;
      console.error(`[GIF Conversion] Palette generation failed:`, fullError);
      throw new Error(`Failed to generate palette: ${fullError}`);
    }

    // Verify palette file was created - wait a bit for file system to sync
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const stats = await statFs(palettePath);
      console.log(
        `[GIF Conversion] Palette file verified: ${palettePath} (${stats.size} bytes)`
      );
    } catch (err) {
      console.error(`[GIF Conversion] Palette file check failed:`, err);
      // List files in the directory to debug
      const { readdir } = await import("fs/promises");
      const { dirname } = await import("path");
      const dirFiles = await readdir(dirname(palettePath));
      console.error(`[GIF Conversion] Files in temp directory:`, dirFiles);
      throw new Error(
        `Palette file was not created: ${palettePath}. Files in directory: ${dirFiles.join(
          ", "
        )}`
      );
    }

    console.log(
      `[GIF Conversion] Palette generated in ${Date.now() - paletteStart}ms`
    );

    // Step 2: Convert MP4 to GIF using the palette
    console.log(
      `[GIF Conversion] Step 2: Converting MP4 to GIF with palette...`
    );
    const convertStart = Date.now();
    // Ensure width is even for GIF conversion too
    const evenWidthGif = width % 2 === 0 ? width : width - 1;
    // Don't use fps filter - use all frames from the MP4
    // The frameDelay parameter is for future use if we want to control GIF frame timing
    const gifCommand = `ffmpeg -i "${escapedMp4Path}" -i "${escapedPalettePath}" -filter_complex "scale=${evenWidthGif}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer" -gifflags +transdiff -y "${escapedGifPath}"`;
    console.log(`[GIF Conversion] GIF command: ${gifCommand}`);
    const gifResult = await execAsync(gifCommand);
    console.log(`[GIF Conversion] GIF stdout: ${gifResult.stdout}`);
    if (gifResult.stderr) {
      console.log(`[GIF Conversion] GIF stderr: ${gifResult.stderr}`);
    }
    console.log(
      `[GIF Conversion] GIF conversion completed in ${
        Date.now() - convertStart
      }ms`
    );

    // Clean up palette file
    await unlink(palettePath).catch(() => {});
    console.log(
      `[GIF Conversion] Total conversion time: ${Date.now() - gifFuncStart}ms`
    );
  } catch (error: unknown) {
    console.error(
      `[GIF Conversion] Error after ${Date.now() - gifFuncStart}ms:`,
      error
    );
    // Clean up palette file on error
    await unlink(palettePath).catch(() => {});
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stderr = (error as { stderr?: string })?.stderr || "";
    const fullError = stderr
      ? `${errorMessage}\n\nFFmpeg stderr:\n${stderr}`
      : errorMessage;
    console.error(`[GIF Conversion] Full error:`, fullError);
    throw new Error(`Failed to convert MP4 to GIF: ${fullError}`);
  }
}

