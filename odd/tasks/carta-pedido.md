# Carta pedido adjustments

## Objective

Fit the facade sign inside its black board, clear the hero, move the order ticket to a top glass panel, add optional delivery, and correct drink bases and flavors.

## Why

The live page showed the sign overflowing its plaque, a crowded hero, a bottom ticket in the scroll zone, missing delivery, wrong drink bases, and an empty gold ring on the hours card.

## Decisions

- Keep the black plaque. The overflow was the board, not the idea.
- Remove the eyebrow and the tagline. The script line already names the place.
- The gold circle was an empty ornament. Remove it.
- Delivery is optional and costs $6.000.

## Progress

- T1 done
- T2 done
- T3 done
- T4 done

## Evidence

- RED: `node menu-logic.test.js` failed with `api.drinkBases is not a function` before the helper existed.
- GREEN: `node menu-logic.test.js` passed, including old hours cases.
- `node --check script.js` and `node --check menu-logic.js`: pass.
- Parent spot-check: sign `line-height: 1.05`, ticket fixed under the header, delivery 6000 outside product lines, gaseosas and Hit rows replaced, jarra rows choose a flavor.
- Browser screenshot not run.
- Commit: filled after the work-unit commit.

## Next

User reviews the sign board and the top ticket on Pages.
