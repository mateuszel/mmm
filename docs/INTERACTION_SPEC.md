# Interaction specification

**Status: Provisional.** This describes playback behavior, not a framework.

## Controls

| Input | Result |
|---|---|
| `1` | Reset and play Scenario 1 from frame zero. |
| `2` | Reset and play Scenario 2 from frame zero. |
| `3` | Reset and play Scenario 3 from frame zero. |
| `A` | Reset and play the 126-second master sequence. |
| `Escape` | Stop audio/timers and return to the neutral state. |
| Click `Allow agent to call` | The only required pointer action; resumes Scenario 3. |

Keyboard handlers must ignore repeats and text-entry focus. Starting another scenario cancels every pending timer, audio cue and animation before resetting state.

## Playback states

`idle → typing → mandate → search/evidence → decision → final`

Scenario 3 adds `awaiting_call_approval → calling → risk_decision`. Playback cannot advance from the approval state without the visible click. Autoplay may display a pre-scripted cursor/click only in the rendered loop; presenter mode requires the real click.

## Layout at 1920x1080

- 96 px safe margin around the recording canvas.
- Chat occupies the primary two-thirds; a narrow mandate/status rail remains visible.
- Rich cards never require scrolling and no more than three source cards remain expanded at once.
- Receipts replace transient analysis rather than stacking below it.
- The call is a focused overlay with transcript, Polish translation, fixed waveform, timer and `Simulated seller verification call` label.

## Loading, empty and error states

- Loading: short explicit verb, e.g. `Comparing final costs…`; never an indefinite spinner.
- Empty: `No offer satisfies every mandate rule. Search continues.`
- Playback asset error: show the preloaded text-only fallback and preserve price math.
- Audio error: continue with captions and a visible `Audio fallback` badge.
- Reset: restores all deterministic fixtures, current scene, approvals, receipts and timers.

## Accessibility and recording

- Buttons have explicit labels and visible focus states.
- Status is conveyed with text/icon, not color alone.
- Captions remain on screen long enough to read and do not overlap controls.
- Reduced-motion mode uses opacity/cut transitions while preserving exact timing.
- No live network, seller contact or checkout is allowed during playback.

See [Scenario timelines](SCENARIO_TIMELINES.md) and [Claims](CLAIMS_AND_SIMULATIONS.md).
