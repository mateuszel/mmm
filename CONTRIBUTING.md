# Contributing

The project is in **Discovery**. Documentation, research, issue refinement, and decision records are welcome. Application code, dependencies, framework changes, infrastructure, and integrations must wait for an explicit team decision recorded in `docs/DECISIONS.md`.

## Workflow

1. Branch from `main`: `docs/<topic>`, later `feat/<scope>`, `fix/<scope>`, or `chore/<scope>`.
2. Check `docs/OPEN_DECISIONS.md`; do not silently resolve an open product or technical choice.
3. Make small commits with one purpose.
4. Open a pull request and link the relevant issue or decision.
5. Ask for review from the contributor responsible for the adjacent workstream.
6. Update shared context, contracts, and decision records in the same PR when needed.
7. Rebase or merge current `main` before handoff; never force-push a shared branch.

Do not commit `.env.local`, credentials, tokens, customer/payment data, or generated caches. State clearly whether an integration is mocked, simulated, or verified live.
