#!/usr/bin/env bash
set -euo pipefail

python3 -m json.tool metadata.json >/dev/null
python3 - <<'PY'
import json
data = json.load(open("metadata.json"))
assert len(data["test_prompts"]) == 2, "metadata.json must contain exactly two prompts"
print("metadata: ok")
PY
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/nalima run typecheck
PORT="${PORT:-23671}" BASE_PATH="${BASE_PATH:-/}" pnpm --filter @workspace/nalima run build
echo "Nalima static checks: ok"
