# Scenario timelines

Status: **presentation-ready deterministic playback**. The UI is English. Authentic Polish text may remain inside frozen merchant screenshots.

All three scenarios begin with the same transition: the home composer expands, the request is typed character by character, the request is acknowledged, and the relevant workspace opens. Visual components render state only; `src/lib/demo/scenario-data.ts` owns the stages and `useScenarioOrchestrator` owns the clock.

## Scenario 1 — retail true cost

Approximate runtime: 20 seconds.

1. Type the adidas Samba OG EU43 request.
2. Reveal the mandate one rule at a time.
3. Search adidas, eobuwie, Zalando, Sizeer, Footshop, JD Sports, PRM and Farfetch.
4. Narrow eight sources to four viable results and two finalists.
5. Expand only the frozen adidas and eobuwie captures.
6. Validate `SUMMER30` as deterministic demo data, clearly outside the source capture.
7. Calculate PLN 277.73 and select adidas.
8. Hold the protected-handoff frame.

## Scenario 2 — private listing

Approximate runtime: 19 seconds.

1. Type the Nintendo Switch OLED request.
2. Reveal the frozen OLX search capture.
3. Detect missing screen, serial-number and accessory evidence.
4. Type the English seller question.
5. Reveal the fictional reply and simulated evidence sequentially.
6. Offer PLN 880, receive PLN 930, accept PLN 930.
7. Complete the ledger and prepare a protected PLN 930 checkout.
8. Hold the verified-deal frame. No message or payment is real.

## Scenario 3 — protected seller call

1. Type the Fujifilm request.
2. Reveal the frozen eBay source and transaction mandate.
3. Show a fictional seller requesting a call.
4. Pause indefinitely at `Start protected call`.
5. After the click, the transcript, waveform and risk ledger use the same clock.
6. Reveal off-platform payment, direct transfer and personal-data risks.
7. Reject the listing and hold the final trust frame.

The final German AI-to-AI dialogue and its duration are **pending team-supplied audio**. Current transcript entries are structural timing fixtures, not final call copy.

## Global controls

- `1`, `2`, `3`: start only from home.
- `R` or `Escape`: cancel playback and return home immediately.
- `Space`: pause or resume an active scenario.
- Final frames hold until reset.

The controls are intentionally absent from the public UI.
