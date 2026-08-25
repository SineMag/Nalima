# NALIMA

## Offline Agricultural Intelligence

NALIMA is an agriculture-focused, offline-first assistant for constrained laptops. **Ask Nala** for careful agricultural reasoning grounded in a small local knowledge set, with local GGUF inference through `llama.cpp` when the model is installed.

## Why it exists

Farm decisions still need support when connectivity is unreliable, expensive, or unavailable. Nalima keeps retrieval and inference on the device, avoids telemetry and cloud APIs, and makes uncertainty visible instead of presenting a confident diagnosis.

## Architecture

```text
Ask Nala UI → local API → keyword retrieval → llama.cpp → local GGUF answer
```

The UI is the `artifacts/nalima` Vite app. The shared API server exposes `/api/healthz`, `/api/knowledge`, and `/api/chat`. The model runner passes an argument array to `llama-cli` and never builds a shell command from user input.

## Run locally

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
# in another terminal
pnpm --filter @workspace/nalima run dev
```

Download the development model with `bash download_model.sh`. The model is intentionally excluded from Git. Install a compatible `llama.cpp` binary at `bin/llama-cli`, or set `LLAMA_CLI` and `MODEL_PATH`.

## Validation

```bash
bash scripts/test.sh
bash scripts/check_offline.sh
```

The checks do not fabricate inference results. Without a downloaded model and `llama-cli`, they report the missing runtime explicitly.

## ADTC profiler

After filling the team and submitter fields in `metadata.json`:

```bash
pip install "git+https://github.com/Africa-Deep-Tech-Foundation/adtc-profiler.git"
bash download_model.sh
adtc-profiler run \
  --submission . \
  --mode participant \
  --output submission.json \
  --skip-accuracy
```

The official profiler is authoritative for latency, throughput, memory, CPU, and compatibility. No benchmark values are claimed here until measured on the target laptop.

## Safety and limitations

Seed knowledge is educational and labelled as such. Nala should not be used as a pesticide or veterinary prescriber, and symptom descriptions are not a diagnosis. Serious, spreading, or rapidly worsening cases should be taken to a qualified local agricultural or veterinary professional. IsiZulu support is not claimed or evaluated yet.

## License

The application code is MIT-licensed. The selected Qwen model has its own license; review the upstream model card before submitting or redistributing weights.
