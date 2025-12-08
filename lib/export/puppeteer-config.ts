/**
 * Puppeteer configuration for serverless environments (Vercel)
 * Uses @sparticuz/chromium in production, regular Puppeteer in development
 */
import type { LaunchOptions } from "puppeteer-core";

/**
 * Get Puppeteer launch options that work in both development and production
 * In production (Vercel), uses @sparticuz/chromium
 * In development, uses regular puppeteer (which includes Chromium)
 */
export async function getPuppeteerLaunchOptions(
  additionalArgs: string[] = []
): Promise<LaunchOptions> {
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEL === "1";

  // Base args for all environments
  const args = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-web-security",
    "--disable-features=IsolateOrigins,site-per-process",
    ...additionalArgs,
  ];

  // In Vercel/production, always use @sparticuz/chromium
  if (isProduction || isVercel) {
    try {
      // @sparticuz/chromium comes with its own TypeScript types
      const chromiumModule = await import("@sparticuz/chromium");
      // Handle default export (ESM) or direct export (CommonJS)
      // Use type assertion through unknown to properly access properties
      // The chromium module exports an object with these properties
      const chromiumRaw = chromiumModule.default || chromiumModule;
      const chromium = chromiumRaw as unknown as {
        executablePath: () => Promise<string>;
        args: string[];
        defaultViewport?: {
          width: number;
          height: number;
          deviceScaleFactor?: number;
        } | null;
        headless: boolean | "shell";
      };

      // Note: Graphics mode configuration is handled automatically by @sparticuz/chromium
      // for serverless environments. No manual configuration needed.

      // Set executable path for Chromium - this extracts and returns the path
      const executablePath = await chromium.executablePath();

      // Get chromium args - these are optimized for serverless environments
      const chromiumArgs = chromium.args || [];

      // Extract viewport and headless settings
      const defaultViewport = chromium.defaultViewport || undefined;
      const headlessMode =
        chromium.headless === "shell" ? true : chromium.headless;

      return {
        args: [...args, ...chromiumArgs],
        defaultViewport,
        executablePath,
        headless: headlessMode,
      };
    } catch (error) {
      console.error(
        "[Puppeteer Config] Failed to load @sparticuz/chromium in production:",
        error
      );
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to load Chromium for Puppeteer. This is required in production environments. Make sure @sparticuz/chromium is installed. Error: ${errorMessage}`
      );
    }
  }

  // In development, use default Puppeteer (which includes Chromium)
  // puppeteer-core will look for Chromium in node_modules/.cache/puppeteer
  // or we can let it use the system default
  return {
    headless: true,
    args,
  };
}

/**
 * Get the appropriate Puppeteer instance based on environment
 * In development, uses regular puppeteer (includes Chromium)
 * In production, uses puppeteer-core (lighter, no bundled Chromium)
 */
export async function getPuppeteerInstance(): Promise<
  typeof import("puppeteer-core")
> {
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEL === "1";

  // In production, always use puppeteer-core
  if (isProduction || isVercel) {
    return await import("puppeteer-core");
  }

  // In development, try to use regular puppeteer (includes Chromium)
  // Fall back to puppeteer-core if puppeteer is not available
  try {
    return await import("puppeteer");
  } catch {
    // Fallback to puppeteer-core if regular puppeteer is not available
    return await import("puppeteer-core");
  }
}
