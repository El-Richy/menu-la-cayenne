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

var fs = require("node:fs");
var path = require("node:path");
var root = __dirname;
var stylesCss = fs.readFileSync(path.join(root, "styles.css"), "utf8");
var indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
var scriptJs = fs.readFileSync(path.join(root, "script.js"), "utf8");

function goldTextViolations(cssText) {
  var banned = [
    /var\(\s*--gold\s*\)/,
    /var\(\s*--gold-soft\s*\)/,
    /var\(\s*--gold-muted\s*\)/,
    /#c9a227/i,
    /#e4c56a/i,
    /#a07d1c/i
  ];
  var withoutComments = cssText.replace(/\/\*[\s\S]*?\*\//g, "");
  var customs = {};
  withoutComments.replace(/(^|[{;])\s*(--[A-Za-z0-9-]+)\s*:\s*([^;]+)/g, function (_, boundary, name, value) {
    customs[name] = value.trim();
    return boundary;
  });
  var violations = [];
  var re = /(?:^|[{;])\s*color\s*:\s*([^;!}]+)/g;
  var match;
  while ((match = re.exec(withoutComments))) {
    var value = match[1].trim();
    var resolved = value;
    var uses = value.match(/var\(\s*(--[A-Za-z0-9-]+)/g) || [];
    for (var i = 0; i < uses.length; i++) {
      var custom = uses[i].replace(/var\(\s*/, "");
      if (customs[custom]) resolved += " " + customs[custom];
    }
    for (var j = 0; j < banned.length; j++) {
      if (banned[j].test(value) || banned[j].test(resolved)) {
        violations.push(value);
        break;
      }
    }
  }
  return violations;
}

var goldViolations = goldTextViolations(stylesCss);
assert.deepEqual(goldViolations, [], "gold text color: " + goldViolations.join(" | "));

var orderTtl = 12 * 60 * 60 * 1000;
var savedAt = 1700000000000;
var order = {
  lines: [{ name: "Criolla", unit: 20000, qty: 1, kind: "burger" }],
  extras: [{ name: "Tocineta", unit: 4000, qty: 1, hostKey: null }],
  delivery: false,
  pickup: true
};
var packed = api.packOrder(order, savedAt);
var packedOrder = JSON.parse(packed);
assert.equal(packedOrder.savedAt, savedAt);
assert.equal(packedOrder.delivery, false);
assert.equal(packedOrder.pickup, true);
assert.equal(packedOrder.lines[0].kind, "burger");
assert.equal(packedOrder.extras[0].name, "Tocineta");

var stillValid = api.unpackOrder(packed, savedAt + orderTtl - 1);
assert.equal(stillValid.savedAt, savedAt);
assert.equal(stillValid.lines[0].name, "Criolla");
assert.equal(stillValid.pickup, true);
assert.equal(api.unpackOrder(packed, savedAt + orderTtl), null);
assert.equal(api.unpackOrder(JSON.stringify({ lines: [], extras: [], delivery: false, pickup: true }), savedAt), null);
assert.equal(api.unpackOrder({ lines: [], savedAt: "1700000000000" }, savedAt), null);
assert.equal(api.unpackOrder({ lines: [], savedAt: null }, savedAt), null);
assert.equal(api.unpackOrder({ lines: [], savedAt: true }, savedAt), null);

assert.equal(indexHtml.indexOf("fonts.googleapis.com"), -1);
assert.equal(indexHtml.indexOf("fonts.gstatic.com"), -1);
assert.match(stylesCss, /--font-body:\s*system-ui,\s*sans-serif\s*;/);
assert.equal(stylesCss.indexOf("Inter"), -1);
assert.equal(scriptJs.indexOf("sessionStorage"), -1);
assert.ok(scriptJs.indexOf("lacayenne-order-v3") !== -1);
assert.ok(scriptJs.indexOf("packOrder") !== -1);
assert.ok(scriptJs.indexOf("unpackOrder") !== -1);
assert.ok(scriptJs.indexOf("localStorage.removeItem") !== -1);

var faceBlocks = stylesCss.match(/@font-face\s*\{[^}]+\}/g) || [];
assert.equal(faceBlocks.length, 6);
faceBlocks.forEach(function (block) {
  assert.match(block, /font-display:\s*swap/);
  assert.match(block, /url\(\s*["']assets\/fonts\/[^"')]+\.woff2["']\s*\)/);
  assert.match(block, /unicode-range:[^;]*U\+0000-00FF/);
  assert.equal(/https?:|fonts\.gstatic|fonts\.googleapis/.test(block), false);
});
["anton-400.woff2", "great-vibes-400.woff2", "cormorant-garamond-600.woff2"].forEach(function (file) {
  var tags = indexHtml.match(/<link\b[^>]*>/g) || [];
  var preloaded = tags.some(function (tag) {
    return /rel="preload"/.test(tag) && /as="font"/.test(tag) && tag.indexOf("assets/fonts/" + file) !== -1;
  });
  assert.equal(preloaded, true, file);
  var fontPath = path.join(root, "assets", "fonts", file);
  var bytes = fs.readFileSync(fontPath);
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "wOF2");
});
["cormorant-garamond-500.woff2", "cormorant-garamond-700.woff2", "cormorant-garamond-500-italic.woff2"].forEach(function (file) {
  var bytes = fs.readFileSync(path.join(root, "assets", "fonts", file));
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "wOF2");
});

console.log("menu-logic tests passed");
