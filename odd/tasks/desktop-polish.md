# Desktop layout polish

## Objective

Polish the wide layout so the carta reads as a finished desktop page, without weakening the mobile menu. Stack on `feat/mascota-rail` so one branch holds mascot + desktop.

## Problem

The page is mobile-first and it shows: filter carousel, cramped 3-column cards, dark hero, tilt on every card, uneven drink columns, contact split 50/50.

## Why

The user asked to polish desktop while Imagine produces matching mascot poses. Menu viewing stays primary.

## Scope

- `styles.css` desktop layout (hero, filters, grid, drinks, contact, page width)
- `script.js` tilt: only featured / más vendida / contact card; lower angle

## Constraints

- Do not change menu copy, prices, or mascot physics.
- Do not break ≤720px layout (existing max-width queries remain source of truth for mobile).
- No new libraries. No GitHub push/PR in this task.
- Technical artifacts in English.

## Delivery

- Route: delegated (`gentle-ai-worker`), trigger: 2 non-trivial files.
- Strategy: `ask-on-risk`. Forecast ~80–140 authored lines, one work unit.
- Tests: no runner; verify with `node --check script.js` and structural CSS readback.
- Engram mirror: pending.

## Tasks

### T1 — Desktop layout + restrained tilt

**Acceptance**

- Page max width via `--page-max: 1220px` on `.header-inner`, `.section-inner`, `.footer-inner` (replace 1140px).
- Hero from `min-width: 721px`: overlay slightly lighter (keep text readable), `hero-img` brightness ~0.92, a bit more top padding so the title sits higher than dead-center.
- Filters from `min-width: 721px`: `width: max-content; margin-inline: auto; justify-content: center; overflow: visible;` so it is a centered pill, not a horizontal scroller. Mobile 720 query keeps overflow scroll.
- Menu grid: `minmax(320px, 1fr)` at base; from `721px` to `1100px` force 2 columns; from `1101px` force 3 equal columns. Mobile 720 stays 1 column.
- Drink board: equal `1fr 1fr` at base. From `861px`: jugos (first `.drink-group`) spans full width; the other three sit in one 3-column row. Existing `max-width: 860px` 1-column rule stays.
- Contact from `861px`: `grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr); align-items: start`. Ticket card (or its `.t-tilt` wrapper) `position: sticky; top: calc(var(--header-h) + 24px)`.
- Tilt JS: only `.menu-card.featured`, `.menu-card:has(.badge-sold)`, `.contacto-card`. `MAX` 6 instead of 12. Touch/reduced-motion paths unchanged.
- Mascot width `72px` from `min-width: 721px` (mobile 56/48 unchanged).

**Checks**

- `node --check script.js`
- Mobile `@media (max-width: 720px)` and `860px` still force single column / stacked contact.
- Tilt query no longer selects every `.menu-card`.

**Route:** delegated worker.

### T2 — Verify

**Acceptance:** T1 checks observed; no mascot/menu-copy edits.

## Progress

- T1 done
- T2 done (`node --check` pass; tilt selector + desktop queries spot-checked)

## Evidence

- `node --check script.js`: pass (writer + parent)
- Tilt: `.menu-card.featured, .menu-card:has(.badge-sold), .contacto-card`; MAX 6; initMascota untouched
- CSS: `--page-max` 1220px; min-width 721/861/1101 queries; 720/860 mobile rules kept
- Mirror: pending (Engram unavailable)
- Commit: `feat/mascota-rail` — desktop polish work unit
- RDD: off (default)

## Next

Push/PR only if the user authorizes. Optional: drop-in mascot poses.
