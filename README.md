# Team MMM - Solidgate hackathon workspace

Shared source of truth for Team MMM at the OpenAI x START Warsaw Hackathon. The Solidgate challenge asks the team to explore a measurable, controlled AI shopping agent that can monitor offers, calculate the true delivered price, decide when a deal is valid, and act only within clear user consent.

> **Status: Discovery.** The final product scope, demo, architecture, stack, and integrations are not approved. Do not start or extend implementation until the team records the move to implementation in [Open decisions](docs/OPEN_DECISIONS.md) and [Decisions](docs/DECISIONS.md).

## Current hypothesis

The team is considering a conversational shopping and purchasing agent. A user could describe an item, variant, budget, discount threshold, allowed sellers, and approval conditions. The system could monitor deterministic merchant fixtures, compare equivalent offers, compute landed cost, reject misleading deals, and prepare or simulate a purchase under an explicit mandate.

AP2 alignment, BLIK, messenger-style UX, coupon discovery, marketplace/private-seller flows, autonomous buying, and any live Solidgate integration are **provisional**. None are implemented or confirmed requirements.

## Read first

- [Project context](docs/PROJECT_CONTEXT.md) - ten-minute orientation and status boundaries
- [Official case](docs/OFFICIAL_CASE.md) - confirmed requirements from the Solidgate deck
- [Current concept](docs/CURRENT_CONCEPT.md) - provisional team hypothesis
- [Product brief](docs/PRODUCT_BRIEF.md) - working problem, journey, risks, and non-goals
- [Open decisions](docs/OPEN_DECISIONS.md) - decisions required before coding
- [Presentation context](docs/PRESENTATION_CONTEXT.md) - narrative and claims to validate
- [Architecture](docs/ARCHITECTURE.md) - placeholder; no architecture is approved
- [Team workflow](docs/TEAM_WORKFLOW.md) - future collaboration model
- [Decision log](docs/DECISIONS.md) and [research log](docs/RESEARCH.md)

## Repository state

An earlier generic application scaffold, tests, dependencies, and setup documentation already exist on `main`. They are preserved for team review but do **not** mean the Solidgate product or technology choices are approved. Until discovery closes, do not add application code, dependencies, infrastructure, or payment integrations.

## Working together

1. Create a short branch from current `main` (`docs/*`, later `feat/*`, `fix/*`, or `chore/*`).
2. Keep commits small and open a pull request using the repository template.
3. Link the relevant open decision or issue; update documentation when a decision changes.
4. Avoid simultaneous edits to shared context and contract files.
5. Keep `main` stable; never commit secrets or claim a mock is live.

## Decisions required before coding

At minimum: final value proposition, demo flow, primary differentiator, autonomy boundary, AP2/BLIK roles, merchant simulation scope, evaluation plan, frontend/backend boundary, stack, deployment, and whether any Solidgate integration is needed. See [Open decisions](docs/OPEN_DECISIONS.md).
