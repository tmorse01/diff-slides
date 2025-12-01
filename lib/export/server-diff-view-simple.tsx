/**
 * Simple server-side DiffView renderer using HTML-to-image
 * Much simpler than satori - just render HTML and convert to image
 */
import { computeDiff } from "@/lib/diff";
import { codeToHtml } from "shiki";
import type { Browser } from "puppeteer";

interface ServerDiffViewProps {
  previousCode: string;
  currentCode: string;
  language: string;
  stepTitle?: string;
  fileName?: string;
  width?: number;
  height?: number;
  browser?: Browser; // Optional browser instance to reuse
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
  } = props;

  // Compute diff
  const diff = computeDiff(previousCode || "", currentCode || "");
  const shikiLang = languageMap[language.toLowerCase()] || "typescript";

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
      background: #1e1e1e;
      color: #d4d4d4;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
    }
    .container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #252526;
      border-bottom: 1px solid #3e3e42;
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
    }
    .code-container {
      flex: 1;
      display: flex;
      overflow: hidden;
      background: #1e1e1e;
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
    }
    .line-number {
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .code-content {
      flex: 1;
      padding: 24px;
      overflow: auto;
      font-size: 14px;
      line-height: 24px;
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
      background: #264f78;
      border-left: 2px solid #007acc;
    }
    .line-removed {
      background: #5a1d1d;
      border-left: 2px solid #f48771;
      text-decoration: line-through;
      opacity: 0.7;
    }
  </style>
</head>
<body>
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
          .map((line, index) => {
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
</body>
</html>
  `;

  // Use puppeteer directly to render HTML and take screenshot
  // Much simpler than navigating to pages - just set content
  const puppeteer = await import("puppeteer");
  const shouldCloseBrowser = !props.browser;
  const browser =
    props.browser ||
    (await puppeteer.default.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    }));

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(5000); // 5 second timeout
    await page.setViewport({ width, height });
    await page.setContent(html, { waitUntil: "load" }); // Changed from networkidle0

    // Take screenshot - removed clip option, use full page screenshot
    const screenshot = await page.screenshot({ type: "png" });

    // Validate screenshot
    if (
      !screenshot ||
      (Buffer.isBuffer(screenshot) && screenshot.length === 0)
    ) {
      throw new Error("Screenshot is empty");
    }

    await page.close(); // Close page, but keep browser open if reused

    return Buffer.from(screenshot as Buffer | string | Uint8Array);
  } finally {
    // Only close browser if we created it
    if (shouldCloseBrowser) {
      await browser.close();
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
