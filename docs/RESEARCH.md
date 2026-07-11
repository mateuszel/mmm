# Research log

Keep source-backed facts separate from team inference. Add links, access dates, and short conclusions; do not paste entire articles or decks.

## Confirmed source

### Official Solidgate case deck

- **Artifact:** `solidgate-case.pdf` supplied to the team on 2026-07-11
- **Summary:** AI shopping assistant centered on true delivered price, same-product matching, bait/fake-discount rejection, calibrated alerts, consent/caps, receipts, deterministic merchant simulation, strike precision, and false-buy rate.
- **Repository interpretation:** [Official case](OFFICIAL_CASE.md)

### Team concept presentation

- **Artifact:** `ai_shopping_agent_dwie_sciezki.pdf`, supplied on 2026-07-11
- **Summary:** Compares a deterministic retail deal/strike route with a private-seller evidence and negotiation route, and recommends combining measurable retail logic with a stronger narrative interaction.
- **Repository interpretation:** [Presentation context](PRESENTATION_CONTEXT.md) and [Cinematic demo vision](CINEMATIC_DEMO_VISION.md)

### Public market and demo references

- **Accessed:** 2026-07-11
- **InPost Von Halsky:** Official page describes conversational product search, comparison, cart, payment and delivery inside the InPost app. Treat as a [market benchmark](MARKET_CONTEXT.md), not a partner or integration.
- **Retail:** adidas `IG1024`, eobuwie, PRM and Farfetch public pages; prices and stock require final capture-time verification.
- **Private marketplace:** OLX Nintendo Switch OLED listing ID `1083464946`; seller identity must be redacted and all demo messages must be fictionalized.
- **Foreign marketplace:** eBay.de Fujifilm X100F public results; freeze the chosen listing and never contact the real seller.
- **Capture requirements:** [Asset manifest](ASSET_MANIFEST.md)

## Requires validation

- AP2 capabilities, terminology, compliance implications, and hackathon relevance
- BLIK flow feasibility and whether it strengthens the Solidgate narrative
- Solidgate products or APIs relevant to a simulated or live payment step
- Marketplace/private-seller data access and negotiation constraints
- Coupon discovery reliability and validation method
- FX, duties, shipping, and historical-price data sources
- Legal/safety implications of delegated purchasing and standing consent
- Sites deployment workflow and limitations for the final selected stack. Account access is confirmed and project metadata is stored in `.openai/hosting.json`.
- Reliability/limitations of image-based condition analysis and seller-review summarization
- Marketplace messaging rules and safe negotiation boundaries

## Research entry template

- **Question:**
- **Status:** Confirmed / Provisional / Requires validation
- **Source and access date:**
- **Finding:**
- **Impact on product decision:**
- **Related open decision:**
