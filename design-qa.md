# Design QA

## Comparison target

- Source visual truth:
  - `/var/folders/zd/5yqmkqdd0tg5flkv1v6bgk0w0000gn/T/codex-clipboard-d7e4eb98-e199-4151-92b6-24b2feeae089.png`
  - `/var/folders/zd/5yqmkqdd0tg5flkv1v6bgk0w0000gn/T/codex-clipboard-7433477f-a66d-4f9f-839f-9209b9a0cc4b.png`
  - `/var/folders/zd/5yqmkqdd0tg5flkv1v6bgk0w0000gn/T/codex-clipboard-db33c1f9-4462-4967-b8c2-d0c25a4af20c.png`
  - `/var/folders/zd/5yqmkqdd0tg5flkv1v6bgk0w0000gn/T/codex-clipboard-02376426-d8d6-44f2-baeb-44f9dd805b2c.png`
- Durable reference copies: `docs/design-references/01-brand-initial.png` through `04-call-risk-workspace.png`
- Browser-rendered evidence:
  - `output/design-qa/home-prod-1920x1080.png`
  - `output/design-qa/retail-prod-final-1920x1080.png`
  - `output/design-qa/private-prod-final-1920x1080.png`
  - `output/design-qa/foreign-prod-final-v2-1920x1080.png`
  - `output/design-qa/home-prod-1440x900.png`
- Primary viewport: `1920 × 1080`
- Responsive check: `1440 × 900`
- States: canonical home, Scenario 1 final receipt, Scenario 2 verified-deal final, Scenario 3 call approval and rejection final.

## Full-view comparison evidence

Each reference and matching browser capture was opened together at original resolution. The implementation reproduces the selected frame structure: single header, full-width narrative workspace, scenario-specific 19/54/24, 36/31/28 and 34/41/23 grids, persistent trust footer, restrained green/red states and source-first evidence hierarchy.

Focused crops were not required for the final pass because both source and implementation captures are full-resolution 16:9 images and all critical typography, source labels, transcript rows, costs and approval controls are legible in the original-resolution comparison. Earlier implementation review did inspect the OLX evidence column and bilingual transcript as focused problem areas.

## Required fidelity surfaces

- **Fonts and typography:** Native high-x-height sans stack closely matches the reference’s Inter/Manrope character. Hero, panel headings, dense metadata, values and transcript maintain the same hierarchy without remote-font loading. No clipped critical copy remains.
- **Spacing and layout rhythm:** Presentation rail and duplicate stage heading were removed. Header/footer heights, outer gutters and scenario grids match the references. Both tested viewports report `scrollWidth === innerWidth` and `scrollHeight === innerHeight`.
- **Colors and tokens:** Near-white canvas, white panels, neutral 1 px borders, deep trust green, signal lime and pale red risk rows match the source logic. No gradients, glass, glow or decorative background effects are present.
- **Image quality and asset fidelity:** Authentic adidas, eobuwie, OLX and eBay captures are local and unmodified except for a documented OLX display crop. Product/evidence/call assets are local, sharp and correctly labelled. No real seller is connected to scripted messages or risk.
- **Copy and content:** Layout follows the selected visuals, while stale or unsupported reference values were intentionally replaced with the repository’s consistent values and mandatory simulation labels. This is an acceptable factual correction, not design drift.

## Comparison history

### Pass 1 — blocked

- **P1:** A permanent 246 px manual-state rail and second stage header made the product look like a developer tool.
- **P2:** Heavy black borders, beige canvas, undersized source panels and 8–10 px critical text diverged from the selected references.
- **Fixes:** Removed visible state tooling and links; made `/` canonical; redirected `/demo` and `/states`; rebuilt the frame with one header/footer, exact scenario grid ratios, white surfaces, restrained borders and 11–18 px recorded-demo typography.
- **Post-fix evidence:** `output/design-qa/home-1920x1080.png`, `retail-final-1920x1080.png`.

### Pass 2 — blocked

- **P2:** The wide OLX capture clipped listing titles in the 36% evidence column.
- **P2:** The Polish transcript wrapped into a narrow label column and the call workspace left a large unused central area.
- **Fixes:** Added a documented, content-preserving OLX display crop; corrected bilingual table layout; let the call session fill the center column; added a muted pre-approval preview and fixed 27-second timing.
- **Post-fix evidence:** `output/design-qa/private-prod-final-1920x1080.png`, `foreign-prod-final-v2-1920x1080.png`.

### Pass 3 — passed

No actionable P0, P1 or P2 visual mismatch remains. Product values and safety labels intentionally differ from the generated references where the reference contained stale prices, unsupported live claims or a real-seller implication.

## Interaction and browser verification

- Home always loads first after navigation or refresh.
- `1`, `2`, `3` start the correct scenario only from home.
- Pressing another scenario key during playback does not switch scenarios.
- `Esc` cancels playback, rewinds audio and returns home.
- Scenario 3 exposes exactly one `Allow agent to call` button; its click starts the local 27-second audio and the remaining deterministic sequence.
- Final frames hold indefinitely.
- Production console: no warnings or errors.
- No external API or asset URL is required by playback.

## Follow-up polish

- **P3:** A future licensed local font could make the hero’s letterforms even closer to the generated reference.
- **P3:** The deterministic waveform asset is visually denser than the thin waveform in the reference; it remains accepted because it is synchronized to the real 27-second local audio.

**final result: passed**
