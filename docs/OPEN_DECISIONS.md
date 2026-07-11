# Open decisions

**Status: Static UI implementation approved.** Runtime, integration and deployment decisions remain open and are tracked below.

## Product and demo

- [ ] Approve the final value proposition and primary user.
- [x] Select the provisional cinematic demo flow: three products, three channels, 126-second master cut.
- [ ] Approve the final demo flow after asset capture and a timed rehearsal; retain caption-only fallback.
- [ ] Choose the main differentiator judges should remember.
- [ ] Decide whether the product is primarily deal discovery or delegated payment.
- [ ] Decide whether the core outcome is notification, prepared checkout, or simulated autonomous strike.
- [x] Set the demo sequence: adidas retail comparison, Nintendo Switch OLED on OLX, Fujifilm X100F on eBay.de.
- [ ] Define coupon discovery/validation scope.
- [x] Include marketplace questions, one bounded negotiation and an off-platform stop case.
- [x] Use three different products rather than one repeated hero product.
- [ ] Define negotiation boundaries: allowed questions, price range, concessions, stop conditions, and mandatory escalation.
- [ ] Define availability, photo/condition, authenticity, seller-review, and reputation evidence used in the demo.
- [x] Keep the brand entry, static-state review and interactive demo in one site with separate routes.
- [ ] Approve claims, product language, and explicit non-claims for the pitch.
- [ ] Confirm legal/brand treatment for real store, OLX and eBay screenshots and logos.
- [ ] Freeze and revalidate exact public pages, prices, stock, delivery and promotion terms immediately before recording.
- [ ] Confirm that seller redaction and fictional alternate-branch wording are visible enough on every marketplace scene.

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

- [ ] Approve backend, agent and shared-contract boundaries; the static frontend boundary is approved.
- [x] Approve a minimal Next.js App Router, strict TypeScript and plain CSS stack for the static prototype.
- [ ] Decide data/state persistence needs.
- [ ] Decide deployment method and demo fallback.
- [x] Confirm Sites availability for the current hackathon account and create the neutral Team MMM project.
- [ ] Select Sites or Vercel as the final host after the stack is approved; keep a local fallback.
- [ ] Decide test strategy and CI gates for implementation.
- [x] Record the explicit project-status transition from `Discovery` to `Static UI implementation`.
- [ ] Choose final UI language: English, Polish, or bilingual; German call retains Polish captions.
- [x] Approve presenter controls: `1`, `2`, `3` start scenarios only from home; `Esc` cancels and returns home; Scenario 3 has one call-approval click. `A` remains unassigned.
- [ ] Select synthetic voices and approve German pronunciation.
- [ ] Decide whether the theatre-mode live seller voice is worth rehearsal risk.
- [x] Approve the provisional Relyo identity and visual system for the hackathon prototype; legal clearance remains open.
- [ ] Decide whether Scenario 2 ends at approval (current recommendation) or simulated purchase.
- [ ] Select Sites or Vercel and confirm the local offline playback path.

## Team coordination

- [ ] Confirm temporary workstream owners.
- [ ] Confirm shared files/contracts and handoff points.
- [ ] Create implementation issues only after the demo slice is frozen.
