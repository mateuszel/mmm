# Scenario timelines

Times below are local to each scenario. All playback is deterministic.

## Scenario 1 — adidas retail, 28 seconds

| Time | Stage | Visible action and copy | Motion/audio | Input and status |
|---|---|---|---|---|
| 00:00-00:03 | Request | adidas Samba OG `IG1024`, EU 43⅓, new, max PLN 350 delivered | Fixed type-on | `1`; deterministic |
| 00:03-00:06 | Mandate | SKU, size, new, cap, trusted retailer, protected payment, auto-buy | Mandate chips lock | None; simulated mandate |
| 00:06-00:11 | Search | adidas, Farfetch, PRM, eobuwie cards | Sequential focus pull | Frozen real pages; simulated search |
| 00:11-00:15 | Rejections | adidas PLN 396.75; Farfetch PLN 379.00 | Red rule, quiet reject | Public snapshot data |
| 00:15-00:19 | Promo trap | PRM PLN 329.99; extra 5% ineligible below PLN 500; delivery PLN 19.99; total PLN 349.98 | Coupon shakes once; cost expands | Promotion public; checkout/delivery snapshot frozen |
| 00:19-00:23 | Winner | eobuwie PLN 339.99 + PLN 0.99 = PLN 340.98 | Winner card grows into chat | Frozen public snapshot |
| 00:23-00:25 | Purchase | “Within mandate. Authorizing…” | Calm progress line | Simulated purchase/BLIK |
| 00:25-00:28 | Receipt | Purchased; PLN 9.02 below cap | Receipt settles, success tone | Hold final frame |

## Scenario 2 — Nintendo Switch OLED on OLX, 36 seconds

| Time | Stage | Visible action and copy | Motion/audio | Input and status |
|---|---|---|---|---|
| 00:00-00:04 | Request | Used Switch OLED, complete set, protected delivery, max PLN 980 final | Fixed type-on | `2`; deterministic |
| 00:04-00:08 | Listing | OLX ID `1083464946`, PLN 940, cosmetic bezel crack | Listing folds into chat | Real screenshot, identity redacted |
| 00:08-00:12 | Evidence gaps | Touch, drift, dock output, serial, accessories, protected shipping | Checklist reveals | Precomputed policy |
| 00:12-00:19 | Contact | Agent asks; fictionalized seller sends test/photo evidence | Two message bubbles and asset tiles | Simulated conversation/evidence |
| 00:19-00:23 | Analysis | Touch/dock/controls pass; cosmetic crack remains | Evidence pins and concise labels | Precomputed analysis |
| 00:23-00:28 | Negotiate | Offer PLN 900; counter PLN 920; reserve 15 min | Price bridge animates once | Simulated negotiation |
| 00:28-00:32 | True cost | PLN 920 + 15.99 + 15.99 = PLN 951.98 | Math resolves left-to-right | Deterministic calculation |
| 00:32-00:36 | Approval | Protected checkout prepared; user approval required | Approval sheet settles | No click; hold final frame |

## Scenario 3 — Fujifilm X100F on eBay.de, 50 seconds

| Time | Stage | Visible action and copy | Motion/audio | Input and status |
|---|---|---|---|---|
| 00:00-00:05 | Listing | X100F, EUR 805 + EUR 5.50 shipping = PLN 3,493.26 at 4.31 | FX conversion counts once | `3`; real frozen page, fixed FX |
| 00:05-00:10 | Message | Availability, shutter count, condition, eBay buyer protection | Simulated message sends | No real contact |
| 00:10-00:14 | Escalation | Fictional seller asks for a phone call | Phone request card enters | Simulated reply |
| 00:14-pause | Approval | “Allow agent to call” | Background quiets | Exactly one mouse click |
| 00:14-00:41 | Call | German call, Polish captions, timer, waveform | Scripted audio and fixed waveform | Simulated call; see CALL_SCRIPT |
| 00:41-00:45 | Risk policy | Off-platform payment, direct transfer, protection refused, urgency, channel change | Risk lines lock sequentially | Deterministic rules |
| 00:45-00:50 | Decision | Rejected; no money/data; search continuing | Risk collapses into trust receipt | Hold final frame |

## Autoplay and recording

- `A` plays cold open, scenarios, transitions and end card in 126 seconds.
- `Escape` stops playback and returns to the neutral reset state.
- Each direct scenario key resets all previous state and holds indefinitely on its final frame.
- Record individual scenario takes plus a complete autoplay take; no scrolling or network calls.
