# Mejoras de carta con función real

Objective: corregir contraste, fuentes y persistencia del pedido, y después rendimiento, comanda, notas, estado y QR, sin carta imprimible.
Branch: feat/mejoras-carta. Delivery: work-unit commits on this branch; push and PR stay with the user.
Tests: `node menu-logic.test.js`

## Specs

S1. Contraste: el oro #c9a227 sobre crema #f6edd9 da cerca de 2,1:1, por debajo incluso del mínimo para texto grande (3:1). Úsalo solo como adorno (líneas, bordes) y pon el texto en tinta o cayena (≈4,8:1, pasa).
Check: no `color` declaration in `styles.css` uses `--gold`, `--gold-soft`, `--gold-muted`, `#c9a227`, `#e4c56a` or `#a07d1c`. Gold may remain on borders, lines and fills whose text is ink or cayenne. On navy, cayenne fails contrast, so text that cannot be ink or cayenne uses cream. Assumption: the hero marquee colors `#ff2a24` and `#f0d78a` are not the cited gold-on-cream pair and stay.

S2. Fuentes: aloja los woff2 tú mismo en subset latino, con font-display: swap y preload de las críticas. Así se cierra la CSP del todo y no envías la IP del cliente a Google. Cuatro familias son demasiadas, así que cambia Inter por system-ui.
Check: `index.html` and CSP contain neither `fonts.googleapis.com` nor `fonts.gstatic.com`. `--font-body` is `system-ui`. Every `@font-face` is a local latin woff2 with `font-display: swap`. Critical faces are preloaded.

S3. Pedido: pásalo de sessionStorage a localStorage con marca de tiempo y caducidad de unas 12 h.
Check: `menu-logic` stamps `savedAt` and rejects a payload at exactly 12 h. `script.js` reads and writes `localStorage` only. A payload without `savedAt` is not restored.

S4. Halos: anima solo transform y opacity sobre capas propias, nunca background-position ni filter. Si en un móvil de gama baja baja de 60 fps, déjalos estáticos allí.
Check: the glow animation does not animate `background-position` or `filter`. A frame probe below 60 fps adds a static class.

S5. Grano: si es un SVG con feTurbulence, repinta caro. Cámbialo por un PNG o WebP tileable de pocos KB.
Check: no `feTurbulence` in `styles.css`. The grain is a local tile image of a few KB.

S6. Imágenes: width y height explícitos, srcset en el héroe, loading="lazy" en los platos.
Check: the hero `img` keeps explicit width and height and gains a width-descriptor `srcset`. Assumption: the repo has no dish photographs, so no fake dish photos are added; `loading="lazy"` applies only if a dish `img` exists.

S7. Medición: Lighthouse en móvil con throttling antes y después. Sin números no sabrás qué mejoró.
Check: mobile throttled Lighthouse performance numbers are recorded before the performance edits and after them. If the runner is unavailable, the log says so and does not invent scores.

S8. Ticket estilo comanda: papel térmico, monoespaciada, borde dentado, que se "imprime" al agregar ítems. Ya lo generas con JS, así que solo falta darle identidad.
Check: the order ticket reads as thermal paper (monospace, jagged edge) and plays a print motion when an item is added, unless reduced motion is set.

S9. Notas por plato (sin cebolla, punto de la carne) y total en COP con Intl.NumberFormat dentro del mensaje de WhatsApp.
Check: a line note is included in `buildMessage`, and the total uses `Intl.NumberFormat` with currency `COP`. Empty notes do not add a blank line. Existing greeting links stay greetings.

S10. Estado inteligente: "abre en 2 h 15 min" en lugar de solo "cerrado".
Check: Monday 13:15, which opens at 15:30, labels `Abre en 2 h 15 min`. Open hours still say `Abierto ahora`. The detail clock lines stay.

S11. Carta imprimible y QR para mesas: una hoja de estilos @media print y un QR. User correction: Lo de la carta imprimible no lo hagas, solo lo del QR.
Check: no new `@media print` menu stylesheet. A local QR image points at `https://el-richy.github.io/menu-la-cayenne/` and is shown for tables. Assumption: one QR to the canonical menu URL, placed in the contact card.

S12. Qué recortaría: la inclinación de las tarjetas con mouse es un gimmick. El móvil, que es donde pedirán, ni la ve.
Check: no tilt wrapper, tilt listeners, or tilt custom properties remain.

## Tasks

- T1 S1 inline pending — gold text becomes ink, cayenne, or cream on navy
- T2 S2 inline pending — self-host latin woff2, drop Inter, close CSP
- T3 S3 inline pending — localStorage order with 12 h expiry
- T4 S7 inline pending — Lighthouse mobile throttled, before
- T5 S4 S5 S6 inline pending — halos, grain tile, hero srcset
- T6 S12 inline pending — remove mouse card tilt
- T7 S8 inline pending — thermal ticket identity
- T8 S9 inline pending — dish notes and COP total in WhatsApp
- T9 S10 inline pending — countdown instead of bare closed
- T10 S11 inline pending — table QR only, no printable menu
- T11 S7 inline pending — Lighthouse mobile throttled, after

## Log

L1. Hagamos unos cambios, me dijeron esto:  Diferenciarte no es añadir más efectos. Ya tienes bastante decoración, y más sube el coste en móviles baratos. Lo que distingue a una página de restaurante es que resuelva algo mejor que las demás.
1. Correcciones (antes de embellecer)
Contraste: el oro #c9a227 sobre crema #f6edd9 da cerca de 2,1:1, por debajo incluso del mínimo para texto grande (3:1). Úsalo solo como adorno (líneas, bordes) y pon el texto en tinta o cayena (≈4,8:1, pasa).
Fuentes: aloja los woff2 tú mismo en subset latino, con font-display: swap y preload de las críticas. Así se cierra la CSP del todo y no envías la IP del cliente a Google. Cuatro familias son demasiadas, así que cambia Inter por system-ui.
Pedido: pásalo de sessionStorage a localStorage con marca de tiempo y caducidad de unas 12 h.
2. Rendimiento
Halos: anima solo transform y opacity sobre capas propias, nunca background-position ni filter. Si en un móvil de gama baja baja de 60 fps, déjalos estáticos allí.
Grano: si es un SVG con feTurbulence, repinta caro. Cámbialo por un PNG o WebP tileable de pocos KB.
Imágenes: width y height explícitos, srcset en el héroe, loading="lazy" en los platos.
Medición: Lighthouse en móvil con throttling antes y después. Sin números no sabrás qué mejoró.
3. Diferenciadores con función real
Ticket estilo comanda: papel térmico, monoespaciada, borde dentado, que se "imprime" al agregar ítems. Ya lo generas con JS, así que solo falta darle identidad.
Notas por plato (sin cebolla, punto de la carne) y total en COP con Intl.NumberFormat dentro del mensaje de WhatsApp.
Estado inteligente: "abre en 2 h 15 min" en lugar de solo "cerrado".
Carta imprimible y QR para mesas: una hoja de estilos @media print y un QR. Es el único punto que une lo físico con lo digital, y probablemente el que más valor da al negocio.
Qué recortaría: la inclinación de las tarjetas con mouse es un gimmick. El móvil, que es donde pedirán, ni la ve.
Orden sugerido: (1) contraste, fuentes locales y localStorage; (2) medir; (3) ticket comanda; (4) QR e impresión si el dueño lo quiere.. Lo de la carta imprimible no lo hagas, solo lo del QR

L2. 2026-10-20. Assumption: one table QR encodes https://el-richy.github.io/menu-la-cayenne/ and sits in the contact card. No print stylesheet. Dish cards have no photographs, so S6 does not invent them. On navy, text that cannot be ink or cayenne uses cream because cayenne on #152038 is about 2.9:1.
