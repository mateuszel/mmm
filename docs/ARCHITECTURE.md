# Architecture placeholder

**Status: Not selected.** No final architecture, framework, stack, persistence layer, integration strategy, or deployment method is approved.

The earlier generic scaffold was removed from the active tree. It remains available in Git history but is not an architecture decision for the Solidgate case.

## Possible system areas

These are discussion boundaries, not components to implement yet:

- **Frontend:** conversational brief, monitored-deal state, alert/approval flow, receipt and explanation
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
9. Is ChatGPT Sites a real available hosting option for this account, or should the team use Vercel/local fallback?

Approve answers in [Open decisions](OPEN_DECISIONS.md) and record the architecture decision in [Decisions](DECISIONS.md) before coding.
