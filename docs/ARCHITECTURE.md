# Architecture

**Status: Static frontend selected; runtime architecture remains open.** The approved surface is one Next.js App Router application using strict TypeScript and plain CSS. It has no backend, persistence or external integration in this phase.

The earlier generic scaffold was removed from the active tree. The current frontend is a new, deliberately narrow static implementation based on the approved cinematic specification and frozen assets.

## Possible system areas

The frontend is approved. Remaining areas are discussion boundaries, not components to implement yet:

- **Frontend:** one canonical `/` experience. A hidden in-memory state machine drives deterministic playback; `/demo` and `/states` redirect home and expose no developer controls.
- **Backend:** scenario state, orchestration, price events, audit trail
- **Agent layer:** language understanding, tool selection, structured proposal/explanation
- **Investigation and negotiation:** availability checks, image/condition analysis, seller evidence, proactive questions, bounded negotiation
- **Deterministic decision logic:** landed cost, caps, coupon validity, alert threshold, strike eligibility
- **Mocked commerce environment:** merchants, listings, stock, prices, FX, shipping, duties, bait events
- **Payment and mandate adapter:** approval, standing consent, simulated strike, possible future payment rail
- **Shared contracts:** briefs, offers, normalized products, costs, decisions, mandates, receipts, evaluations
- **Deployment:** local demo, preview environment, recovery/fallback path

## Questions before approval

1. What single demo slice must the architecture optimize for?
2. Which behaviors must be deterministic, model-assisted, or entirely seeded?
3. Where is the trust boundary for approval and delegated action?
4. What data must persist, if any?
5. What frontend/backend contract lets contributors work independently?
6. Should the brand narrative and interactive demo be one deployable site or separate surfaces?
7. Are any AP2, BLIK, Solidgate, marketplace, or messaging adapters in scope?
8. How will strike precision and false-buy rate be reproduced?
9. Should the confirmed Sites project or Vercel host the approved stack, and what local fallback is required?

Approve answers in [Open decisions](OPEN_DECISIONS.md) and record the architecture decision in [Decisions](DECISIONS.md) before coding.
