"use strict";

var assert = require("node:assert/strict");
var api = require("./menu-logic.js");

function status(weekday, hhmm) {
  var parts = hhmm.split(":");
  return api.statusFromParts({
    weekday: weekday,
    minutes: Number(parts[0]) * 60 + Number(parts[1])
  });
}

assert.deepEqual(status("Mon", "16:00"), {
  state: "open",
  label: "Abierto ahora",
  detail: "Hasta las 10:00 p.m."
});

assert.deepEqual(status("Fri", "17:00"), {
  state: "open",
  label: "Abierto ahora",
  detail: "Hasta las 11:00 p.m."
});

assert.deepEqual(status("Mon", "12:00"), {
  state: "closed",
  label: "Cerrado",
  detail: "Abrimos hoy a las 3:30 p.m."
});

assert.deepEqual(status("Fri", "16:00"), {
  state: "closed",
  label: "Cerrado",
  detail: "Abrimos hoy a las 4:30 p.m."
});

assert.deepEqual(status("Wed", "18:00"), {
  state: "closed",
  label: "Hoy cerrado",
  detail: "Abrimos mañana a las 3:30 p.m."
});

assert.deepEqual(status("Tue", "22:30"), {
  state: "closed",
  label: "Cerrado",
  detail: "Abrimos el jueves a las 3:30 p.m."
});

assert.deepEqual(status("Sun", "23:00"), {
  state: "closed",
  label: "Cerrado",
  detail: "Abrimos mañana a las 3:30 p.m."
});

assert.deepEqual(status("Mon", "22:00"), {
  state: "closed",
  label: "Cerrado",
  detail: "Abrimos mañana a las 3:30 p.m."
});

assert.deepEqual(api.statusAt(new Date("2026-01-07T23:00:00Z")), {
  state: "closed",
  label: "Hoy cerrado",
  detail: "Abrimos mañana a las 3:30 p.m."
});

assert.equal(api.parsePrice("$14.000"), 14000);
assert.equal(api.parsePrice("Baño de queso $7.000"), 7000);
assert.equal(api.formatMoney(14000), "$14.000");
assert.equal(api.formatMoney(7000), "$7.000");
assert.equal(api.formatMoney(api.parsePrice("$20.000")), "$20.000");

assert.equal(
  api.buildMessage([
    { name: "Criolla", unit: 20000, qty: 2 },
    { name: "Papa francesa", unit: 7000, qty: 1 }
  ]),
  "Hola, quiero pedir:\n\n2 × Criolla — $40.000\n1 × Papa francesa — $7.000\n\nTotal: $47.000"
);

var whatsAppGreeting = "Hola, quiero hacer un pedido";
var whatsAppGreetingHref = "https://wa.me/573184003076?text=" + encodeURIComponent(whatsAppGreeting);

assert.equal(api.whatsAppHref(""), whatsAppGreetingHref);
assert.equal(api.whatsAppHref(null), whatsAppGreetingHref);
assert.equal(api.whatsAppHref("   "), whatsAppGreetingHref);
assert.equal(api.whatsAppHref("\n\t "), whatsAppGreetingHref);

var orderMessage = api.buildMessage([
  { name: "Criolla", unit: 20000, qty: 1 }
]);
assert.equal(
  api.whatsAppHref(orderMessage),
  "https://wa.me/573184003076?text=" + encodeURIComponent(orderMessage)
);
assert.equal(
  api.whatsAppHref(orderMessage).indexOf(encodeURIComponent(whatsAppGreeting)),
  -1
);
assert.equal(
  api.whatsAppHref("  Hola, pedido  "),
  "https://wa.me/573184003076?text=" + encodeURIComponent("  Hola, pedido  ")
);

assert.equal(api.nextQty(0, -1), 0);
assert.equal(api.nextQty(12, 1), 12);
assert.equal(api.nextQty(3, 2), 5);
assert.equal(api.nextQty(11, 5), 12);

assert.deepEqual(api.drinkBases("limonada natural"), ["agua"]);
assert.deepEqual(api.drinkBases("Limonada de panela"), ["agua"]);
assert.deepEqual(api.drinkBases("Limónada natural"), ["agua"]);
assert.deepEqual(api.drinkBases("Cerezada"), ["agua"]);
assert.deepEqual(api.drinkBases("HIERBABUENA"), ["agua"]);
assert.deepEqual(api.drinkBases("  hierbabuena  "), ["agua"]);
assert.deepEqual(api.drinkBases("coco"), ["leche"]);
assert.deepEqual(api.drinkBases("Coco"), ["leche"]);
assert.deepEqual(api.drinkBases("frutos rojos"), ["agua", "leche"]);
assert.deepEqual(api.drinkBases("Frutos Rojos"), ["agua", "leche"]);
assert.deepEqual(api.drinkBases("Mango"), ["agua", "leche"]);
assert.deepEqual(api.drinkBases("Guanábana"), ["agua", "leche"]);
assert.deepEqual(api.drinkBases("Maracuyá"), ["agua", "leche"]);
assert.deepEqual(api.drinkBases("Fresa"), ["agua", "leche"]);

console.log("menu-logic tests passed");
