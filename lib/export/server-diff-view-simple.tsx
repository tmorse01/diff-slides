/**
 * Simple server-side DiffView renderer using HTML-to-image
 * Much simpler than satori - just render HTML and convert to image
 */
import { computeDiff } from "@/lib/diff";
import { codeToHtml } from "shiki";
import type { Browser } from "puppeteer-core";
import { getPuppeteerLaunchOptions } from "./puppeteer-config";

interface LineRange {
  startLine: number; // 1-based line number (inclusive)
  endLine: number; // 1-based line number (inclusive)
}

interface ServerDiffViewProps {
  previousCode: string;
  currentCode: string;
  language: string;
  stepTitle?: string;
  fileName?: string;
  width?: number;
  height?: number;
  browser?: Browser; // Optional browser instance to reuse
  currentStepIndex?: number; // 0-based index of current step
  totalSteps?: number; // Total number of steps
  lineRange?: LineRange; // Optional line range to display (1-based, inclusive)
}

// Map language names to shiki language IDs
const languageMap: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  tsx: "tsx",
  jsx: "tsx",
  python: "python",
  html: "html",
  css: "css",
  json: "json",
};

export async function renderDiffViewToImage(
  props: ServerDiffViewProps
): Promise<Buffer> {
  const {
    previousCode,
    currentCode,
    language,
    stepTitle,
    fileName,
    width = 1200,
    height = 800,
    currentStepIndex = 0,
    totalSteps = 1,
    lineRange,
  } = props;

  // Compute diff
  let diff = computeDiff(previousCode || "", currentCode || "");
  const shikiLang = languageMap[language.toLowerCase()] || "typescript";

  // Filter lines by range if specified (1-based, inclusive)
  // Note: Removed lines don't have line numbers, so we keep them for context if they're near the range
  if (lineRange) {
    const { startLine, endLine } = lineRange;
    const filteredLines: typeof diff.lines = [];
    let lastKeptLineNumber = -1;

    for (const line of diff.lines) {
      if (line.lineNumber === undefined) {
        // Removed lines - keep if they're near the range (within 5 lines for context)
        if (
          lastKeptLineNumber >= startLine - 5 &&
          lastKeptLineNumber <= endLine + 5
        ) {
          filteredLines.push(line);
        }
      } else if (line.lineNumber >= startLine && line.lineNumber <= endLine) {
        filteredLines.push(line);
        lastKeptLineNumber = line.lineNumber;
      }
    }

    diff = {
      ...diff,
      lines: filteredLines,
    };
  }

  // Get syntax highlighting - Shiki is optional, fallback to plain text immediately
  let highlightedLines: Array<{
    html: string;
    type: "added" | "removed" | "unchanged";
  }> = [];

  try {
    const fullCode = diff.lines.map((line) => line.value || " ").join("\n");
    const html = await codeToHtml(fullCode, {
      lang: shikiLang,
      theme: "one-dark-pro",
    });

    // Parse HTML to extract line-by-line highlighting
    const codeMatch = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
    if (codeMatch) {
      const innerHTML = codeMatch[1];
      const htmlLines = innerHTML.split(/\n/);

      diff.lines.forEach((diffLine, index) => {
        const lineHtml = htmlLines[index] || escapeHtml(diffLine.value || " ");
        highlightedLines.push({
          html: lineHtml || " ",
          type: diffLine.type,
        });
      });
    } else {
      // Fallback - no complex parsing, just use plain text
      highlightedLines = diff.lines.map((line) => ({
        html: escapeHtml(line.value || " "),
        type: line.type,
      }));
    }
  } catch (error) {
    console.warn("Shiki failed, using plain text:", error);
    // Immediate fallback - no retries, no complexity
    highlightedLines = diff.lines.map((line) => ({
      html: escapeHtml(line.value || " "),
      type: line.type,
    }));
  }

  // Get file extension for display
  const fileExt =
    fileName ||
    (() => {
      if (language === "tsx" || language === "typescript") return "tsx";
      if (language === "jsx" || language === "javascript") return "jsx";
      return language;
    })();

  // Build stepper HTML
  const stepperHtml = `
    <div class="stepper">
      <button class="stepper-button" ${
        currentStepIndex === 0 ? "disabled" : ""
      }>
        <span class="stepper-chevron">‹</span>
        Previous
      </button>
      <div class="stepper-dots">
        ${Array.from({ length: totalSteps }, (_, i) => {
          const isActive = i === currentStepIndex;
          return `<div class="stepper-dot ${
            isActive ? "active" : ""
          }" aria-label="Step ${i + 1}"></div>`;
        }).join("")}
      </div>
      <button class="stepper-button" ${
        currentStepIndex === totalSteps - 1 ? "disabled" : ""
      }>
        Next
        <span class="stepper-chevron">›</span>
      </button>
    </div>
  `;

  // Build HTML string
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      background: #0a0a0a;
      color: #d4d4d4;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .page-container {
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      display: flex;
      flex-direction: column;
      background: #1e1e1e;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    .container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      min-height: 0;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #252526;
      border-bottom: 1px solid #3e3e42;
      flex-shrink: 0;
    }
    .window-controls {
      display: flex;
      gap: 8px;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .dot-red { background: #ff5f56; }
    .dot-yellow { background: #ffbd2e; }
    .dot-green { background: #27c93f; }
    .filename {
      font-size: 14px;
      color: #cccccc;
      font-family: monospace;
    }
    .title {
      padding: 12px 24px;
      background: #2d2d30;
      border-bottom: 1px solid #3e3e42;
      font-size: 14px;
      font-weight: 600;
      color: #cccccc;
      flex-shrink: 0;
    }
    .code-container {
      flex: 1;
      display: flex;
      overflow: hidden;
      background: #1e1e1e;
      min-height: 0;
    }
    .code-scroll-wrapper {
      flex: 1;
      display: flex;
      overflow-y: auto;
      overflow-x: auto;
      min-width: 0;
    }
    .line-numbers {
      width: 48px;
      background: #252526;
      border-right: 1px solid #3e3e42;
      padding: 24px 8px;
      display: flex;
      flex-direction: column;
      font-size: 12px;
      color: #858585;
      font-family: monospace;
      flex-shrink: 0;
    }
    .line-number {
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-shrink: 0;
    }
    .code-content {
      flex: 1;
      padding: 24px;
      font-size: 14px;
      line-height: 24px;
      min-width: 0;
    }
    .code-line {
      padding: 4px 8px;
      margin-left: -24px;
      margin-right: -24px;
      padding-left: 24px;
      padding-right: 24px;
      white-space: pre;
    }
    .line-added {
      background: rgba(74, 222, 128, 0.1);
      border-left: 2px solid #4ade80;
    }
    .line-removed {
      background: rgba(248, 113, 113, 0.1);
      border-left: 2px solid #f87171;
      text-decoration: line-through;
      opacity: 0.7;
    }
    .stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: #252526;
      border-top: 1px solid #3e3e42;
      flex-shrink: 0;
    }
    .stepper-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: transparent;
      border: none;
      color: #cccccc;
      font-size: 14px;
      cursor: pointer;
      font-family: inherit;
      transition: opacity 0.2s;
    }
    .stepper-button:hover:not(:disabled) {
      opacity: 0.8;
    }
    .stepper-button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .stepper-chevron {
      font-size: 18px;
      line-height: 1;
    }
    .stepper-dots {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stepper-dot {
      width: 8px;
      height: 8px;
      border-radius: 4px;
      background: rgba(204, 204, 204, 0.3);
      transition: all 0.2s;
    }
    .stepper-dot.active {
      width: 24px;
      background: #007acc;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="container">
      <div class="header">
        <div class="window-controls">
          <div class="dot dot-red"></div>
          <div class="dot dot-yellow"></div>
          <div class="dot dot-green"></div>
        </div>
        <div class="filename">component.${fileExt}</div>
        <div style="width: 80px;"></div>
      </div>
      ${stepTitle ? `<div class="title">${escapeHtml(stepTitle)}</div>` : ""}
      <div class="code-container">
        <div class="code-scroll-wrapper">
          <div class="line-numbers">
            ${diff.lines
              .map(
                (line) =>
                  `<div class="line-number">${
                    line.lineNumber !== undefined ? line.lineNumber : " "
                  }</div>`
              )
              .join("")}
          </div>
          <div class="code-content">
            ${highlightedLines
              .map((line) => {
                const className =
                  line.type === "added"
                    ? "code-line line-added"
                    : line.type === "removed"
                    ? "code-line line-removed"
                    : "code-line";
                return `<div class="${className}">${line.html}</div>`;
              })
              .join("")}
          </div>
        </div>
      </div>
      ${stepperHtml}
    </div>
  </div>
</body>
</html>
  `;

  // Use puppeteer directly to render HTML and take screenshot
  // Much simpler than navigating to pages - just set content
  const { getPuppeteerInstance } = await import("./puppeteer-config");
  const puppeteer = await getPuppeteerInstance();
  const shouldCloseBrowser = !props.browser;
  const launchOptions = await getPuppeteerLaunchOptions();
  const browser =
    props.browser || (await puppeteer.default.launch(launchOptions));

  let page;
  try {
    page = await browser.newPage();
    page.setDefaultTimeout(10000); // Increase timeout to 10 seconds
    await page.setViewport({ width, height });

    try {
      await page.setContent(html, { waitUntil: "load", timeout: 10000 });
    } catch (error) {
      throw new Error(
        `Failed to load HTML content: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Wait a bit for rendering to complete
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Take screenshot - removed clip option, use full page screenshot
    const screenshot = await page.screenshot({ type: "png" });

    // Validate screenshot
    if (!screenshot) {
      throw new Error("Screenshot is null");
    }

    const buffer = Buffer.from(screenshot as Buffer | string | Uint8Array);
    if (buffer.length === 0) {
      throw new Error("Screenshot buffer is empty");
    }

    await page.close(); // Close page, but keep browser open if reused

    return buffer;
  } catch (error) {
    // Log the error before rethrowing
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[renderDiffViewToImage] Error: ${errorMsg}`);
    if (error instanceof Error && error.stack) {
      console.error(`[renderDiffViewToImage] Stack:`, error.stack);
    }

    // Make sure to close the page if it was created
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        console.error(
          `[renderDiffViewToImage] Error closing page: ${closeError}`
        );
      }
    }

    throw error;
  } finally {
    // Only close browser if we created it
    if (shouldCloseBrowser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error(
          `[renderDiffViewToImage] Error closing browser: ${closeError}`
        );
      }
    }
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
