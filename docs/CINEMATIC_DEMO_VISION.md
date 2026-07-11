# Cinematic demo vision

**Status: Provisional production specification.** This document freezes the narrative, not the implementation stack.

## Product promise

The agent does not merely find a low displayed price. It verifies the complete transaction and acts only inside a visible mandate. The three scenarios deliberately use **three different real products** and three different shopping contexts:

1. adidas Samba OG `IG1024`, size EU 43⅓ — retail comparison and autonomous purchase.
2. Nintendo Switch OLED — a real OLX listing requiring condition checks and negotiation.
3. Fujifilm X100F — a real eBay.de listing followed by a simulated off-platform-risk branch.

Real pages are frozen as timestamped reference captures. Seller identities, phone numbers and contact details are redacted. Search execution, messages, negotiation, calls, payment and receipts are deterministic simulations and must be labelled as such.

## Master cut

| Section | Time | Duration |
|---|---:|---:|
| Cold open | 00:00-00:04 | 4 s |
| Scenario 1 | 00:04-00:32 | 28 s |
| Transition | 00:32-00:33 | 1 s |
| Scenario 2 | 00:33-01:09 | 36 s |
| Transition | 01:09-01:10 | 1 s |
| Scenario 3 | 01:10-02:00 | 50 s |
| Trust end card | 02:00-02:06 | 6 s |

Total: **126 seconds**. Direct scenario playback holds on its final frame; autoplay continues through all three.

## Experience and visual direction

- Premium consumer AI commerce, not an admin dashboard.
- Chat is the spatial anchor; mandates, products, evidence and receipts unfold inside the conversation.
- Warm white canvas, near-black type, one restrained trust green and one risk red.
- Retail feels calm and fast; OLX feels investigative; eBay call feels focused and tense.
- At 1920x1080 every complete scenario fits without scrolling; essential text is at least 20 px in the recording composition.
- Real marketplace UI may appear only in cropped, dated source cards; the surrounding product UI must be original.

## Motion and sound

- Lay out each hero and end state before adding motion.
- Use deterministic timelines only; no random or clock-dependent behavior.
- Cards enter sequentially with short focus pulls, not excessive bouncing.
- Use transitions between scenes; do not animate scene exits independently before the transition.
- Audio: quiet typing, search ticks, one reject tone, one restrained confirmation tone, and the scripted call. No constant notification noise.
- Captions show one readable phrase group at a time and never cover decisions or price math.

## Recommended skills and plugins for implementation later

| Need | Recommended capability | Boundary |
|---|---|---|
| Visual system and anti-generic UI | `design-taste-frontend`, `frontend-skill` | Create `DESIGN.md` only after the team approves implementation. |
| Product images and clean cut-outs | `imagegen` | Supplement missing neutral assets; do not fabricate marketplace evidence. |
| Recorded composition, transitions, captions, TTS timing | `hyperframes:hyperframes`, `hyperframes:gsap`, `hyperframes:hyperframes-cli` | Optional post-production layer, not application architecture. Validate and inspect before rendering. |
| Seller-call voice | `speech` | Synthetic or prerecorded only; label the call simulated. |
| Browser capture and deterministic playback QA | `playwright` or browser tooling | Never contact a seller or trigger a real checkout. |
| Slides | `presentations:Presentations` | Use after the four-slide narrative is approved. |
| Hosting | Sites or Vercel tooling | Decide later; retain a local recorded fallback. |

## Recording rules

- Capture at 1920x1080, 30 fps minimum, with browser chrome hidden.
- Preload fonts, screenshots and audio; disable network-dependent behavior during playback.
- Keep source captures and a manifest with URL, access date and redaction status.
- Record each scenario separately plus the master autoplay cut.
- Hold every final state for at least three seconds and record a silent fallback cut.

See [Storyboard](DEMO_STORYBOARD.md), [Timelines](SCENARIO_TIMELINES.md), [Interaction spec](INTERACTION_SPEC.md), and [Claims and simulations](CLAIMS_AND_SIMULATIONS.md).
