# Menu without mascot

## Objective

Remove the mascot and leave a menu-only page that is lighter, safer, and a little more distinctive, without changing the carta.

## Problem

The pet does not read cleanly (background not erased) and its rail actor, pose images, and animation loop compete with the menu.

## Why

The user asked to delete the mascot, keep only the menu, review performance, motion, and security, and make the page feel finished and unlike a generic template.

## Scope

- `index.html` mascot markup, preloads, CSP, hero preload
- `script.js` mascot IIFE and the filter hook; tilt scheduling
- `styles.css` mascot rules and small carta details
- Mascot image files under `assets/`

## Constraints

- Do not change menu copy, prices, hours, phone, or outbound links.
- Do not remove hero, filters, contact, footer, WhatsApp button, or atmosphere.
- No new libraries. No push or pull request.
- Technical artifacts in English.
- No test runner: visual/static page, so no meaningful RED. Verify with `node --check` and structural checks.

## Delivery

- Route: delegated (`gentle-ai-worker`), trigger: 3 non-trivial files. Parent corrected two spots after the writer returned.
- One work unit.
- Engram mirror: pending (Engram binary predates v2).
- RDD: off (default). No review started.

## Tasks

### T1 — Remove the mascot

**Acceptance**

- No mascot markup, preload, CSS, or JS remains.
- Pose PNGs and `assets/mascota-poses-nuevas/` are deleted.
- Filters, nav, tilt, atmosphere, year, and stagger still run.
- `html:not(.js)` stagger fallback stays. The head class script stays.

### T2 — Performance, security, carta details

**Acceptance**

- Hero webp preloaded; script deferred.
- Tilt pointer moves are coalesced to one frame.
- Stagger lines do not keep `will-change` after they are shown.
- CSP meta allows self, the hashed inline class script, Google Fonts, and inline style assignments. No `frame-ancestors` in the meta policy.
- Carta leaders between dish and price, a static cayenne bloom on the hero title.
- Paper grain stays the existing menu/contact layer only. A second full-screen grain was removed so two turbulence filters do not stack.
- Reduced-motion and no-JS paths still show the menu.

### T3 — Verify

**Acceptance:** `node --check script.js` passes; `mascota` is gone from html/css/js; menu copy unchanged; CSP hash matches the inline class script.

## Progress

- T1 done
- T2 done
- T3 done

## Evidence

- `node --check script.js`: pass
- `mascota` absent from `index.html`, `script.js`, `styles.css`
- Inline script bytes still `document.documentElement.classList.add("js");`; CSP hash `sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk=` matches
- Prices `$14.000` / `$20.000` and names `Criolla` / `Opita` unchanged
- Deleted tracked pose PNGs (~1.7 MB) and untracked `assets/mascota-poses-nuevas/` (~2 MB)
- Parent correction: dropped duplicate `body::before` grain; moved CSP meta above the inline class script
- Commit: filled after the work-unit commit

## Next

Push or PR only if the user asks. Larger distinctive ideas stay proposals.
