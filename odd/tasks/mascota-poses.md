# Wire new mascot pose set

## Objective

Replace the old hang/jump art with the 3D pose set and map poses to zones. Then merge `feat/mascota-rail` to `main` and push for GitHub Pages.

## Scope

- Copy six 512px poses into `assets/` (hang, jump, cling, reach, sit, wave)
- Delete previous art (`mascota.png` already gone; old hang/jump overwritten)
- Do not ship `mascota-poses-nuevas/` or unused `cling-alt`
- HTML pose stack + preloads; CSS 1:1 aspect; JS zone → pose
- Push `main` after the work-unit commit (user-authorized)

## Constraints

- Do not change rail/spring physics, menu copy, or desktop layout beyond mascot markup/CSS aspect
- Simple mode and reduced-motion stay on `hang` only
- Technical artifacts in English

## Tasks

### T1 — Copy art and wire poses

**Acceptance**

- `assets/mascota-{hang,jump,cling,reach,sit,wave}.png` are the 512×512 set
- HTML stack includes those six; preload only hang + jump
- Zone map: hero hang; climb hang / cling (mid frac) / jump (fast); hover reach; featured sit; contact sit; duck cling; boop wave
- Click uses wave (impulse kept)
- CSS `.mascota-poses` aspect-ratio `1 / 1`

**Checks:** `node --check script.js`; no `cling-alt` or old idle `mascota.png` in `assets/` root

### T2 — Merge to main and push

**Acceptance:** `origin/main` contains this work (user asked for Pages)

## Progress

- T1 done (wire poses; art already in `assets/`)
- T2 pending (parent-owned merge/push)

## Evidence

- HTML stack: hang, jump, cling, reach, sit, wave (512)
- Preload: hang + jump only
- Zone map wired in `initMascota` `updateTargets` + click wave
- Check: `node --check script.js`
- Commit: pending
- RDD: off
