# WhatsApp order links

## Objective

Every WhatsApp link sends the assembled order when the cart has items, and the fixed greeting otherwise. Collapsing the ticket must not hide the only control that sends that order.

## Decisions

- One href helper. Empty or missing message uses `Hola, quiero hacer un pedido`.
- Only the ticket link sends the assembled order. Nav, hero, phone, contact, and float always send the greeting.
- HTML empty links get the greeting as the no-JS fallback.
- Collapsing the ticket hides the order button again, so the menu stays visible. The float stays hidden while an order is open.
- Do not touch catalog binding, extras, canvas, hours, or other audit debt.

## Tasks

- [x] T1 Share one WhatsApp href and point every `wa.me` anchor at it
- [x] T2 Keep the ticket order button visible while the ticket is collapsed

## Progress

- T1 done
- T2 done

## Evidence

- RED: `node menu-logic.test.js` failed with `api.whatsAppHref is not a function` before the helper existed.
- GREEN: `node menu-logic.test.js` passed, including the previous hours and message cases. `node --check menu-logic.js` and `node --check script.js` exited 0.
- Empty cart does not call `buildMessage([])`. Open cart reuses line titles, extras, delivery, and the pickup suffix.
- Collapsed ticket no longer sets `.order-ticket-wa` to `display: none`. No layout test runner; check is structural.
- Browser not run.
- T1 commit: `90128c7` on `fix/whatsapp-order-cta`.
- T2 commit: `b99e7a6` on `fix/whatsapp-order-cta`.
- Correction: only the ticket sends the order. Other links keep the shorter greeting. The collapsed ticket hides the order button again.

## Next

User reviews the branch. Push and PR remain their decision.
