# Current concept

**Status: Provisional.** This is the team's current working direction, not the final scope and not implemented functionality.

## Leading working direction

A conversational, proactive shopping negotiator lets the user describe a desired product, size/variant, maximum delivered budget, minimum discount, allowed sellers, product-condition requirements, and approval conditions. It may monitor mocked offers, identify viable sellers, investigate listings, ask useful questions, negotiate within boundaries, and return an explainable recommendation or action proposal.

## Provisional capability areas

- **Deal monitoring:** watch deterministic shops or marketplace-like fixtures and notify only when a meaningful threshold is crossed.
- **Availability and condition:** verify that the exact variant is available and inspect listing photos or seeded visual evidence, especially for used goods.
- **Seller intelligence:** synthesize seller ratings, review patterns, response history, and warning signals without claiming certainty the evidence cannot support.
- **Proactive negotiation:** prepare or simulate concise seller messages about availability, condition, authenticity, missing details, delivery, and price; escalation and spending boundaries remain mandatory.
- **True final price:** include delivery, currency conversion, duties, and valid coupons.
- **Promotional intelligence:** discover coupon candidates, compare with historical/reference prices, and flag fake discounts, duplicated listings, or reseller markup.
- **Purchase mandate:** support approval-based action and possibly limited autonomous action under explicit, revocable caps.
- **AP2 direction:** explore mandate/delegated-payment concepts; no compliance claim or implementation decision exists.
- **BLIK direction:** explore whether a Polish payment-method story improves the demo; no real BLIK support exists.
- **Conversation-first experience:** possibly present proactive messages and negotiation as a fictional messenger-like flow; no real messaging integration exists.
- **Marketplace/private-seller extension:** optionally match messy listings, ask seller questions, or negotiate; scope is unresolved.

## Possible action modes

1. Notify and explain only.
2. Prepare checkout and request confirmation.
3. Simulate purchase within a previously granted mandate.

## Provisional product surfaces

- **Brand/pitch page:** a compact, polished narrative introducing the problem, trust model, and product value.
- **Interactive demo:** a minimal operational UI showing the brief, monitored listing, evidence, negotiation, approval boundary, and receipt/explanation.

The design direction is clean and restrained. These may be one coherent site rather than two independently built products.

Whether mode 3 appears in the final demo is an [open decision](OPEN_DECISIONS.md). No autonomous real payment is authorized or implemented.
