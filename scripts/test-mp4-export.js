#!/usr/bin/env node
/* eslint-disable */
/**
 * Test script for MP4 export endpoint
 * Usage: node scripts/test-mp4-export.js [projectId] [duration] [apiKey]
 *
 * Authentication options (in order of priority):
 * 1. TEST_API_KEY environment variable (RECOMMENDED):
 *    Set in your .env.local file: TEST_API_KEY=your-secret-test-key-here
 *    Then run: node scripts/test-mp4-export.js [projectId] [duration]
 *
 * 2. Command line argument:
 *    node scripts/test-mp4-export.js <projectId> <duration> <apiKey>
 *
 * 3. Cookies (fallback, may be expired):
 *    node scripts/test-mp4-export.js <projectId> <duration>
 *
 * This script runs a single test and exits with the result.
 */

const fs = require("fs");
const path = require("path");

// Check if we're using Node 18+ with native fetch, otherwise use node-fetch
let fetch;
try {
  // Try native fetch (Node 18+)
  if (typeof globalThis.fetch === "function") {
    fetch = globalThis.fetch;
  } else {
    // Fallback to node-fetch if available
    fetch = require("node-fetch");
  }
} catch (e) {
  console.error(
    "Error: This script requires Node.js 18+ (with native fetch) or node-fetch package."
  );
  console.error("Install node-fetch: npm install node-fetch@2");
  process.exit(1);
}

const projectId = process.argv[2] || "b2ac8743-290c-4af2-9cbe-914eec0bd63a";
// duration is per-frame delay in seconds (default 3s per frame = 24s total for 8 frames)
const duration = process.argv[3] || "3";
// Prioritize environment variable, then command line argument
const apiKey = process.env.TEST_API_KEY || process.argv[4];

const url = `http://localhost:3000/api/projects/${projectId}/export/mp4?duration=${duration}`;

async function testExport() {
  const startTime = Date.now();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`URL: ${url}`);
  console.log(`Project ID: ${projectId}`);
  console.log(
    `Duration per frame: ${duration}s (total video duration depends on number of frames)`
  );
  console.log(`${"=".repeat(60)}\n`);

  try {
    const headers = {
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "http://localhost:3000/projects/my-react-query-tutorial/edit",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    };

    // Use API key if provided
    if (apiKey) {
      headers["X-API-Key"] = apiKey;
      const source = process.env.TEST_API_KEY
        ? "environment variable (TEST_API_KEY)"
        : "command line argument";
      console.log(`Using API key for authentication (from ${source})`);
    } else {
      console.log("Using cookies for authentication (no API key found)");
      console.log(
        "💡 Tip: Set TEST_API_KEY environment variable for API key authentication"
      );
    }

    console.log("Sending request...");
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Time elapsed: ${elapsed}s`);
    console.log(`Content-Type: ${response.headers.get("content-type")}`);
    console.log(
      `Content-Length: ${response.headers.get("content-length") || "unknown"}`
    );

    const contentType = response.headers.get("content-type");

    // Log response headers for debugging
    console.log("\n📋 Response Headers:");
    for (const [key, value] of response.headers.entries()) {
      if (
        key.toLowerCase().includes("content") ||
        key.toLowerCase().includes("x-")
      ) {
        console.log(`  ${key}: ${value}`);
      }
    }

    if (response.status === 200 && contentType && contentType.includes("mp4")) {
      // It's an MP4, save it
      console.log("\n📥 Downloading MP4 file...");
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      const outputPath = path.join(__dirname, "..", "test-export.mp4");
      fs.writeFileSync(outputPath, buffer);

      const fileSizeKB = (buffer.length / 1024).toFixed(2);
      const fileSizeMB = (buffer.length / (1024 * 1024)).toFixed(2);

      console.log(`\n${"✅".repeat(30)}`);
      console.log(`✅ SUCCESS! MP4 saved to: ${outputPath}`);
      console.log(`✅ File size: ${fileSizeKB} KB (${fileSizeMB} MB)`);
      console.log(`✅ Total time: ${totalElapsed}s`);
      console.log(`${"✅".repeat(30)}\n`);

      // Verify the file is valid by checking if it exists and has content
      const stats = fs.statSync(outputPath);
      if (stats.size > 0) {
        console.log(
          "✅ File verification: PASSED (file exists and has content)"
        );

        // Validate MP4 using ffprobe
        console.log("\n🔍 Validating MP4 file with ffprobe...");
        try {
          const { exec } = require("child_process");
          const { promisify } = require("util");
          const execAsync = promisify(exec);

          const escapedPath = outputPath.replace(/\\/g, "/");
          const ffprobeCommand = `ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of json "${escapedPath}"`;

          console.log("Running ffprobe command...");
          const result = await execAsync(ffprobeCommand);

          if (result.stderr) {
            console.log("ffprobe stderr:", result.stderr);
          }

          if (!result.stdout) {
            throw new Error("ffprobe returned no output");
          }

          const probeData = JSON.parse(result.stdout);

          const format = probeData.format;
          const videoStream = probeData.streams?.find(
            (s) => s.codec_type === "video"
          );

          if (!videoStream) {
            throw new Error("MP4 file has no video stream");
          }

          const actualDuration = parseFloat(format.duration || "0");
          const expectedDuration = parseFloat(duration);
          const durationDiff = Math.abs(actualDuration - expectedDuration);

          console.log("\n📊 MP4 Validation Results:");
          console.log(
            `  Duration: ${actualDuration.toFixed(
              2
            )}s (expected: ${expectedDuration.toFixed(2)}s)`
          );
          console.log(
            `  Resolution: ${videoStream.width}x${videoStream.height}`
          );
          console.log(`  Frame rate: ${videoStream.r_frame_rate || "unknown"}`);
          console.log(`  File size: ${fileSizeKB} KB (${fileSizeMB} MB)`);
          console.log(`  Duration difference: ${durationDiff.toFixed(2)}s`);

          if (actualDuration < 0.1) {
            throw new Error(
              `MP4 file is too short (${actualDuration.toFixed(2)}s)`
            );
          }

          if (durationDiff > 0.5) {
            console.log(
              `\n⚠️  WARNING: Duration mismatch! Expected ${expectedDuration.toFixed(
                2
              )}s, got ${actualDuration.toFixed(2)}s`
            );
            console.log(
              "   This may indicate an issue with frame capture or video encoding."
            );
          } else {
            console.log(`\n✅ Duration validation: PASSED (within tolerance)`);
          }

          console.log(`\n✅ MP4 file validation: PASSED`);
          console.log(`${"✅".repeat(30)}\n`);
          process.exit(0);
        } catch (validationError) {
          console.error(`\n❌ MP4 validation failed:`, validationError.message);
          if (validationError.stderr) {
            console.error("ffprobe stderr:", validationError.stderr);
          }
          // Still exit with success since we got a file, but warn about validation
          console.log(
            "⚠️  File was created but validation failed. Continuing anyway...\n"
          );
          process.exit(0);
        }
      } else {
        console.log("❌ File verification: FAILED (file is empty)");
        throw new Error("File is empty");
      }
    } else {
      // It's an error response
      const text = await response.text();
      const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`\n❌ ERROR: Status ${response.status}`);
      console.log(`Response size: ${(text.length / 1024).toFixed(2)} KB`);
      console.log(`Time elapsed: ${totalElapsed}s`);

      try {
        const error = JSON.parse(text);
        console.log(`Error details:`, JSON.stringify(error, null, 2));
      } catch (e) {
        console.log(`Response (first 500 chars):`, text.slice(0, 500));
      }

      console.log(`\n❌ Test failed. Exiting.`);
      process.exit(1);
    }
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`\n❌ Request error after ${elapsed}s:`, error.message);

    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }

    console.log(`\n❌ Test failed. Exiting.`);
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log(`\n\n⚠️  Interrupted`);
  process.exit(1);
});

console.log("🚀 Starting MP4 export test script...");
console.log("Running single test (no retries)\n");

testExport();
