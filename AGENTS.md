# Team MMM repository guidance

- Keep `main` runnable and implement end-to-end vertical slices before breadth.
- Use strict TypeScript, typed structured outputs, and tests for domain logic.
- Never commit secrets or expose server keys to the browser. `.env.local` stays ignored.
- Demo fixtures must be deterministic and resettable without external services.
- Keep partner integrations behind adapters and never present mock behavior as live.
- Gate every external state change behind explicit human approval.
- Verify official OpenAI documentation before using an API. Keep model IDs in environment variables.
- Avoid unnecessary dependencies and mandatory infrastructure.
- Make small, understandable commits and record meaningful decisions in `docs/DECISIONS.md`.
- Prefer measurable business impact over feature count.

Run `pnpm check` and, for user-flow changes, `pnpm test:e2e` before merging.
