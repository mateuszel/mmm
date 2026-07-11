# Preliminary product brief

**Status: Provisional.** This brief organizes the discussion; it does not lock the MVP, product name, or implementation.

## Working problem statement

Online shoppers can miss short-lived good prices or be misled by sticker prices, fake discounts, cross-border costs, and duplicated listings. Existing trackers often monitor one listed price and create noisy alerts. A trusted agent could do the arithmetic and judgment while keeping spending under explicit user control.

## Provisional target user

A price-conscious online shopper seeking a specific product/variant who is willing to define a clear budget and seller constraints but does not want to monitor multiple shops continuously.

## Provisional value proposition

“Describe what you want and your true delivered-price ceiling; receive one explainable alert or controlled action when a verified deal actually meets it.”

## Expected journey

1. User writes a shopping brief with product, variant, budget, seller, and approval constraints.
2. The system monitors deterministic merchant/listing events.
3. It matches equivalent offers and computes landed cost.
4. It rejects bait, fake discounts, invalid coupons, and cap violations.
5. It produces a calibrated alert with evidence and price math.
6. It prepares or simulates a purchase only according to the chosen approval/mandate rule.
7. It issues a receipt and explanation.

## Possible core demo

A deterministic sequence in which several misleading offers appear before one valid deal. The system explains each rejection, recognizes the valid offer, and demonstrates either an approval request or a capped simulated strike. This is a candidate, not the approved demo.

## Possible differentiators

- Landed-cost reasoning instead of sticker-price tracking
- Same-product matching across messy listings
- High-precision alerts and explicit false-buy evaluation
- Revocable mandate with non-negotiable caps and receipts
- Local-market relevance through a possible BLIK/AP2 narrative

## Preliminary success criteria

- The audience understands the user's intent, cap, and trust boundary immediately.
- The system chooses correctly on a deterministic trap-filled fixture set.
- Landed-cost math and every rejection/strike are explainable.
- Strike precision and false-buy rate can be reported reproducibly.
- The demo works without live scraping, real merchants, or payment credentials.

## Current non-goals

- Production commerce, scraping, marketplace, Messenger, AP2, BLIK, PSP, or Solidgate integration
- Real autonomous payments or custody of credentials
- Broad catalog coverage or production-grade product matching
- Final technology stack, architecture, deployment, authentication, or database design

## Major risks

- Trying to demonstrate too many differentiators at once
- Confusing deterministic fixtures with live integrations
- Weak product matching or price math undermining trust
- An autonomy story that feels unsafe or cannot be explained
- Overusing models where deterministic rules are more credible
- Spending hackathon time on payment plumbing that the case does not require

## Assumptions requiring validation

- Users value delegated action more than high-quality notification alone.
- AP2/BLIK improves partner fit enough to justify scope.
- A messenger-style UX makes the flow clearer rather than gimmicky.
- Coupons, marketplaces, or private sellers materially improve the core demo.
- A small seeded matching problem is credible to judges.
