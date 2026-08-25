#!/usr/bin/env bash
set -euo pipefail

MODEL_DIR="${MODEL_DIR:-model}"
MODEL_PATH="${MODEL_PATH:-$MODEL_DIR/nalima-model.gguf}"
MODEL_URL="${MODEL_URL:-https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/Qwen2.5-1.5B-Instruct-Q4_K_M.gguf}"

mkdir -p "$MODEL_DIR"
if [[ -s "$MODEL_PATH" ]]; then
  echo "Model already exists: $MODEL_PATH"
  exit 0
fi

echo "Downloading Qwen2.5 1.5B Instruct Q4_K_M GGUF..."
tmp="${MODEL_PATH}.part"
rm -f "$tmp"
curl --fail --location --retry 3 --progress-bar "$MODEL_URL" --output "$tmp"
if [[ ! -s "$tmp" ]]; then
  echo "Download failed or returned an empty file." >&2
  rm -f "$tmp"
  exit 1
fi
mv "$tmp" "$MODEL_PATH"
echo "Saved model to $MODEL_PATH"
