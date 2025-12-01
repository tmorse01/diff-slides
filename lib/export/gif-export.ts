import puppeteer, { type Browser, type Page } from "puppeteer";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import type { Step } from "@/types/database";

const execAsync = promisify(exec);

export interface GifExportOptions {
  frameDelay: number; // Delay in seconds per frame
  width?: number;
  height?: number;
  quality?: number; // 1-100, higher is better quality but larger file
  cookies?: Array<{ name: string; value: string }>; // Cookies for Puppeteer authentication
}

/**
 * Capture a screenshot of a single step from the viewer page
 */
export async function captureStepFrame(
  page: Page,
  baseUrl: string,
  projectSlug: string,
  stepIndex: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options: { width?: number; height?: number } = {}
): Promise<Buffer> {
  const url = `${baseUrl}/view/${projectSlug}?stepIndex=${stepIndex}`;

  console.log(`[Frame Capture ${stepIndex + 1}] Navigating to: ${url}`);
  const navStart = Date.now();

  try {
    // Use less strict wait condition - domcontentloaded is faster than networkidle0
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    console.log(
      `[Frame Capture ${stepIndex + 1}] Navigation completed in ${
        Date.now() - navStart
      }ms`
    );
  } catch (error) {
    console.error(
      `[Frame Capture ${stepIndex + 1}] Navigation failed after ${
        Date.now() - navStart
      }ms:`,
      error
    );
    throw new Error(
      `Failed to navigate to viewer page: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  // Wait for the DiffView component to be fully rendered
  // Look for the code content area
  const selectorStart = Date.now();
  try {
    // Try multiple selectors in case the page structure varies
    await Promise.race([
      page.waitForSelector('[class*="bg-card"]', { timeout: 10000 }),
      page.waitForSelector('div[class*="border"]', { timeout: 10000 }),
      page.waitForSelector("pre", { timeout: 10000 }), // Fallback to code element
    ]);
    console.log(
      `[Frame Capture ${stepIndex + 1}] Selector found in ${
        Date.now() - selectorStart
      }ms`
    );
  } catch (error) {
    console.error(
      `[Frame Capture ${stepIndex + 1}] Selector not found after ${
        Date.now() - selectorStart
      }ms:`,
      error
    );
    throw new Error(
      `Page did not load properly: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  // Wait a bit more for syntax highlighting to complete (Shiki is async)
  // But reduce the wait time
  const waitStart = Date.now();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(
    `[Frame Capture ${stepIndex + 1}] Waited for rendering in ${
      Date.now() - waitStart
    }ms`
  );

  // Find the main diff view container
  const elementStart = Date.now();
  const diffViewSelector = 'div[class*="bg-card"][class*="border"]';
  const element = await page.$(diffViewSelector);

  if (!element) {
    console.error(
      `[Frame Capture ${stepIndex + 1}] Element not found after ${
        Date.now() - elementStart
      }ms`
    );
    throw new Error(
      `Could not find DiffView element for step ${
        stepIndex + 1
      }. The page may not have rendered correctly.`
    );
  }
  console.log(
    `[Frame Capture ${stepIndex + 1}] Element found in ${
      Date.now() - elementStart
    }ms`
  );

  // Capture screenshot of the element
  const screenshotStart = Date.now();
  let screenshot: Buffer | string | Uint8Array | null;
  try {
    console.log(`[Frame Capture ${stepIndex + 1}] Starting screenshot...`);

    // Check if element is visible before screenshot
    const isVisible = await element.isIntersectingViewport();
    console.log(
      `[Frame Capture ${stepIndex + 1}] Element visible: ${isVisible}`
    );

    // Try screenshot without clip first (simpler, faster)
    const screenshotResult = await Promise.race([
      element.screenshot({
        type: "png",
      }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Screenshot timeout")),
          10000 // 10 second timeout for screenshot
        )
      ),
    ]);
    screenshot = screenshotResult;
    console.log(
      `[Frame Capture ${stepIndex + 1}] Screenshot captured in ${
        Date.now() - screenshotStart
      }ms`
    );
  } catch (error) {
    console.error(
      `[Frame Capture ${stepIndex + 1}] Screenshot failed after ${
        Date.now() - screenshotStart
      }ms:`,
      error
    );
    throw new Error(
      `Failed to capture screenshot: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  if (!screenshot) {
    throw new Error(
      `Screenshot returned null for step ${
        stepIndex + 1
      }. The element may not be visible.`
    );
  }

  if (typeof screenshot === "string") {
    return Buffer.from(screenshot, "base64");
  }

  if (screenshot instanceof Uint8Array) {
    return Buffer.from(screenshot);
  }

  return screenshot;
}

/**
 * Create MP4 video from image frames using ffmpeg
 */
async function createMp4FromFrames(
  framePaths: string[],
  outputPath: string,
  frameRate: number,
  width: number,
  height: number
): Promise<void> {
  console.log(
    `[MP4 Creation] Starting MP4 creation from ${framePaths.length} frames`
  );
  const mp4FuncStart = Date.now();

  // Rename files to start from 0.png for ffmpeg compatibility
  // ffmpeg expects files to start from 0 when using %d pattern
  console.log(
    `[MP4 Creation] Renaming ${framePaths.length} files to start from 0.png...`
  );
  const renameStart = Date.now();
  const { rename } = await import("fs/promises");
  const { dirname, join } = await import("path");

  const tempRenamedPaths: string[] = [];
  const baseDir = dirname(framePaths[0]);

  // Rename files to 0.png, 1.png, 2.png, etc.
  for (let i = 0; i < framePaths.length; i++) {
    const oldPath = framePaths[i];
    const newPath = join(baseDir, `${i}.png`);
    if (oldPath !== newPath) {
      await rename(oldPath, newPath);
    }
    tempRenamedPaths.push(newPath);
  }
  console.log(`[MP4 Creation] Files renamed in ${Date.now() - renameStart}ms`);

  // Create ffmpeg command to create MP4 from images
  // Use pattern matching for input files starting from 0
  const inputPattern = join(baseDir, "%d.png");

  // Escape paths for Windows (replace backslashes with forward slashes for ffmpeg)
  const escapedInputPattern = inputPattern.replace(/\\/g, "/");
  const escapedOutputPath = outputPath.replace(/\\/g, "/");

  // Ensure dimensions are divisible by 2 for libx264 (required for yuv420p)
  // Round down to nearest even number
  const evenWidth = width % 2 === 0 ? width : width - 1;
  const evenHeight = height % 2 === 0 ? height : height - 1;

  // ffmpeg command: -framerate sets input frame rate, -i reads numbered images
  // -vf scale ensures consistent dimensions, -c:v libx264 for H.264 encoding
  // -pix_fmt yuv420p for compatibility, -y to overwrite output
  const command = `ffmpeg -framerate ${frameRate} -i "${escapedInputPattern}" -vf "scale=${evenWidth}:${evenHeight}:flags=lanczos" -c:v libx264 -pix_fmt yuv420p -y "${escapedOutputPath}"`;

  console.log(`[MP4 Creation] Executing ffmpeg command: ${command}`);
  const ffmpegStart = Date.now();
  try {
    const result = await execAsync(command);
    console.log(`[MP4 Creation] ffmpeg stdout: ${result.stdout}`);
    if (result.stderr) {
      console.log(`[MP4 Creation] ffmpeg stderr: ${result.stderr}`);
    }
    console.log(
      `[MP4 Creation] MP4 creation completed in ${Date.now() - ffmpegStart}ms`
    );
  } catch (error: unknown) {
    console.error(
      `[MP4 Creation] ffmpeg failed after ${Date.now() - ffmpegStart}ms`
    );
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stderr = (error as { stderr?: string })?.stderr || "";
    const fullError = stderr
      ? `${errorMessage}\n\nFFmpeg stderr:\n${stderr}`
      : errorMessage;
    console.error(`[MP4 Creation] Full error:`, fullError);
    throw new Error(`Failed to create MP4: ${fullError}`);
  }
  console.log(
    `[MP4 Creation] Total MP4 creation time: ${Date.now() - mp4FuncStart}ms`
  );
}

/**
 * Convert MP4 to GIF using ffmpeg with palette optimization
 */
async function convertMp4ToGif(
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

  let browser: Browser | null = null;
  const tempDir = join(tmpdir(), `gif-export-${Date.now()}`);
  const framePaths: string[] = [];
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

    // Launch Puppeteer
    console.log(`[GIF Export] Launching Puppeteer browser...`);
    const browserStart = Date.now();
    const launchPromise = puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
      timeout: 30000,
    });

    browser = await Promise.race([
      launchPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Puppeteer launch timeout")), 30000)
      ),
    ]);
    console.log(
      `[GIF Export] Browser launched in ${Date.now() - browserStart}ms`
    );

    // Create one page per step for true parallelization
    console.log(`[GIF Export] Creating ${steps.length} browser pages...`);
    const pagesStart = Date.now();
    const pages: Page[] = [];

    // Create all pages upfront
    for (let i = 0; i < steps.length; i++) {
      const pageStart = Date.now();
      const page = await browser.newPage();
      await page.setViewport({
        width: options.width ?? 1200,
        height: options.height ?? 800,
        deviceScaleFactor: 1,
      });
      page.setDefaultTimeout(20000); // 20 seconds per page operation
      pages.push(page);
      console.log(
        `[GIF Export] Page ${i + 1}/${steps.length} created in ${
          Date.now() - pageStart
        }ms`
      );
    }
    console.log(
      `[GIF Export] All pages created in ${Date.now() - pagesStart}ms`
    );

    // Capture frames in parallel - each page handles one frame
    console.log(
      `[GIF Export] Starting parallel frame capture for ${steps.length} steps...`
    );
    const captureStart = Date.now();
    const framePromises = steps.map(async (step, index) => {
      const page = pages[index];

      try {
        const frameBuffer = await Promise.race([
          captureStepFrame(page, baseUrl, projectSlug, index, {
            width: options.width,
            height: options.height,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error(`Timeout capturing frame ${index + 1}`)),
              20000 // 20 seconds per frame
            )
          ),
        ]);

        // Save frame to disk (will be renamed to start from 0 later)
        const framePath = join(tempDir, `${index + 1}.png`);
        await writeFile(framePath, frameBuffer);
        return framePath;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Unknown error capturing frame ${index + 1}`;
        console.error(
          `Error capturing frame for step ${index + 1}:`,
          errorMessage
        );
        throw new Error(`Step ${index + 1}: ${errorMessage}`);
      }
    });

    // Wait for all frames to be captured (in parallel)
    console.log(
      `[GIF Export] Waiting for all ${steps.length} frames to be captured...`
    );
    const frameResults = await Promise.allSettled(framePromises);
    console.log(
      `[GIF Export] All frame captures completed in ${
        Date.now() - captureStart
      }ms`
    );

    frameResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        framePaths[index] = result.value;
        console.log(`[GIF Export] Frame ${index + 1}: SUCCESS`);
      } else {
        console.error(
          `[GIF Export] Frame ${index + 1}: FAILED - ${result.reason}`
        );
      }
    });

    // Close all pages
    console.log(`[GIF Export] Closing all browser pages...`);
    const closeStart = Date.now();
    await Promise.all(pages.map((page) => page.close().catch(() => {})));
    console.log(
      `[GIF Export] All pages closed in ${Date.now() - closeStart}ms`
    );

    // Filter out undefined frames
    const validFramePaths = framePaths.filter(
      (path): path is string => path !== undefined
    );

    console.log(
      `[GIF Export] Valid frames: ${validFramePaths.length}/${steps.length}`
    );

    if (validFramePaths.length === 0) {
      throw new Error("Failed to capture any frames");
    }

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
    const firstFrameBuffer = await fs.readFile(validFramePaths[0]);
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
      `[GIF Export] Creating MP4 from ${validFramePaths.length} frames...`
    );
    const mp4Start = Date.now();
    mp4Path = join(tempDir, "output.mp4");
    await createMp4FromFrames(
      validFramePaths,
      mp4Path,
      frameRate,
      width,
      height
    );
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
    // Cleanup: close browser and delete temp files
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.error("Error closing browser:", error);
      }
    }

    // Clean up temp files
    try {
      const { rm } = await import("fs/promises");
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    } catch (error) {
      console.error("Error cleaning up temp files:", error);
    }
  }
}
