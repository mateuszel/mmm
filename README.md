# MMM Control Plane

Hackathon-ready, approval-gated agent workspace for Team MMM at the OpenAI x START Warsaw Hackathon. It ships a deterministic generic vertical slice plus Solidgate and Boski fixture modes. All partner behavior is mocked until explicitly connected.

## Start

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

The safe defaults are `DEMO_MODE=true` and `PARTNER_MODE=generic`. No API key, database, Docker, or partner credentials are required.

## Commands

- `pnpm check` — lint, typecheck, unit tests, and production build
- `pnpm test:e2e` — Chromium demo-flow smoke test
- `pnpm demo:reset` — clear deterministic local fixture state
- `pnpm doctor` — report configuration readiness without printing secrets

See [architecture](docs/ARCHITECTURE.md), [event runbook](docs/HACKATHON_RUNBOOK.md), and [demo script](docs/DEMO_SCRIPT.md).
