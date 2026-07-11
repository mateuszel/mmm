# Relyo

> **Buy when the mandate holds. Ask when evidence is missing. Stop when protection disappears.**

Relyo is a source-backed shopping agent prototype built by **Team MMM** for the **OpenAI x START Warsaw Hackathon, Solidgate challenge**. A user defines the product, budget and safety boundaries once. Relyo compares the true delivered cost, gathers missing evidence, communicates within the mandate and produces an explainable decision.

**Prototype status:** high-fidelity deterministic demo. It runs from local assets and does not perform live searches, calls, payments or seller contact.

## Three moments

| Key | Flow | What Relyo demonstrates | Outcome |
|---|---|---|---|
| `1` | **Retail: adidas Samba OG** | Compares source-backed offers, availability, promotions and landed cost against a hard cap. | Acts only when the retail mandate is satisfied. |
| `2` | **Private seller: Nintendo Switch OLED** | Identifies evidence gaps, simulates a concise seller exchange and preserves protected checkout. | Prepares a verified deal for approval. No payment is made. |
| `3` | **Risk boundary: Fujifilm X100V** | Pauses for call approval, then detects an off-platform transfer request in a simulated seller call. | Rejects the listing. No money or personal data is shared. |

Scenario 3 requires one visible click to approve the **simulated** verification call. Press `Space` to pause or resume. Press `R` or `Esc` to return home.

## Why it fits the Solidgate case

- **True landed cost:** price, delivery and promotion conditions are evaluated together.
- **Explicit authority:** product, spend, payment and communication rules remain visible.
- **Calibrated action:** Relyo can act, ask for approval or stop.
- **Decision receipts:** every outcome explains the evidence, rule and reason.
- **Measurable safety:** the concept aims for useful strikes while minimizing false buys.

## Trust by design

1. **Mandate first:** hard caps and protected-payment rules precede action.
2. **Source separation:** public captures remain visibly separate from deterministic calculations.
3. **Approval gates:** sensitive channel changes require explicit user approval.
4. **Stop conditions:** losing buyer protection ends the transaction.
5. **Complete trail:** evidence, decisions and simulated outcomes remain auditable.

## Run locally

Prerequisites: **Node.js 22** and Corepack.

```bash
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validate

```bash
corepack pnpm check
corepack pnpm exec playwright install chromium
corepack pnpm test:e2e
```

`check` runs ESLint, strict TypeScript checks, unit tests and a production build. End-to-end tests use the deterministic offline demo and require no API credentials.

## What is real, deterministic and simulated

| Classification | Included |
|---|---|
| **Public source captures** | Frozen public product, store and marketplace pages, their visible facts and documented provenance. A capture confirms only what the page displayed when recorded. |
| **Deterministic demo** | Scenario timing, mandate rules, selected demo values, calculations, risk policy and final decisions. |
| **Simulated integrations and actions** | Search execution, coupon validation, seller messages, generated evidence, negotiation, privacy relay, call, checkout, payment authorization and receipts. |

## Technology collaboration

- **OpenAI:** agent foundation, structured mandates and bounded decisions.
- **Luna 5.6:** team-selected low-cost model for seller-facing messaging.
- **ElevenLabs:** German voice assets for the protected seller-call sequence.
- **Ceneo:** historical-price context used to challenge weak promotions.
- **InPost:** planned checkout-to-delivery handoff.

The stage playback remains deterministic and offline. It does not call these services during the demo.

## Disclosure

- No real seller was contacted, called, negotiated with or associated with scripted behavior.
- No live merchant, marketplace, payment, delivery, voice or model API runs during playback.
- No real payment, phone relay or marketplace checkout occurs.
- The mandate is an **AP2-aligned concept**, not a claim of AP2 compliance.
- Public captures are references, not evidence of retailer endorsement, current inventory, authenticity or seller safety.
- Technology collaboration and product-direction claims above are supplied by Team MMM. They do not mean that a live partner API is active in the recorded prototype.

See [Claims and simulations](docs/CLAIMS_AND_SIMULATIONS.md), [Asset provenance](docs/ASSET_PROVENANCE.md) and [Official case](docs/OFFICIAL_CASE.md) for the evidence and language gates.

## Team MMM

- Maksymilian Marcinkowski
- Mateusz Lambert
- Mateusz Kucharski
