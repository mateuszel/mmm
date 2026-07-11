# Animation system

The demo uses a single deterministic clock and restrained GSAP presentation motion.

## Ownership

- `src/lib/demo/scenario-data.ts`: scenario copy, stages, assets, final states and future optional `priceHistory`.
- `src/hooks/useScenarioOrchestrator.ts`: time, pause, approval gate, reset, cancellation and future audio control.
- `CinematicDemo.tsx`: state rendering only.
- `cinematic.css`: layout, source-row transitions, waveform and micro-motion.

No visual component starts independent timers. One `requestAnimationFrame` loop advances playback. GSAP animates entry opacity and position but does not own business state.

## Motion language

- Request text types from the shared home-to-workspace launch surface.
- Mandate rows and evidence arrive in short staggered groups.
- Retail sources progress through searching, resolved and narrowed states.
- Frozen captures expand only after finalist selection.
- Calculations reveal top-to-bottom with tabular numbers.
- Risk rows escalate progressively and collapse into a final decision.

Motion is limited to opacity, transform, progress width and small waveform scaling. `prefers-reduced-motion` disables decorative motion.

## Cancellation contract

`R` and `Escape` cancel the animation frame, reset elapsed time, clear approval, stop and rewind future audio, increment the session key and restore the home cursor. Refresh never persists playback state.

## Pending call-audio handoff

The orchestrator has one audio boundary at the Scenario 3 approval click. Final German files must be local, fictional voices, and accompanied by timestamped transcript data. Audio should not be added to critical preload until the final files are supplied and verified.
