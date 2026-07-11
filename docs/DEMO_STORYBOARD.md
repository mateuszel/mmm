# Demo storyboard

**Status: Provisional.** Real products and public listing snapshots; deterministic product behavior.

## Cold open — 4 seconds

- Visual: three compact intent tokens — **buy**, **verify**, **stop** — resolve into one mandate rail.
- Copy: **One agent. Every channel. Your rules.**
- Transition: the rail narrows into the chat composer.

## Scenario 1 — safe retail purchase, 28 seconds

**Product:** adidas Samba OG White/Green `IG1024`, EU 43⅓.

1. The request types: find the exact model under PLN 350 delivered and buy automatically from a trusted retailer.
2. A mandate appears: exact SKU/size, new condition, hard cap, protected payment, autonomous purchase allowed.
3. Frozen cards from adidas, Farfetch, PRM and eobuwie enter one by one.
4. adidas is rejected at PLN 396.75; Farfetch at PLN 379.00.
5. PRM shows PLN 329.99, but the advertised extra 5% requires a PLN 500 basket; with scripted PLN 19.99 delivery the true cost is PLN 349.98.
6. eobuwie wins: PLN 339.99 + frozen PLN 0.99 delivery = **PLN 340.98**.
7. A simulated autonomous purchase runs within the mandate.
8. Final receipt shows the real product/reference merchant, price math, mandate and simulated BLIK authorization.

**Final frame:** `Purchased within mandate · PLN 9.02 below cap`.

## Scenario 2 — successful OLX negotiation, 36 seconds

**Product:** Nintendo Switch OLED Neon bundle, real OLX listing ID `1083464946`, asking PLN 940.

1. A frozen, anonymized listing capture appears. The public description mentions a cosmetic crack in the black bezel and a larger accessory bundle.
2. The agent identifies missing evidence: touchscreen around the crack, Joy-Con drift, dock/HDMI output, serial label, included accessories and protected shipping.
3. A short **simulated alternative conversation** asks for a screen test and accessory photo. It is not a real OLX conversation.
4. Scripted seller evidence arrives; precomputed checks mark the touchscreen, dock and controls as consistent while keeping cosmetic-condition risk visible.
5. The agent offers PLN 900 inside its mandate; the fictionalized seller branch counters PLN 920 and reserves for 15 minutes.
6. True cost: PLN 920 + PLN 15.99 shipping + PLN 15.99 protection = **PLN 951.98**.
7. The agent prepares protected checkout and requests user approval.

**Final frame:** `Verified deal ready for approval · Reserved 15 min`.

## Scenario 3 — eBay off-platform risk, 50 seconds

**Product:** Fujifilm X100F, frozen eBay.de private-listing/search snapshot at EUR 805.00 + EUR 5.50 protected shipping.

1. The agent converts the protected cost at the frozen rate PLN 4.31/EUR: **PLN 3,493.26**.
2. A simulated message asks whether the camera, shutter count and protected eBay checkout are available.
3. The fictionalized seller asks to continue by phone. No real seller is contacted.
4. The agent requests one approval: **Allow agent to call**. Playback pauses.
5. One presenter click opens `Simulated seller verification call`; a masked fictional number and privacy relay are visible.
6. German speech, transcript and Polish translation play automatically.
7. The fictional seller proposes EUR 760 by direct bank transfer, outside eBay, and applies urgency.
8. The agent asks once to retain eBay buyer protection, receives a refusal, ends the call and rejects the branch.

**Final frame:** `Listing rejected · No money transferred · No personal data shared · Search continuing`.

## Trust end card — 6 seconds

- Copy: **Autonomy does not mean blind execution.**
- Subcopy: **The agent knows when to buy, when to ask, and when to stop.**
- Visual: the three final outcomes align — purchased, approval required, rejected.

All exact UI text lives in [Demo copy](DEMO_COPY.md). Sources and capture requirements live in [Asset manifest](ASSET_MANIFEST.md).
