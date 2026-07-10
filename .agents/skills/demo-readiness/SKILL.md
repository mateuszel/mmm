---
name: demo-readiness
description: Use at feature freeze or before presenting to validate reset, happy path, fallback route, checks, and the current demo script.
---

# Demo readiness

Read `docs/DEMO_SCRIPT.md` and `docs/HACKATHON_RUNBOOK.md`. Run `pnpm demo:reset`, `pnpm check`, and `pnpm test:e2e`. Verify generic and selected partner fixtures, approval and rejection, no-key behavior, and mobile/laptop layout. Fix in-scope failures. Ensure the generic scenario is a credible fallback and update the demo script with the current click path and explicit mock/live language. Never claim an unverified integration works.
