# Current concept

**Status: Provisional.** This is the team's current working direction, not the final scope and not implemented functionality.

## Working direction

A conversational shopping agent lets the user describe a desired product, size/variant, maximum delivered budget, minimum discount, allowed sellers, and conditions for notification, approval, or delegated action. It may monitor mocked offers, match equivalent products, calculate landed cost, identify misleading deals, and prepare an explainable purchase decision.

## Provisional capability areas

- **Deal monitoring:** watch deterministic shops or marketplace-like fixtures and notify only when a meaningful threshold is crossed.
- **True final price:** include delivery, currency conversion, duties, and valid coupons.
- **Promotional intelligence:** discover coupon candidates, compare with historical/reference prices, and flag fake discounts, duplicated listings, or reseller markup.
- **Purchase mandate:** support approval-based action and possibly limited autonomous action under explicit, revocable caps.
- **AP2 direction:** explore mandate/delegated-payment concepts; no compliance claim or implementation decision exists.
- **BLIK direction:** explore whether a Polish payment-method story improves the demo; no real BLIK support exists.
- **Messenger-style experience:** possibly present the journey as a fictional chat/proactive notification flow; no Messenger integration exists.
- **Marketplace/private-seller extension:** optionally match messy listings, ask seller questions, or negotiate; scope is unresolved.

## Possible action modes

1. Notify and explain only.
2. Prepare checkout and request confirmation.
3. Simulate purchase within a previously granted mandate.

Whether mode 3 appears in the final demo is an [open decision](OPEN_DECISIONS.md). No autonomous real payment is authorized or implemented.
