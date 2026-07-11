# Decision log

Use lightweight Architecture Decision Records (ADRs). Add entries only after explicit team agreement.

## ADR-0001: Remain in discovery

- **Date:** 2026-07-11
- **Status:** Accepted
- **Context:** The official Solidgate case is now known, but Team MMM is still comparing product directions and the depth of delegated-payment behavior. The repository already contains a generic scaffold created before scope selection.
- **Decision:** Project status is `Discovery`. No framework, final architecture, product scope, or integration has been approved. The conversational shopping-agent direction remains provisional. Do not add or extend implementation until the team records an explicit transition to `Implementation`.
- **Consequences:** Keep the active tree documentation-first, preserve earlier work in Git history, and resolve [Open decisions](OPEN_DECISIONS.md) before implementation tasks are created.

## ADR-0002: Reset the active tree to a clean discovery baseline

- **Date:** 2026-07-11
- **Status:** Accepted
- **Context:** The initial generic scaffold, dependencies, fixtures, CI, stale pre-brief documents, and vendored payment skills created noise before the product direction was selected.
- **Decision:** Remove those files from the active tree. Keep only source-of-truth documents, GitHub collaboration templates, and four narrow repository workflow skills. Preserve all earlier work in Git history and an offline bundle.
- **Consequences:** The next implementation starts from an intentional clean baseline after the team approves scope and stack. No deleted experiment is treated as the selected architecture.

## ADR-0003: Specify a scripted three-product cinematic demo

- **Date:** 2026-07-11
- **Status:** Proposed
- **Context:** The pitch needs a reliable consumer story before implementation begins. The team requested real product/store/marketplace references and three completely different products, while avoiding live integrations or contact with real sellers.
- **Decision:** Plan a deterministic 126-second demo: adidas Samba OG retail purchase, Nintendo Switch OLED OLX verification/negotiation, and Fujifilm X100F eBay off-platform-risk rejection. Freeze and date public source captures; redact seller identity. Treat every message, evidence upload, negotiation, call, payment and receipt as a labelled simulation.
- **Consequences:** The production team has exact copy, timing, assets and claim boundaries. This does not approve a framework, architecture, integration or transition to implementation.
- **Related documents:** [Cinematic demo vision](CINEMATIC_DEMO_VISION.md), [Storyboard](DEMO_STORYBOARD.md), [Claims](CLAIMS_AND_SIMULATIONS.md)

## ADR template

- **ID and title:**
- **Date:**
- **Status:** Proposed / Accepted / Superseded
- **Context:**
- **Decision:**
- **Consequences:**
- **Related issues/documents:**

## ADR-0005: Replace visible state tooling with cinematic keyboard playback

- **Date:** 2026-07-11
- **Status:** Accepted
- **Context:** Manual state navigation consumed presentation space and visibly resembled a developer tool. The team selected the four generated Relyo screens as the visual source of truth and requested one canonical entry state.
- **Decision:** Remove visible state navigation and the extra stage header. Every load starts at the same home screen. From home, `1`, `2` and `3` start deterministic full-screen scenarios; `Esc` cancels playback and returns home. Scenario 3 pauses for exactly one `Allow agent to call` click before its 27-second local audio and transcript continue. Keep all controls hidden from the product UI except the required approval.
- **Consequences:** The composition closely follows the selected 16:9 references. Refreshing never resumes an old scenario. Public-source captures, deterministic calculations and simulated seller behavior remain visibly separated. `/demo` and `/states` redirect to `/`.
- **Related documents:** [Interaction spec](INTERACTION_SPEC.md), [Brand direction](BRAND_DIRECTION.md), [Claims](CLAIMS_AND_SIMULATIONS.md)

## ADR-0004: Start the static interface implementation

- **Date:** 2026-07-11
- **Status:** Accepted
- **Context:** The three demo narratives, source captures and cinematic specification are complete. The team explicitly requested the brand and full static interface while deferring playback orchestration and external integrations. The active tree no longer contained a frontend stack.
- **Decision:** Transition the project from `Discovery` to `Static UI implementation`. Use a minimal Next.js App Router application with strict TypeScript and plain CSS. Implement `/states` and `/demo` as manual, deterministic review surfaces. Do not add external APIs, persistence, keyboard scenario playback or live commerce behavior.
- **Consequences:** The repository becomes locally runnable and preview-deployable while preserving deterministic playback assets. A later ADR is still required for runtime orchestration, backend boundaries and deployment.
- **Related documents:** [Brand direction](BRAND_DIRECTION.md), [Cinematic demo vision](CINEMATIC_DEMO_VISION.md), [Open decisions](OPEN_DECISIONS.md)
