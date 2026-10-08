# Carta viva

## Objective

Fix the dish leaders, then make the menu feel alive: a Bogotá open/closed status, a WhatsApp order ticket built from the carta, and scroll motion that is material rather than a filter slide.

## Problem

The dotted rule cut through the dish names. The page also read as a static list once the hero was gone.

## Why

The user showed the misplaced rule and asked to start the WhatsApp order and the live hours, plus motion and transparency.

## Scope

- `styles.css` leader alignment and motion
- `index.html` status slot and logic script
- `script.js` wiring only
- `menu-logic.js` and `menu-logic.test.js`

## Constraints

- Dish copy, prices, printed hours, phone, and existing WhatsApp links stay.
- No new libraries. No innerHTML. No push.
- UI copy in Spanish. Code and tests in English.
- Hours are America/Bogota. Wednesday is closed.

## Delivery

- Route: delegated writer, then two parent corrections (leader offset, jugo names).
- RDD off. Engram mirror pending.

## Tasks

### T1 — Seat the leaders on the baseline

Flex baseline, rule translated `0.28em` below the baseline so it clears the letter feet.

### T2 — Open now

`statusAt` / `statusFromParts` tested for Wednesday, before open, open, exact close, and Tuesday night.

### T3 — WhatsApp ticket

Quantities from the carta, sessionStorage, encoded `wa.me` message. Float hides while the ticket is open.

### T4 — Scroll material

Hero shift, category rules, and card settle only under `html.motion`. No-JS and reduced motion keep the menu visible.

## Progress

- T1 done
- T2 done
- T3 done
- T4 done

## Evidence

- RED: `node menu-logic.test.js` failed with MODULE_NOT_FOUND before `menu-logic.js` existed (writer).
- GREEN: `node menu-logic.test.js` passed (writer and parent).
- `node --check script.js` and `node --check menu-logic.js`: pass.
- No `innerHTML`. No `mascota`. Prices and names unchanged.
- Parent: leader `translateY(0.28em)`; limonadas in the jugo list are not prefixed with "Jugo de".
- Browser screenshot not run (Firefox headless could not write a capture).
- Commit: filled after the work-unit commit.

## Next

User looks at the leaders and the ticket in a browser. Push only if asked.
