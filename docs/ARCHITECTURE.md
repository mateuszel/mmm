# Architecture placeholder

**Status: Not selected.** No final architecture, framework, stack, persistence layer, integration strategy, or deployment method is approved.

The repository contains an earlier generic Next.js scaffold. It is preserved for review but is not an architecture decision for the Solidgate case.

## Possible system areas

These are discussion boundaries, not components to implement yet:

- **Frontend:** conversational brief, monitored-deal state, alert/approval flow, receipt and explanation
- **Backend:** scenario state, orchestration, price events, audit trail
- **Agent layer:** language understanding, tool selection, structured proposal/explanation
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
6. Is the existing scaffold worth retaining, simplifying, or replacing?
7. Are any AP2, BLIK, Solidgate, marketplace, or messaging adapters in scope?
8. How will strike precision and false-buy rate be reproduced?
9. What deployment and offline fallback are credible within the event window?

Approve answers in [Open decisions](OPEN_DECISIONS.md) and record the architecture decision in [Decisions](DECISIONS.md) before coding.
