# NALIMA — Offline Agricultural Intelligence

NALIMA helps farmers and agricultural extension workers ask Nala for careful, local agricultural reasoning without cloud inference.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

- Ask Nala agricultural questions through a responsive web console.
- See LOCAL / OFFLINE runtime status, model availability, timing, and retrieved knowledge context.
- Browse the local agricultural knowledge set.
- Run the production path with a GGUF model through llama.cpp.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- GGUF weights are intentionally ignored by Git; run `bash download_model.sh` locally.
- Complete the submitter/team placeholders in `metadata.json` before ADTC submission.
- The app is honest about a missing local model and does not silently use a cloud fallback.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
