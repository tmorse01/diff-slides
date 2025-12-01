#!/usr/bin/env node
/* eslint-disable */
/**
 * Test script for GIF export endpoint
 * Usage: node scripts/test-gif-export.js [projectId] [duration] [apiKey]
 *
 * Authentication options:
 * 1. Use API key: node scripts/test-gif-export.js <projectId> <duration> <apiKey>
 *    Or set TEST_API_KEY environment variable
 *
 * To generate an API key, set TEST_API_KEY in your .env.local file:
 *   TEST_API_KEY=your-secret-key-here
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
const duration = process.argv[3] || "3";
const apiKey = process.argv[4] || process.env.TEST_API_KEY;

const url = `http://localhost:3000/api/projects/${projectId}/export/gif?duration=${duration}`;

console.log(`Testing GIF export endpoint...`);
console.log(`URL: ${url}`);
console.log(`Project ID: ${projectId}`);
console.log(`Duration: ${duration}s`);
console.log("");

const startTime = Date.now();

async function testExport() {
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
      console.log("Using API key for authentication");
    } else {
      console.log("Using cookies for authentication");
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    console.log("");

    const contentType = response.headers.get("content-type");

    if (response.status === 200 && contentType && contentType.includes("gif")) {
      // It's a GIF, save it
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      const outputPath = path.join(__dirname, "..", "test-export.gif");
      fs.writeFileSync(outputPath, buffer);

      console.log(`\n✅ SUCCESS! GIF saved to: ${outputPath}`);
      console.log(`File size: ${(buffer.length / 1024).toFixed(2)} KB`);
      console.log(`Time elapsed: ${elapsed}s`);
    } else {
      // It's an error response
      const text = await response.text();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`\nTotal size: ${(text.length / 1024).toFixed(2)} KB`);
      console.log(`Time elapsed: ${elapsed}s`);

      try {
        const error = JSON.parse(text);
        console.log(`\n❌ ERROR:`, error);
      } catch (e) {
        console.log(`\n❌ ERROR: Status ${response.status}`);
        console.log(`Response:`, text.slice(0, 500));
      }
    }
  } catch (error) {
    console.error(`\n❌ Request error:`, error.message);
    console.error(error);
    process.exit(1);
  }
}

testExport();
