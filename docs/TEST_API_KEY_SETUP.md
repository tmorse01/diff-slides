# Testing API Key Setup

This document explains how to set up and use the API key for testing the GIF export endpoint without requiring authentication cookies.

## Setup

1. Create or update your `.env.local` file in the project root:

```bash
TEST_API_KEY=your-secret-test-key-here
```

**Important**: The API key only works in development mode (`NODE_ENV !== "production"`). It will be disabled in production for security.

## Usage

### Using the Test Script

```bash
# Using API key from environment variable
node scripts/test-gif-export.js <projectId> <duration>

# Or pass API key directly
node scripts/test-gif-export.js <projectId> <duration> <apiKey>
```

### Using curl

```bash
curl 'http://localhost:3000/api/projects/<projectId>/export/gif?duration=3' \
  -H 'X-API-Key: your-secret-test-key-here'
```

Or using Authorization header:

```bash
curl 'http://localhost:3000/api/projects/<projectId>/export/gif?duration=3' \
  -H 'Authorization: Bearer your-secret-test-key-here'
```

### Using fetch/HTTP client

```javascript
fetch("http://localhost:3000/api/projects/<projectId>/export/gif?duration=3", {
  headers: {
    "X-API-Key": "your-secret-test-key-here",
  },
});
```

## Security Notes

- The API key bypasses normal authentication and uses admin access
- **Only works in development mode** - automatically disabled in production
- Use a strong, random key for testing
- Never commit the API key to version control
- The API key allows access to any project in the database

## Example

```bash
# Set the API key
export TEST_API_KEY=test-key-12345

# Run the test script
node scripts/test-gif-export.js b2ac8743-290c-4af2-9cbe-914eec0bd63a 3
```
