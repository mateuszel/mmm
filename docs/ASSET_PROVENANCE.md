# Asset provenance

**Status: Produced and validated with two explicit source gaps.** Canonical machine-readable metadata is in [`public/demo-assets/manifest.json`](../public/demo-assets/manifest.json); SHA-256 values are in [`checksums.sha256`](../public/demo-assets/checksums.sha256).

Capture and local optimization session: `2026-07-11T11:24:00Z–2026-07-11T11:34:00Z`. Chrome used a 1920x1080 CSS viewport override; screenshots retain browser device scaling. No login, seller contact, phone reveal, message, offer, checkout or payment occurred.

## Real-source register

| ID | Scenario | Source and URL | Full capture | Main derivatives | Visible source state | Redactions | Intended placement | Status |
|---|---:|---|---|---|---|---|---|---|
| S1-ADIDAS | 1 | [adidas IG1024](https://www.adidas.pl/buty-samba-og/IG1024.html) | `sources/adidas/adidas-ig1024-fullpage.webp` | product, product-info, size, viewport, browser, thumb | PLN 396.75; EU 43⅓ appears unavailable | None required; logged-out public page | Product identity and official-offer rejection | Accepted |
| S1-EOBUWIE | 1 | [eobuwie IG1024](https://eobuwie.com.pl/p/sneakersy-adidas-samba-og-ig1024-bialy-0000305636324) | `sources/retail/eobuwie-ig1024-fullpage.webp` | product, product-info, viewport, browser, thumb | PLN 339.99 visible; delivery amount not treated as captured fact | None required; logged-out public page | Winning public reference and receipt attribution | Accepted |
| S1-PRM | 1 | [PRM IG1024](https://prm.com/pl/p/adidas-originals-samba-og-sneakersy-kolor-bialy-ig1024-34026) | `sources/retail/prm-ig1024-unavailable-fullpage.webp` | viewport, browser, thumb | Product currently unavailable | None required | Unavailable-source state; historical promo remains demo data | Accepted with scripted-value separation |
| S1-FARFETCH | 1 | [Farfetch item 20552905](https://www.farfetch.com/pl/shopping/men/adidas-samba-og-sneakers-item-20552905.aspx) | `sources/retail/farfetch-ig1024-fullpage.webp` | product-info, viewport, browser, thumb | PLN 515 and estimated delivery visible | None required | Higher-cost comparison | Accepted with scripted-value separation |
| S2-OLX-1083464946 | 2 | [locked OLX listing](https://www.olx.pl/d/oferta/nintendo-switch-oled-neon-mega-zestaw-pro-pad-karta-128gb-etui-oivo-CID99-ID1bk6J4.html) | `sources/olx/olx-1083464946-unavailable-fullpage.webp` | unavailable viewport | Listing is no longer available | Seller panel/contact never captured | Proves locked source status only | Blocked: approved listing screenshot absent |
| S2-OLX-SEARCH | 2 | [current OLX search](https://www.olx.pl/elektronika/gry-konsole/q-nintendo-switch-oled/) | `sources/olx/olx-switch-search-fullpage.webp` | top, results, browser, thumb, demo-column crop | Current real results, titles, images and protected-price badges | No seller name/avatar/phone; only city labels retained | Real OLX search context; not the fictional conversation | Accepted |
| S3-EBAY-CATEGORY | 3 | [eBay X100F category](https://www.ebay.de/b/Fujifilm-X100f/31388/bn_7005354962) | `sources/foreign/ebay-x100f-search-fullpage.webp` | result card, viewport, browser, thumb | First visible X100F result EUR 1100 + EUR 20 shipping | No seller profile/contact captured | Foreign search context only | Accepted |
| S3-EBAY-805 | 3 | Direct URL unavailable | — | — | Earlier EUR 805 + EUR 5.50 result not recoverable | N/A | Script values must appear outside eBay capture | Blocked: approved capture/history needed |

All full and cropped assets include source attribution and alt text in the manifest. Derivatives resize, crop or add a clean browser frame; none changes a merchant price, availability or statement.

## Generated supporting assets

| File | Scenario | Tool | Operation | Intended placement | Status |
|---|---:|---|---|---|---|
| `product/switch-touchscreen-simulated.webp` | 2 | Built-in `imagegen` | Original staged evidence photo | Touchscreen/bezel analysis labelled `Simulated evidence` | Accepted |
| `product/switch-bundle-simulated.png` | 2 | Built-in `imagegen` + chroma-key removal | Transparent bundle cutout | Accessories/full-bundle evidence labelled `Simulated evidence` | Accepted |
| `seller/avatar-foreign-imagegen.png` | 3 | Built-in `imagegen` + chroma-key removal | Transparent faceless fictional avatar | Simulated call identity | Accepted |
| `icons/*.svg`, `warnings/*.svg`, `payment/*.svg`, `call/waveform-27s.svg`, `seller/avatar-*.svg` | 1–3 | Repo-native SVG | Original, non-branded vector assets | Privacy, verification, payment, warning, waveform and fallback avatars | Accepted |

Exact generation prompts, dimensions, alt text and tool names are recorded in the manifest and `supporting-metadata.json`. The rejected abstract call-background draft was not copied into the repository after the team requested clean UI backgrounds.

## Audio and subtitles

Current presentation master: `audio/german-call/combined.wav`, assembled losslessly from six team-supplied WAV clips with 350 ms gaps. Clips 1/3/5 are Relyo and 2/4/6 are the fictional seller. Total duration is 46.925 seconds; clips 4 and 6 were duplicated from mono to stereo only in the combined master. The untouched source clips remain in `audio/german-call/`. Exact timings are stored in `call/german-transcript.json`.

The InPost mark at `/brand/inpost-logo.svg` was captured from the official `https://inpost.pl/themes/custom/inpost/logo.svg` asset on 2026-07-11. It appears only beside copy explicitly describing a planned delivery collaboration; it is not evidence of a live integration.

| Deliverable | File | Provenance | Duration/status |
|---|---|---|---|
| Combined browser master | `audio/scenario-3-call-combined.m4a` | Two fictional local macOS German synthetic voices; [call script](CALL_SCRIPT.md) | 27.000 s, Accepted |
| Agent/seller stems | `audio/scenario-3-call-{agent,seller}-stem.m4a` | Separate synthetic voices | 27.000 s each, Accepted |
| Silent rehearsal | `audio/scenario-3-call-rehearsal-silent.m4a` | Deterministic silent export | 27.000 s; RMS 0, Accepted |
| Live-presenter cues | `audio/scenario-3-call-live-presenter-cues.m4a` | Agent lines plus deterministic seller cues | 27.000 s, Accepted |
| Transcript/captions | `call/transcript.json`, `call/subtitles-pl.vtt`, `call/subtitles-pl.srt` | Exact bilingual call script | Timings aligned, Accepted |
| Waveform | `call/waveform.json`, `call/waveform-27s.svg` | Deterministic 4/4/5/5/3/3/3 s segments | 27.000 s, Accepted |

WAV masters are retained for editing; M4A copies are used for browser playback. No API key, network TTS, real-person imitation or phone call was used.

## Privacy and factual review

- No private telephone number appears in any capture or generated asset.
- No seller profile, seller avatar or contact details were captured from OLX or eBay.
- Current OLX result sellers and the visible eBay result are not connected to scripted messages, negotiation, call or payment risk.
- The fictional avatar and masked number exist only as separate MMM-interface assets.
- Real screenshots retain their current prices and availability. Conflicting scripted values are documented as deterministic demo data.
- Official branding appears only inside genuine page/product captures.

## Offline and coverage gate

- [x] All produced assets are stored under `public/demo-assets/`.
- [x] Runtime manifest contains no external asset dependency.
- [x] Images are WebP for captures/product photography and PNG/SVG where transparency is needed.
- [x] Source facts were not invisibly edited.
- [x] No real seller is linked to fictional risky behavior.
- [x] No private phone number remains visible.
- [x] Browser frames and viewport captures are legible at 1920x1080.
- [x] Scenario 1 has retail product, price, comparison and browser assets.
- [x] Scenario 2 has real OLX search/unavailability context plus clearly simulated evidence assets.
- [x] Scenario 3 has real eBay search/product context, call assets, captions and warnings.
- [ ] Replace the OLX unavailable-state asset only if the team supplies an approved screenshot of listing `1083464946` or a team-owned listing.
- [ ] Recover the approved eBay EUR 805 listing capture or keep EUR 805 + EUR 5.50 visibly labelled `Deterministic demo values`.

These two unchecked source items are documented gaps, not hidden substitutions. The asset package remains usable for an offline scripted prototype because the real platform context and the simulated branches are intentionally separate.
