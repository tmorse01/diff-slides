/**
 * API Key authentication for testing purposes
 * Only works in development mode
 */

export function verifyApiKey(apiKey: string | null): boolean {
  // Only allow API key in development
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const validApiKey = process.env.TEST_API_KEY;
  if (!validApiKey) {
    return false;
  }

  return apiKey === validApiKey;
}

export function getApiKeyFromRequest(request: Request): string | null {
  // Check Authorization header: "Bearer <key>" or "ApiKey <key>"
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const parts = authHeader.trim().split(/\s+/);
    if (
      parts.length === 2 &&
      (parts[0].toLowerCase() === "bearer" ||
        parts[0].toLowerCase() === "apikey")
    ) {
      return parts[1];
    }
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get("x-api-key");
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  return null;
}
