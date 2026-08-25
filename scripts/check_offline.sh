#!/usr/bin/env bash
set -euo pipefail

if grep -RInE 'openai|anthropic|gemini|api\.openai|https?://[^h]' artifacts/api-server/src artifacts/nalima/src 2>/dev/null; then
  echo "Possible cloud dependency found in runtime source." >&2
  exit 1
fi
if [[ -n "${OPENAI_API_KEY:-}" || -n "${ANTHROPIC_API_KEY:-}" || -n "${GEMINI_API_KEY:-}" ]]; then
  echo "Cloud API key is present; unset it for offline evaluation." >&2
  exit 1
fi
echo "Offline dependency scan: passed"
