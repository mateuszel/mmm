# Team MMM - Solidgate hackathon workspace

Clean shared workspace for Team MMM at the OpenAI x START Warsaw Hackathon. The Solidgate challenge asks the team to explore a measurable, controlled AI shopping agent that can monitor offers, calculate the true delivered price, decide when a deal is valid, and act only within clear user consent.

> **Status: Discovery.** The final product scope, demo, architecture, stack, and integrations are not approved. Do not start or extend implementation until the team records the move to implementation in [Open decisions](docs/OPEN_DECISIONS.md) and [Decisions](docs/DECISIONS.md).

## Current hypothesis

The leading idea is a proactive shopping negotiator. A user describes an item and constraints; the agent monitors deterministic listings, checks availability, compares equivalent offers, analyzes photos and condition for used goods, reads seller reputation, asks targeted questions, and may negotiate before presenting an explainable deal or approval request.

The product experience may have two surfaces: a minimal brand/pitch page and a focused interactive demo. The pitch slot is three minutes followed by two minutes of Q&A, so clarity, visual polish, and a reliable staged story matter more than feature breadth.

Negotiation, image/condition analysis, seller research, proactive messaging, AP2, BLIK, coupon discovery, marketplace/private-seller flows, autonomous buying, and any live integration are **provisional**. None are implemented or confirmed requirements.

## Read first

- [Project context](docs/PROJECT_CONTEXT.md) - ten-minute orientation and status boundaries
- [Official case](docs/OFFICIAL_CASE.md) - confirmed requirements from the Solidgate deck
- [Current concept](docs/CURRENT_CONCEPT.md) - provisional team hypothesis
- [Product brief](docs/PRODUCT_BRIEF.md) - working problem, journey, risks, and non-goals
- [Open decisions](docs/OPEN_DECISIONS.md) - decisions required before coding
- [Presentation context](docs/PRESENTATION_CONTEXT.md) - narrative and claims to validate
- [Cinematic demo vision](docs/CINEMATIC_DEMO_VISION.md) - provisional 126-second product story
- [Demo storyboard](docs/DEMO_STORYBOARD.md), [exact copy](docs/DEMO_COPY.md), and [scenario timelines](docs/SCENARIO_TIMELINES.md)
- [Interaction specification](docs/INTERACTION_SPEC.md), [asset manifest](docs/ASSET_MANIFEST.md), and [call script](docs/CALL_SCRIPT.md)
- [Real source map](docs/REAL_SOURCE_MAP.md) and [asset provenance](docs/ASSET_PROVENANCE.md) - frozen public sources, generated assets, privacy review, audio, and known gaps
- [Pitch flow](docs/PITCH_FLOW.md), [market context](docs/MARKET_CONTEXT.md), and [claims gate](docs/CLAIMS_AND_SIMULATIONS.md)
- [Architecture](docs/ARCHITECTURE.md) - placeholder; no architecture is approved
- [Team workflow](docs/TEAM_WORKFLOW.md) - future collaboration model
- [Decision log](docs/DECISIONS.md) and [research log](docs/RESEARCH.md)

## Repository state

The active tree is intentionally documentation-first and contains no application scaffold or dependencies. A provisional cinematic demo now uses three different real public product/listing references, while all seller contact, calls, negotiation, payments and integrations remain clearly simulated. Earlier experiments remain recoverable from Git history and an offline backup. Until discovery closes, do not add application code, dependencies, infrastructure, messaging, or payment integrations.

## Working together

1. Create a short branch from current `main` (`docs/*`, later `feat/*`, `fix/*`, or `chore/*`).
2. Keep commits small and open a pull request using the repository template.
3. Link the relevant open decision or issue; update documentation when a decision changes.
4. Avoid simultaneous edits to shared context and contract files.
5. Keep `main` stable; never commit secrets or claim a mock is live.

## Decisions required before coding

At minimum: final value proposition, demo flow, primary differentiator, autonomy boundary, AP2/BLIK roles, merchant simulation scope, evaluation plan, frontend/backend boundary, stack, deployment, and whether any Solidgate integration is needed. See [Open decisions](docs/OPEN_DECISIONS.md).
