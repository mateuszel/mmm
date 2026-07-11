# Team workflow

**Status: Provisional.** Three workstreams are expected; final ownership is not assigned. Maksymilian may focus on frontend/product experience, but the team must confirm this.

## Future workstreams

### Frontend and product experience

Own the user journey, shopping brief, offer comparison, alert/approval interaction, receipt presentation, responsive demo flow, and visual consistency. Coordinate request/response contracts before building against backend behavior.

### Backend and agent logic

Own deterministic merchant events, landed-cost logic, matching/decision behavior, mandate enforcement, tool boundaries, model usage, evaluation fixtures, and integration adapters. Expose stable shared contracts rather than UI-specific behavior.

### Product, demo, testing, and presentation

Own scope decisions, judge narrative, claim validation, demo script, evaluation evidence, fallback plan, and final rehearsal. Keep confirmed case requirements separate from team hypotheses.

## Branches and pull requests

- During discovery: `docs/<topic>` and `research/<topic>`.
- During implementation: short-lived `feat/<scope>`, `fix/<scope>`, and `chore/<scope>` branches.
- Open focused pull requests; link an issue/open decision and state demo impact.
- Require review from an adjacent workstream when changing shared contracts or user-visible behavior.
- Keep `main` stable and never force-push shared branches.

## Coordination rules

- Prefer small commits that can be reviewed or reverted independently.
- Agree shared types/API contracts before frontend and backend implement in parallel.
- Record contract changes in documentation and in the same pull request as implementation.
- Announce ownership of high-conflict files (`CURRENT_CONCEPT`, `OPEN_DECISIONS`, shared contracts) before editing.
- Avoid simultaneous edits to the same files; split work by boundary, not by random file list.
- Merge narrow vertical progress frequently once implementation is approved.
- Never present mocked merchant/payment behavior as a live integration.
