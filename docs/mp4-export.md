# Nuclear Simplification of Frame Capture

## Overview

Strip down the frame capture to the absolute essentials: simple HTML generation, basic Puppeteer screenshots, and explicit validation. Make syntax highlighting optional with a plain text fallback.

## Implementation Steps

### 1. Simplify HTML Generation (`lib/export/server-diff-view-simple.tsx`)

**Changes:**

- Make Shiki syntax highlighting **optional** - wrap in try/catch and fallback to plain text immediately
- Remove complex HTML parsing - if Shiki fails, use plain escaped text
- Simplify CSS - remove any complex styling that might cause rendering issues
- Use `load` event instead of `networkidle0` for Puppeteer (much faster, more reliable)
- Add explicit timeout (5 seconds max per frame)
- Remove all unnecessary dependencies

**Key changes:**

```typescript
// Wrap Shiki in try/catch with immediate fallback
let highlightedLines: Array<{ html: string; type: string }> = [];
try {
  // Try Shiki - if it fails, immediately use plain text
  const html = await codeToHtml(fullCode, {
    lang: shikiLang,
    theme: "one-dark-pro",
  });
  // ... parse HTML
} catch (error) {
  console.warn("Shiki failed, using plain text:", error);
  // Immediate fallback - no retries, no complexity
  highlightedLines = diff.lines.map((line) => ({
    html: escapeHtml(line.value || " "),
    type: line.type,
  }));
}
```

### 2. Simplify Puppeteer Usage (`lib/export/server-diff-view-simple.tsx`)

**Changes:**

- Replace `waitUntil: "networkidle0"` with `waitUntil: "load"` (much faster, more reliable)
- Add explicit timeout: `page.setDefaultTimeout(5000)` (5 seconds max)
- Remove `clip` option from screenshot - just use full page screenshot
- Add explicit validation that screenshot buffer is not empty

**Key changes:**

```typescript
const page = await browser.newPage();
page.setDefaultTimeout(5000); // 5 second timeout
await page.setViewport({ width, height });
await page.setContent(html, { waitUntil: "load" }); // Changed from networkidle0

const screenshot = await page.screenshot({ type: "png" }); // Removed clip

// Validate screenshot
if (!screenshot || (Buffer.isBuffer(screenshot) && screenshot.length === 0)) {
  throw new Error("Screenshot is empty");
}
```

### 3. Add Frame Validation (`lib/export/capture-frames.ts`)

**Changes:**

- After each frame is saved, verify the file exists and has content
- Log file size to confirm it's not empty
- Throw error immediately if validation fails (fail-fast)

**Key changes:**

```typescript
await writeFile(framePath, frameBuffer);

// Validate frame was actually saved
const stats = await import("fs/promises").then((fs) => fs.stat(framePath));
if (stats.size === 0) {
  throw new Error(`Frame file is empty: ${framePath}`);
}
console.log(`Frame validated: ${stats.size} bytes`);
```

### 4. Simplify Error Handling

**Changes:**

- Remove complex error wrapping - just throw clear errors
- Log frame number and step title in every error message
- Don't catch and re-throw - let errors bubble up naturally

### 5. Remove Unused Code

**Changes:**

- Remove `server-diff-view.tsx` (the satori version) - we're not using it
- Clean up any unused imports
- Remove complex frame duplication logic if not needed

## Files to Modify

1. **`lib/export/server-diff-view-simple.tsx`**

   - Make Shiki optional with immediate fallback
   - Simplify Puppeteer: use `load` instead of `networkidle0`
   - Add timeout and validation

2. **`lib/export/capture-frames.ts`**

   - Add frame file validation after each save
   - Simplify error messages

3. **`lib/export/frame-capture.ts`**

   - Simplify error handling (remove unnecessary wrapping)

## Success Criteria

- All 8 frames are captured successfully
- Video duration matches expected (3 seconds for 8 frames)
- No Shiki-related failures block frame capture
- Clear error messages if something fails
- Each frame is validated before moving to next

## Notes

- Shiki is now a "nice to have" - if it fails, we continue with plain text
- Puppeteer uses `load` event which is much more reliable than `networkidle0`
- Every frame is validated after capture to catch issues immediately
- Fail-fast approach means we stop immediately if something goes wrong (easier to debug)
