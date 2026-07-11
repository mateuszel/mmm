# Real source map

**Status: Approved source selection; captures completed with recorded source gaps.** This map fixes which public pages may supply demo evidence. It does not authorize live playback, seller contact or replacing an unavailable source with a different product.

All captures must be frozen locally and logged in [Asset provenance](ASSET_PROVENANCE.md). Prices, availability and delivery terms are facts only when they are visible in the timestamped capture. Scripted values that are not visible in a capture must be rendered separately as deterministic demo data.

## Global capture rules

- Capture the original page before cropping, at a recorded viewport and UTC timestamp.
- Preserve the source's displayed price, currency, availability and wording. Never edit those facts inside a source screenshot.
- Store an archival-quality full-page WebP and browser-compatible cropped derivatives; do not load a live page during playback.
- Keep enough browser chrome or source branding in at least one derivative to make attribution clear.
- Treat every page as mutable. Once approved, the local capture and its checksum are the immutable demo reference.
- If a selected page disappears or materially changes, keep the last valid local capture. Do not silently substitute another listing or rewrite the scenario; record the issue and obtain a source-lock decision.
- Third-party captures are public reference material, not evidence of partnership, endorsement, inventory at playback time or a live integration.
- Never contact, call, message, negotiate or transact with a real seller for the demo.
- Never associate a scripted message, negotiation, phone call or risky act with a real seller. All such behavior is a clearly labelled fictional branch.
- Redact personal names, usernames, avatars, precise locations, contact details, phone numbers and account identifiers wherever a private seller could be identified.

## Scenario 1 — adidas Samba OG retail comparison

**Locked product:** adidas Samba OG White/Green, article `IG1024`, size EU 43⅓.

### S1-ADIDAS — official product reference

- **Source:** adidas Poland
- **Exact URL:** <https://www.adidas.pl/buty-samba-og/IG1024.html>
- **Role:** authoritative product identity and official-store comparison offer
- **Required captures:** full product page; browser-window view; product hero; title/article number; displayed price; size EU 43⅓ state; stock/availability state; delivery/returns information when visible
- **Required fields:** capture UTC time, viewport, title, article `IG1024`, selected size, displayed price, currency, availability, delivery text, original filename, derivative filenames and checksum
- **Intended placement:** search-result card, product-match proof, official-store rejection card
- **Immutable/fallback rule:** retain the frozen page even if price or stock later changes. If `IG1024` or EU 43⅓ cannot be evidenced, mark that field unavailable; do not alter the screenshot or switch models.
- **Privacy:** no account, cart, delivery address or personalized data may appear.

### S1-EOBUWIE — selected retail offer

- **Source:** eobuwie
- **Exact URL:** <https://eobuwie.com.pl/p/sneakersy-adidas-samba-og-ig1024-bialy-0000305636324>
- **Role:** intended winning public reference offer
- **Required captures:** full product page; browser-window view; product card; title/model; displayed price; EU 43⅓ availability; delivery information when visible
- **Required fields:** capture UTC time, viewport, title, product identifier, selected size, displayed price, currency, availability, delivery text, original filename, derivative filenames and checksum
- **Intended placement:** comparison thumbnail, winner card and receipt attribution
- **Immutable/fallback rule:** demo copy may use PLN 339.99 + frozen PLN 0.99 delivery only when those values are supported by the approved capture or are separately labelled deterministic demo data. Never paint the scripted values into the source crop.
- **Privacy:** capture logged-out state; remove account, cart, location and personalization data.

### S1-PRM — promotion and landed-cost comparison

- **Source:** PRM
- **Exact URL:** <https://prm.com/pl/p/adidas-originals-samba-og-sneakersy-kolor-bialy-ig1024-34026>
- **Role:** lower displayed-price offer whose delivery/promotion conditions affect landed cost
- **Required captures:** full product page; browser-window view; product card; price area; EU 43⅓ availability; visible promotion/coupon conditions; delivery information when visible
- **Required fields:** capture UTC time, viewport, title, product identifier, displayed price, currency, selected-size state, promotion wording, basket threshold, delivery wording, original filename, derivative filenames and checksum
- **Intended placement:** comparison thumbnail, promotion analysis and rejected-offer explanation
- **Immutable/fallback rule:** use the PLN 329.99, PLN 500 threshold and PLN 19.99 delivery narrative only if visibly captured or rendered outside the screenshot as deterministic demo data. If a promotion changes, preserve the frozen capture and date it.
- **Privacy:** capture logged-out state; remove location, cart and account information.

### S1-FARFETCH — higher-cost comparison

- **Source:** Farfetch Poland
- **Exact URL:** <https://www.farfetch.com/pl/shopping/men/adidas-samba-og-sneakers-item-20552905.aspx>
- **Role:** real retailer comparison offer
- **Required captures:** full product page; browser-window view; product card; title/model; displayed price; size state; delivery information when visible
- **Required fields:** capture UTC time, viewport, title, model, selected-size state, displayed price, currency, availability, delivery wording, original filename, derivative filenames and checksum
- **Intended placement:** comparison thumbnail and rejected-offer card
- **Immutable/fallback rule:** the scripted PLN 379 comparison is valid only when supported by the frozen capture or displayed separately as deterministic demo data. Do not alter the store screenshot to match the script.
- **Privacy:** capture logged-out state; remove delivery location, account and personalization data.

## Scenario 2 — Nintendo Switch OLED on OLX

### S2-OLX-1083464946 — selected public listing

- **Source:** OLX Poland
- **Exact URL:** <https://www.olx.pl/d/oferta/nintendo-switch-oled-neon-mega-zestaw-pro-pad-karta-128gb-etui-oivo-CID99-ID1bk6J4.html>
- **Listing ID:** `1083464946`
- **Role:** real product/listing context for the deterministic private-seller scenario
- **Required captures:** search/results context when available; full selected listing; browser-window view; product gallery; title; displayed PLN 940 price; description area disclosing the cosmetic bezel crack; safe bundle/accessory details; delivery or buyer-protection section when visible
- **Required fields:** capture UTC time, viewport, title, price, currency, condition wording, disclosed defect wording, bundle contents, delivery/protection wording, original filename, derivative filenames, redaction log and checksum
- **Intended placement:** marketplace search result, selected-listing card, defect-evidence crop and protected-checkout context
- **Mandatory redactions:** real seller name/username, avatar, phone number, contact link destination, precise location, account identifiers and any identifying background detail. Retain only non-identifying country/region context when useful.
- **Immutable/fallback rule:** keep the captured listing locally if it expires. If it is unavailable before first capture, prefer a team-supplied screenshot or a team-owned OLX test listing; do not select another real private seller without a recorded source-lock decision.
- **Seller-contact restriction:** do not log in to contact the seller, reveal contact details, send a message, make an offer or purchase. The negotiation, evidence uploads and seller responses shown in the demo are fictional and must appear only in MMM's agent interface with `Simulated seller conversation` / `Simulated evidence` labels.

## Scenario 3 — Fujifilm X100F on eBay.de

### S3-EBAY-CATEGORY — stable discovery source

- **Source:** eBay Germany
- **Exact URL:** <https://www.ebay.de/b/Fujifilm-X100f/31388/bn_7005354962>
- **Role:** stable public search/category context and fallback capture for the selected X100F source
- **Required captures:** category/search results; browser-window view; selected-result card when present; product image; displayed price/currency; delivery line; source name
- **Required fields:** capture UTC time, viewport, search/category title, selected result title, price, currency, condition, delivery text, original filename, derivative filenames, redaction log and checksum
- **Intended placement:** foreign-source search screen and comparison/result card
- **Immutable/fallback rule:** freeze the category page used in the demo. If the previously selected EUR 805 result is absent, do not fabricate it inside the eBay screenshot and do not attach the scripted seller conduct to another live result.

### S3-EBAY-805 — selected private listing

- **Source:** eBay Germany
- **Expected frozen values:** Fujifilm X100F, EUR 805.00 + EUR 5.50 shipping
- **Direct URL:** **Pending recovery from an approved team capture or browser history.** It was not present in the public category results when rechecked at `2026-07-11T11:23:11Z`.
- **Role:** selected product/listing evidence only; never the source of the fictional phone or off-platform-payment behavior
- **Required captures when recoverable:** full listing; browser-window view; product image; title; EUR 805 price; EUR 5.50 delivery; condition; buyer-protection/checkout wording when visible; seller section only before complete anonymization
- **Required fields:** exact canonical item URL, eBay item number, capture UTC time, viewport, title, price, currency, condition, delivery wording, original filename, derivative filenames, complete redaction log and checksum
- **Intended placement:** foreign listing card and protected-cost calculation
- **Mandatory redactions:** seller name/username, avatar, feedback identity, location precision, item number where it could reconnect the fictional persona, phone/contact information and account identifiers
- **Immutable/fallback rule:** use an existing approved capture if available. If no approved EUR 805 capture can be recovered, use the category capture as the real public reference and render EUR 805 + EUR 5.50 separately as `Deterministic demo values`; replacing the selected listing or changing the scenario requires a recorded decision.
- **Seller-contact restriction:** do not contact or call the real seller and do not open contact details. The masked `+49 ••• ••• 4821`, phone request, German call, direct-transfer request and urgency are entirely fictional, shown only in MMM's interface and labelled `Simulated seller verification call`.

## Capture acceptance gate

A source is ready for demo use only when:

- the full capture and every crop exist locally under `public/demo-assets/sources/`;
- the URL, UTC timestamp, viewport and SHA-256 checksum are recorded;
- values used from the source remain legible at 1920x1080;
- scripted values not visible in the source are clearly separated and labelled;
- all private-seller identity and contact data are redacted in every derivative;
- the manifest contains attribution and useful alt text;
- no final-playback asset references an external URL.
