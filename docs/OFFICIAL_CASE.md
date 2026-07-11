# Official Solidgate case

**Status: Confirmed**
**Source:** `solidgate-case.pdf`, 7-slide official case presentation supplied on 2026-07-11.

This file contains only requirements and framing present in the official case deck. Team ideas belong in [Current concept](CURRENT_CONCEPT.md).

## Challenge goal

Build a demo-friendly AI shopping assistant: a deal-hunter that receives a plain-language item brief and price ceiling, watches offers, and acts when the **true delivered price** meets the user's conditions. The central trust question is when an agent may spend money and how it proves that the action was justified.

## Expected user flow

1. The user states the item, size/variant, price ceiling, preferences, and conditions in plain language.
2. The agent monitors shops and marketplaces, matches equivalent products, and recomputes true price as offers and exchange rates change.
3. It verifies seller, stock, and discount quality before treating an offer as a deal.
4. It sends one meaningful alert with checkout prepared, or simulates/completes a purchase only inside a standing mandate and cap.
5. Every strike produces a receipt containing the reasoning and price calculation.

## Required judgment problems

### Landed cost

The decision must use sticker price plus delivery, foreign-exchange effects, duties, and coupon validity. Sticker price alone is insufficient.

### Same-product matching

The agent must address matching the same product across fuzzy titles, SKUs, variants, duplicates, and fakes. The team must decide what is solved and what is seeded in fixtures.

### Fake discounts and bait listings

The agent should reject misleading “was” prices, fake discounts, unavailable stock, bait offers, and offers whose final price exceeds the user's ceiling.

### Notification calibration

Alerting on everything causes users to mute the product; never alerting makes it useless. Alerts should be calibrated against the user's brief and price ceiling so that one alert matters.

### Standing consent and hard caps

Consent is granted in the brief, scoped to an item, cap, and conditions, and revocable. A hard cap is a boundary the agent cannot reason around. Borderline cases must escalate to the user.

### Receipts and explanations

Every strike must log why the action was taken and show the full price math. User overrides should refine the brief or future behavior.

## Simulation and evaluation

- Use a deterministic price-event merchant simulator; live scraping is explicitly described as a demo risk.
- Keep the judgment and landed-cost engine real even if merchants are mocked.
- Build an evaluation set containing bait listings, fake discounts, and foreign-exchange traps.
- Report **strike precision**: how often a strike/alert is truly justified.
- Report **false-buy rate**: how often the system would buy when it should not.

## Integration boundary

**Confirmed:** PSP integration is not required. The case is intended to be measurable and demo-friendly. Any real Solidgate, AP2, BLIK, checkout, marketplace, or payment integration is outside the confirmed brief unless separately approved.
