# Presentation and recording runbook

## Start

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm build
corepack pnpm start
```

Open: `http://localhost:3000/demo?recording=1`

The route preloads local critical images, prevents scrolling and keeps a stable 1920×1080 layout. `/states` remains an internal QA route.

## Live workflow

1. `R`
2. `1`; wait for the final retail decision
3. `Escape`
4. `2`; wait for protected checkout
5. `Escape`
6. `3`; wait for the call approval
7. Click `Start protected call`
8. Wait for the rejection frame

`Space` pauses or resumes. Every final state holds indefinitely.

## Before going on stage

```bash
corepack pnpm check
corepack pnpm test:e2e
```

- Use Chrome at 100% zoom and 1920×1080 when available.
- Close devtools and notifications.
- Confirm the demo works with network disabled after loading.
- Confirm profile, preferences, activity and composer interactions do not obscure the next scenario.
- Verify the German audio, transcript and risk events from a cold refresh.

## Current timing

- Scenario 1: about 22.5 seconds.
- Scenario 2: about 21.5 seconds.
- Scenario 3: pre-call about 4 seconds plus 46.925 seconds of German dialogue.

These are presentation cues, not contractual timing. Reliability and readable state changes take priority.
