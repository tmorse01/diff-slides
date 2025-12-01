#!/usr/bin/env node
/* eslint-disable */
/**
 * Test script for GIF export endpoint
 * Usage: node scripts/test-gif-export.js [projectId] [duration] [apiKey]
 *
 * Authentication options:
 * 1. Use API key: node scripts/test-gif-export.js <projectId> <duration> <apiKey>
 *    Or set TEST_API_KEY environment variable
 * 2. Use cookies: node scripts/test-gif-export.js <projectId> <duration>
 *    (requires valid cookies in the script - may be expired)
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

// Cookie string from curl command
const cookieString =
  "refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4M2IxNjVjOC1iNGEyLTQxMGItOWQ5Mi0xYjgxNGQ2MjJlYWIiLCJlbWFpbCI6ImFsaWNlQGV4YW1wbGUuY29tIiwiaWF0IjoxNzYzMTA1NzkxLCJleHAiOjE3NjM3MTA1OTEsImF1ZCI6Imdyb3VwLXBheS13ZWIiLCJpc3MiOiJncm91cC1wYXktYXBpIn0.Cj_M2ZQ_a_0VKzOk9ztgEZp8RJorICR35wIWIg1ssWM; __next_hmr_refresh_hash__=7142; sb-yakvoikeapgzzfnpptse-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0ltdHBaQ0k2SWlzdmMxUm9XRzh3VVhWMVN5OW1OWFVpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBjM01pT2lKb2RIUndjem92TDNsaGEzWnZhV3RsWVhCbmVucG1ibkJ3ZEhObExuTjFjR0ZpWVhObExtTnZMMkYxZEdndmRqRWlMQ0p6ZFdJaU9pSmtaR1JpWTJRNVpTMDROMlEwTFRSaVlURXRZVFF3TWkwMk1tUXlORGN3TURJeVpESWlMQ0poZFdRaU9pSmhkWFJvWlc1MGFXTmhkR1ZrSWl3aVpYaHdJam94TnpZME5UWXdPRGt4TENKcFlYUWlPakUzTmpRMU5UY3lPVEVzSW1WdFlXbHNJam9pZEcxdmNuTmxOekkxUUdkdFlXbHNMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laVzFoYVd3aUxDSndjbTkyYVdSbGNuTWlPbHNpWlcxaGFXd2lYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWlcxaGFXd2lPaUowYlc5eWMyVTNNalZBWjIxaGFXd3VZMjl0SWl3aVpXMWhhV3hmZG1WeWFXWnBaV1FpT25SeWRXVXNJbkJvYjI1bFgzWmxjbWxtYVdWa0lqcG1ZV3h6WlN3aWMzVmlJam9pWkdSa1ltTmtPV1V0T0Rka05DMDBZbUV4TFdFME1ESXROakprTWpRM01EQXlNbVF5SW4wc0luSnZiR1VpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWVdGc0lqb2lZV0ZzTVNJc0ltRnRjaUk2VzNzaWJXVjBhRzlrSWpvaWNHRnpjM2R2Y21RaUxDSjBhVzFsYzNSaGJYQWlPakUzTmpRMU16azBOako5WFN3aWMyVnpjMmx2Ymw5cFpDSTZJamRrWlRsaFpqUTVMVGc1TmprdE5EaG1PQzFoTm1FMkxXWTVaall5TVRjNFlXTTJaQ0lzSW1selgyRnViMjU1Ylc5MWN5STZabUZzYzJWOS5ab2N2elp2UHZ4amVjeXlHYzVsMHZTMFpuVGg3aEphNDFBMV9BMWhlc04wIiwidG9rZW5fdHlwZSI6ImJlYXJlciIsImV4cGlyZXNfaW4iOjM2MDAsImV4cGlyZXNfYXQiOjE3NjQ1NjA4OTEsInJlZnJlc2hfdG9rZW4iOiJnaXB0d2N3Z3dsbXAiLCJ1c2VyIjp7ImlkIjoiZGRkYmNkOWUtODdkNC00YmExLWE0MDItNjJkMjQ3MDAyMmQyIiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiZW1haWwiOiJ0bW9yc2U3MjVAZ21haWwuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNS0xMS0zMFQwNjo1OToyMy42ODUxNTZaIiwicGhvbmUiOiIiLCJjb25maXJtYXRpb25fc2VudF9hdCI6IjIwMjUtMTEtMzBUMDY6NTk6MTIuMTg3Mzg4WiIsImNvbmZpcm1lZF9hdCI6IjIwMjUtMTEtMzBUMDY6NTk6MjMuNjg1MTU2WiIsImxhc3Rfc2lnbl9pbl9hdCI6IjIwMjUtMTEtMzBUMjE6NTE6MDIuOTAxNjMzWiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoidG1vcnNlNzI1QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6ImRkZGJjZDllLTg3ZDQtNGJhMS1hNDAyLTYyZDI0NzAwMjJkMiJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6IjZjMmZjOTY4LTc4MDItNDc5Zi1hOGY2LTZhYTE2MWY0YzU2YiIsImlkIjoiZGRkYmNkOWUtODdkNC00YmExLWE0MDItNjJkMjQ3MDAyMmQyIiwidXNlcl9pZCI6ImRkZGJjZDllLTg3ZDQtNGJhMS1hNDAyLTYyZDI0NzAwMjJkMiIsImlkZW50aXR5X2RhdGEiOnsiZW1haWwiOiJ0bW9yc2U3MjVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjp0cnVlLCJzdWIiOiJkZGRiY2Q5ZS04N2Q0LTRiYTEtYTQwMi02MmQyNDcwMDIyZDIifSwicHJvdmlkZXIiOiJlbWFpbCIsImxhc3Rfc2lnbl9pbl9hdCI6IjIwMjUtMTEtMzBUMDY6NTk6MTIuMTg0NDkyWiIsImNyZWF0ZWRfYXQiOiIyMDI1LTExLTMwVDA2OjU5OjEyLjE4NDU0MVoiLCJ1cGRhdGVkX2F0IjoiMjAyNS0xMS0zMFQwNjo1OToxMi4xODQ1NDFaIiwiZW1haWwiOiJ0bW9yc2U3MjVAZ21haWwuY29tIn1dLCJjcmVhdGVkX2F0IjoiMjAyNS0xMS0zMFQwNjo1OToxMi4xODEzNDFaIiwidXBkYXRlZF9hdCI6IjIwMjUtMTItMDFUMDI6NDg6MTEuMjc5OTc3WiIsImlzX2Fub255bW91cyI6ZmFsc2V9";

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

    // Use API key if provided, otherwise use cookies
    if (apiKey) {
      headers["X-API-Key"] = apiKey;
      console.log("Using API key for authentication");
    } else {
      headers["Cookie"] = cookieString;
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
