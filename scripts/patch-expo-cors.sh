#!/bin/bash
# Patch Expo CLI's CorsMiddleware to allow Replit proxy domains
# This is required for Expo web to work in Replit's proxied iframe environment

CORS_FILE=$(find node_modules/.pnpm -name "CorsMiddleware.js" -path "*/@expo/cli/build/*" 2>/dev/null | head -1)

if [ -z "$CORS_FILE" ]; then
  echo "CorsMiddleware.js not found, skipping patch"
  exit 0
fi

# Check if already patched
if grep -q "isReplitProxy" "$CORS_FILE"; then
  echo "CorsMiddleware.js already patched"
  exit 0
fi

# Apply patch
sed -i 's/const isAllowedHost = allowedHosts.includes(host) || isLocalhost;/const isReplitProxy = hostname.endsWith(".replit.dev") || hostname.endsWith(".picard.replit.dev") || hostname.endsWith(".repl.co");\n            const isAllowedHost = allowedHosts.includes(host) || isLocalhost || isReplitProxy;/' "$CORS_FILE"

echo "CorsMiddleware.js patched successfully: $CORS_FILE"
