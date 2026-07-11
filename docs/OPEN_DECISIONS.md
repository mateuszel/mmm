# Open decisions

**Status: Open decision.** Coding must not begin until the essential product and technical decisions are checked and recorded in [Decisions](DECISIONS.md).

## Product and demo

- [ ] Approve the final value proposition and primary user.
- [ ] Select the final demo flow and fallback flow.
- [ ] Choose the main differentiator judges should remember.
- [ ] Decide whether the product is primarily deal discovery or delegated payment.
- [ ] Decide whether the core outcome is notification, prepared checkout, or simulated autonomous strike.
- [ ] Set the number and type of mocked merchants, countries, currencies, and event sequences.
- [ ] Define coupon discovery/validation scope.
- [ ] Include or exclude marketplace and private-seller questions/negotiation.
- [ ] Choose the hero product/category for the demo and define why negotiation matters there.
- [ ] Define negotiation boundaries: allowed questions, price range, concessions, stop conditions, and mandatory escalation.
- [ ] Define availability, photo/condition, authenticity, seller-review, and reputation evidence used in the demo.
- [ ] Decide whether the brand/pitch page and interactive demo are one site or separate routes/surfaces.
- [ ] Approve claims, product language, and explicit non-claims for the pitch.

## Trust and payments

- [ ] Define the level of AP2 exploration: narrative, conceptual mandate, mock protocol, or later integration.
- [ ] Define BLIK's role: exclude, narrative reference, mock UX, or later verified integration.
- [ ] Decide the role of a messenger-style interface and whether it is fictional or platform-specific.
- [ ] Define standing-consent fields, hard caps, revocation, escalation, and receipt contents.
- [ ] Decide live Solidgate integration versus complete simulation; PSP integration is not required by the case.

## Intelligence and evaluation

- [ ] Decide which behavior uses OpenAI models and which must remain deterministic.
- [ ] Decide how image analysis is demonstrated and how uncertainty is disclosed.
- [ ] Decide how seller reviews/reputation are summarized without unsupported claims.
- [ ] Decide whether outbound seller messages are only drafted or deterministically simulated.
- [ ] Select model-driven product matching scope versus seeded/evaluated matching.
- [ ] Define landed-cost inputs and authoritative calculation rules.
- [ ] Define bait, fake-discount, FX, coupon, stock, and duplicate-listing traps.
- [ ] Define evaluation set size, strike-precision target, false-buy target, and failure reporting.

## Technical delivery

- [ ] Approve frontend, backend, agent, and shared-contract boundaries.
- [ ] Approve the final stack after reviewing the existing scaffold.
- [ ] Decide data/state persistence needs.
- [ ] Decide deployment method and demo fallback.
- [ ] Verify whether ChatGPT Sites exists and is available to the team; otherwise use Vercel or a local fallback.
- [ ] Decide test strategy and CI gates for implementation.
- [ ] Record the explicit project-status transition from `Discovery` to `Implementation`.

## Team coordination

- [ ] Confirm temporary workstream owners.
- [ ] Confirm shared files/contracts and handoff points.
- [ ] Create implementation issues only after the demo slice is frozen.
