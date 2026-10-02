# Mascota rail actor

## Objective

Replace the per-card sliding mascot with a rail-following actor: spring physics, pose crossfades, and light interaction with page elements. The menu stays the primary UI; the mascot is professional decoration.

## Problem

The current mascot visits every `.menu-card` in DOM order and lerps to that card’s right edge. On desktop (2–3 columns) it zigzags. Pose changes swap `img.src` (decode hitch). `cling.png` bakes in a pole; `reach` / `idle` are a different character than `hang` / `jump`.

## Why

A single right-side rail with Y-tracking reads as a character climbing the menu, not a cursor. Springs and crossfades read as craft without stealing attention from the carta.

## Scope

- `index.html` mascot markup + pose stack
- `styles.css` mascot positioning, pose crossfade, reduced-motion, no-JS hide
- `script.js` `initMascota` rewrite (rail, spring, zones, interactions, degraded modes)

## Constraints

- Menu viewing first: one rAF, stop when settled, pause on `document.hidden`, honor `prefers-reduced-motion` and save-data / low CPU.
- Do not add libraries, a test harness, a CMS, or atmosphere/tilt/filter redesign.
- Do not use `cling` / `reach` / `idle` as active poses until art matches `hang`/`jump`. Pose stack may include hang+jump now; other filenames are optional drop-ins with fallback to `hang`.
- Face stays toward the menu (left). No `scaleX` flip.
- Technical artifacts in English.

## Delivery

- Route: delegated (`gentle-ai-worker`), trigger: 2+ non-trivial files.
- Strategy: `ask-on-risk`. Forecast ~350–450 authored lines in one work unit (HTML/CSS/JS are one behavior).
- Tests: no runner in this static site; no meaningful RED. Verification = `node --check script.js` plus structural readback.
- Engram mirror: pending (provider unavailable).

## Tasks

### T1 — Rail actor (HTML/CSS/JS)

**Acceptance**

- Mascot X stays on the right rail of `.menu-section .section-inner` (content box). Y follows the focused **row** (cards grouped by `docTop` within ~40px), not each card in DOM order.
- Position via `transform: translate3d` only (`left:0; top:0`). Spring (stiffness/damping), dt clamped, look-ahead from scroll velocity. No linear-only lerp except simple mode.
- Hero: hang just below the header on the rail. Menu: climb rail. Featured `#plato-cayenne` in the focused row: brief perch on that card’s right edge, then return. Contact: perch on `.contacto-card` top-right. Never cover `.wa-float` or sit under the header.
- Desktop hover (`(hover: hover) and (pointer: fine)`): perch toward the hovered `.menu-card` with `hang` (or `reach` only if that img exists **and** is enabled — currently disabled).
- Click: jump impulse + `jump` pose ~420ms, then resume. No navigation / no auto-scroll.
- Filter click: duck behind `.menu-filters` (~280ms), rebuild anchors after layout, resume.
- Poses: stacked `<img>` + opacity crossfade (~160ms). Never change `src`. Active poses with current art: `hang`, `jump`. Unknown/missing pose → `hang`.
- Simple mode (`saveData` or `hardwareConcurrency <= 4`): one pose (`hang`), lerp Y only, rail X, no hover perch, no click impulse.
- Reduced motion: static on rail at first menu row, `hang`, no spring/pose animation; hide travel.
- `html:not(.js) .mascota { display: none; }`
- Clickable control (button) with Spanish `aria-label="Mascota de La Cayenne"`. Decorative images `alt=""`.
- Pause rAF when settled and when `document.hidden`; rebuild on resize/orientation/filter/visibility.

**Checks**

- `node --check script.js`
- Structural: no `img.src` / `setAttribute("src"` in mascot code; no `scaleX`; simple and reduced-motion paths present.

**Route:** delegated worker.

### T2 — Verify

**Acceptance:** T1 checks observed; mascot does not change menu markup/prices.

**Route:** parent + writer self-check.

## Progress

- T1 done (rail actor: HTML pose stack, CSS crossfade, JS spring/zones)
- T2 done (`node --check` pass; parent spot-check: no src-swap/scaleX; hide until `.is-ready`; simple mode `saveData` or `cores <= 2`)

## Evidence

- `node --check script.js`: pass (no output, exit 0) — writer + parent
- Structural: no `img.src` / `setAttribute("src"` / `scaleX` in mascot code; active poses hang+jump only
- Parent corrections: hide until first transform (`.is-ready`); simple threshold `cores <= 2` so typical devices keep springs; English comment
- Mirror: pending (Engram unavailable)
- Commit: `feat/mascota-rail` — `feat(mascota): rail actor with spring physics and pose crossfade`
- RDD: off (default) — no native review this candidate

## Next

Work-unit commit on `feat/mascota-rail`. Optional follow-up: drop-in matching pose art (cling/reach/sit/wave) and desktop layout polish.
