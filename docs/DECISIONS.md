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

## ADR template

- **ID and title:**
- **Date:**
- **Status:** Proposed / Accepted / Superseded
- **Context:**
- **Decision:**
- **Consequences:**
- **Related issues/documents:**
