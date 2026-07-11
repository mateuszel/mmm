# Preliminary product brief

**Status: Provisional.** This brief organizes the discussion; it does not lock the MVP, product name, or implementation.

## Working problem statement

Online shoppers can miss good listings or waste time verifying availability, condition, seller credibility, real cost, and room for negotiation. This is especially painful for used, scarce, or messy marketplace offers. A trusted agent could investigate and negotiate proactively while keeping communication and spending under explicit user control.

## Provisional target user

A shopper seeking a specific new or used product who cares about price, availability, condition, authenticity, and seller trust but does not want to monitor and message many sellers manually.

## Provisional value proposition

“Describe what you want and your boundaries; the agent finds the credible option, investigates it, negotiates within your rules, and brings back an explainable deal.”

## Expected journey

1. User writes a shopping brief with product, variant, budget, seller, and approval constraints.
2. The system monitors deterministic merchant or seller listings.
3. It matches equivalent offers, verifies availability, and computes landed cost.
4. It analyzes seeded photos/condition evidence, seller reputation, reviews, and missing information.
5. It drafts or simulates targeted questions and a bounded negotiation.
6. It rejects traps and returns one meaningful proposal with evidence and price math.
7. It requests approval or simulates action only under the chosen mandate rule, then issues a receipt/explanation.

## Possible core demo

A deterministic story around one desirable used or scarce product: the agent filters weak offers, inspects photos and seller evidence, detects missing details, asks questions, negotiates a better final price, and returns one safe proposal for approval. This is the leading candidate, not the approved demo.

## Possible differentiators

- Landed-cost reasoning instead of sticker-price tracking
- Same-product matching across messy listings
- Proactive availability/condition investigation and seller communication
- Visual evidence and seller-reputation analysis presented with calibrated confidence
- Bounded negotiation that knows when to ask the user
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
- Making a simulated negotiation look like a real message was sent
- Overclaiming what image analysis or reviews prove about condition/authenticity
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
- Negotiation creates more judge-visible value than a simpler alert/approval flow.
- The brand surface and product demo can share one implementation without splitting effort.
