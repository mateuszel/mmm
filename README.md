# Relyo · Team MMM

Clean shared workspace for Team MMM at the OpenAI x START Warsaw Hackathon. The Solidgate challenge asks the team to explore a measurable, controlled AI shopping agent that can monitor offers, calculate the true delivered price, decide when a deal is valid, and act only within clear user consent.

> **Status: Static UI implementation.** The brand, deterministic static demo states and frozen evidence assets are implemented. Scenario playback, backend architecture and live integrations are not approved.

## Run locally

```bash
corepack pnpm install
corepack pnpm dev
```

Open `http://localhost:3000`. Every visit begins on the same Relyo home screen.

## Current implementation boundaries

- From the home screen, press `1`, `2` or `3` to run the corresponding deterministic scenario. Press `Esc` to cancel playback and return home.
- Scenario 3 pauses for exactly one visible click: `Allow agent to call`.
- `/demo` and `/states` redirect to the canonical home experience; internal playback states are not exposed in the product UI.
- All scenario values and seller conversations are deterministic demo data.
- Public adidas, eobuwie, OLX and eBay captures are local evidence assets and remain visually separate from simulated values.
- No payment, marketplace, call, OpenAI or partner API is connected.
- The Von Halsky card is a planned-integration preview, not a live integration claim.

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
- [Brand direction](docs/BRAND_DIRECTION.md) - provisional name, identity, motif and design tokens
- [Architecture](docs/ARCHITECTURE.md) - approved static frontend boundary and remaining open areas
- [Team workflow](docs/TEAM_WORKFLOW.md) - future collaboration model
- [Decision log](docs/DECISIONS.md) and [research log](docs/RESEARCH.md)

## Repository state

The active tree now contains one minimal Next.js static frontend plus documentation and local assets. The demo uses three different public product/listing references, while all seller contact, calls, negotiation, payments and integrations remain clearly simulated. Earlier experiments remain recoverable from Git history and an offline backup.

## Working together

1. Create a short branch from current `main` (`docs/*`, later `feat/*`, `fix/*`, or `chore/*`).
2. Keep commits small and open a pull request using the repository template.
3. Link the relevant open decision or issue; update documentation when a decision changes.
4. Avoid simultaneous edits to shared context and contract files.
5. Keep `main` stable; never commit secrets or claim a mock is live.

## Decisions required before runtime implementation

At minimum: final value proposition, primary differentiator, runtime autonomy boundary, AP2/BLIK roles, evaluation plan, backend/shared-contract boundary, deployment, and whether any Solidgate integration is needed. See [Open decisions](docs/OPEN_DECISIONS.md).
