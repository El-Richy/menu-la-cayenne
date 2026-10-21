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

assert.deepEqual(status("Mon", "13:15"), {
  state: "closed",
  label: "Abre en 2 h 15 min",
  detail: "Abrimos hoy a las 3:30 p.m."
});

assert.deepEqual(status("Mon", "12:00"), {
  state: "closed",
  label: "Abre en 3 h 30 min",
  detail: "Abrimos hoy a las 3:30 p.m."
});

assert.deepEqual(status("Fri", "16:00"), {
  state: "closed",
  label: "Abre en 30 min",
  detail: "Abrimos hoy a las 4:30 p.m."
});

assert.deepEqual(status("Wed", "18:00"), {
  state: "closed",
  label: "Abre en 21 h 30 min",
  detail: "Abrimos mañana a las 3:30 p.m."
});

assert.deepEqual(status("Tue", "22:30"), {
  state: "closed",
  label: "Abre en 41 h",
  detail: "Abrimos el jueves a las 3:30 p.m."
});

assert.deepEqual(status("Sun", "23:00"), {
  state: "closed",
  label: "Abre en 16 h 30 min",
  detail: "Abrimos mañana a las 3:30 p.m."
});

assert.deepEqual(status("Mon", "22:00"), {
  state: "closed",
  label: "Abre en 17 h 30 min",
  detail: "Abrimos mañana a las 3:30 p.m."
});

assert.deepEqual(api.statusAt(new Date("2026-01-07T23:00:00Z")), {
  state: "closed",
  label: "Abre en 21 h 30 min",
  detail: "Abrimos mañana a las 3:30 p.m."
});

assert.equal(api.parsePrice("$14.000"), 14000);
assert.equal(api.parsePrice("Baño de queso $7.000"), 7000);
assert.equal(api.formatMoney(14000), "$14.000");
assert.equal(api.formatMoney(7000), "$7.000");
assert.equal(api.formatMoney(api.parsePrice("$20.000")), "$20.000");

function cop(amount) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(amount);
}

assert.equal(
  api.buildMessage([
    { name: "Criolla", unit: 20000, qty: 2 },
    { name: "Papa francesa", unit: 7000, qty: 1 }
  ]),
  "Hola, quiero pedir:\n\n2 × Criolla — $40.000\n1 × Papa francesa — $7.000\n\nTotal: " + cop(47000)
);

assert.equal(
  api.buildMessage([
    { name: "Criolla", unit: 20000, qty: 2, note: "sin cebolla" },
    { name: "Papa francesa", unit: 7000, qty: 1 }
  ]),
  "Hola, quiero pedir:\n\n2 × Criolla — $40.000\n  sin cebolla\n1 × Papa francesa — $7.000\n\nTotal: " + cop(47000)
);
assert.equal(
  api.buildMessage([{ name: "Criolla", unit: 20000, qty: 1, note: "punto de la carne" }]),
  "Hola, quiero pedir:\n\n1 × Criolla — $20.000\n  punto de la carne\n\nTotal: " + cop(20000)
);
assert.equal(
  api.buildMessage([
    { name: "Criolla", unit: 20000, qty: 1, note: "   " },
    { name: "Papa francesa", unit: 7000, qty: 1, note: "" }
  ]),
  "Hola, quiero pedir:\n\n1 × Criolla — $20.000\n1 × Papa francesa — $7.000\n\nTotal: " + cop(27000)
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

assert.equal(stylesCss.indexOf("feTurbulence"), -1);
assert.match(stylesCss, /url\(\s*["']assets\/grain\.webp["']\s*\)/);
var grainBytes = fs.readFileSync(path.join(root, "assets", "grain.webp"));
assert.equal(grainBytes.subarray(0, 4).toString("ascii"), "RIFF");
assert.equal(grainBytes.subarray(8, 12).toString("ascii"), "WEBP");
assert.ok(grainBytes.length > 0 && grainBytes.length < 8 * 1024, "grain.webp is " + grainBytes.length + " bytes");

function cssKeyframeBlocks(cssText) {
  var blocks = [];
  var re = /@keyframes\s+([A-Za-z0-9_-]+)\s*\{/g;
  var match;
  while ((match = re.exec(cssText))) {
    var end = re.lastIndex - 1;
    var depth = 0;
    for (; end < cssText.length; end++) {
      if (cssText[end] === "{") depth++;
      else if (cssText[end] === "}") {
        depth--;
        if (depth === 0) {
          end++;
          break;
        }
      }
    }
    blocks.push({ name: match[1], text: cssText.slice(match.index, end) });
    re.lastIndex = end;
  }
  return blocks;
}

var haloFrames = cssKeyframeBlocks(stylesCss).filter(function (block) {
  return /halo|drift-glow/.test(block.name);
});
assert.ok(haloFrames.length > 0, "halo keyframes missing");
haloFrames.forEach(function (block) {
  assert.equal(/background-position\s*:/.test(block.text), false, block.name);
  assert.equal(/(^|[^A-Za-z-])filter\s*:/.test(block.text), false, block.name);
});
assert.match(stylesCss, /\.halos-static[^{]*\{[^}]*animation:\s*none/);
assert.match(stylesCss, /prefers-reduced-motion:\s*reduce[\s\S]*\.halo[^{]*\{[^}]*animation:\s*none/);
assert.match(scriptJs, /halos-static/);
assert.match(scriptJs, /<\s*60/);

function tagAttr(tag, name) {
  var found = tag.match(new RegExp("\\b" + name + '="([^"]*)"'));
  return found ? found[1] : "";
}

var heroImgTag = (indexHtml.match(/<img\b[^>]*>/g) || []).filter(function (tag) {
  return tagAttr(tag, "class").split(/\s+/).indexOf("hero-img") !== -1;
})[0];
assert.ok(heroImgTag, "hero img");
assert.equal(tagAttr(heroImgTag, "width"), "1600");
assert.equal(tagAttr(heroImgTag, "height"), "1200");
assert.match(tagAttr(heroImgTag, "srcset"), /\b640w\b/);
assert.match(tagAttr(heroImgTag, "srcset"), /\b1280w\b/);
assert.match(tagAttr(heroImgTag, "srcset"), /\b1600w\b/);
assert.equal(tagAttr(heroImgTag, "sizes"), "100vw");
assert.equal(tagAttr(heroImgTag, "loading"), "");
var heroPicture = indexHtml.slice(indexHtml.indexOf("<picture>"), indexHtml.indexOf("</picture>") + "</picture>".length);
var webpSource = (heroPicture.match(/<source\b[^>]*>/g) || []).filter(function (tag) {
  return tagAttr(tag, "type") === "image/webp";
})[0];
assert.ok(webpSource, "webp source");
["640w", "960w", "1280w", "1600w"].forEach(function (width) {
  assert.ok(tagAttr(webpSource, "srcset").indexOf(width) !== -1, width);
  assert.ok(tagAttr(heroImgTag, "srcset").indexOf(width) !== -1, width);
});
assert.equal(tagAttr(webpSource, "sizes"), "100vw");
assert.equal(heroPicture.indexOf('loading="lazy"'), -1);

var imagePreloads = (indexHtml.match(/<link\b[^>]*>/g) || []).filter(function (tag) {
  return tagAttr(tag, "rel") === "preload" && tagAttr(tag, "as") === "image";
});
assert.equal(imagePreloads.length, 1);
assert.equal(tagAttr(imagePreloads[0], "href"), "assets/hero-960.webp");

["hero-640.webp", "hero-960.webp", "hero-1280.webp", "hero-640.jpg", "hero-960.jpg", "hero-1280.jpg"].forEach(function (file) {
  var bytes = fs.readFileSync(path.join(root, "assets", file));
  assert.ok(bytes.length > 0, file);
});

assert.equal(scriptJs.indexOf("t-tilt"), -1);
assert.equal(stylesCss.indexOf("t-tilt"), -1);
assert.equal(stylesCss.indexOf("--tilt-"), -1);
assert.equal(stylesCss.indexOf("--tilt-rx"), -1);

function cssRule(cssText, selector) {
  var token = selector + " {";
  var start = cssText.indexOf(token);
  if (start === -1) return "";
  var end = start + token.length - 1;
  var depth = 0;
  for (; end < cssText.length; end++) {
    if (cssText[end] === "{") depth++;
    else if (cssText[end] === "}") {
      depth--;
      if (depth === 0) {
        end++;
        break;
      }
    }
  }
  return cssText.slice(start, end);
}

var ticketRule = cssRule(stylesCss, ".order-ticket");
assert.ok(ticketRule, "order ticket rule");
assert.equal(/backdrop-filter/.test(ticketRule), false);
assert.match(ticketRule, /ui-monospace/);
assert.match(ticketRule, /Courier New/);
assert.match(ticketRule, /drop-shadow\(0 [1-9]/);
assert.match(ticketRule, /drop-shadow\(0 -/);
assert.equal(/mask-image\s*:/.test(ticketRule), false);
assert.equal(/box-shadow\s*:/.test(ticketRule), false);
var ticketPaper = cssRule(stylesCss, ".order-ticket::before");
assert.match(ticketPaper, /#f5f5f5/);
assert.match(ticketPaper, /mask-image:[\s\S]*radial-gradient/);
assert.match(ticketPaper, /mask-repeat:\s*round no-repeat/);
var qtyRule = cssRule(stylesCss, ".qty-btn");
assert.match(qtyRule, /width:\s*2\.75rem/);
assert.match(qtyRule, /height:\s*2\.75rem/);
var ticketQtyRule = cssRule(stylesCss, ".order-ticket .qty-btn");
assert.match(ticketQtyRule, /width:\s*2\.5rem/);
assert.match(ticketQtyRule, /height:\s*2\.5rem/);
var printFrames = cssKeyframeBlocks(stylesCss).filter(function (block) {
  return block.name === "ticket-print";
});
assert.equal(printFrames.length, 1);
assert.match(printFrames[0].text, /transform\s*:/);
assert.match(printFrames[0].text, /opacity\s*:/);
assert.equal(/background-position\s*:/.test(printFrames[0].text), false);
assert.equal(/(^|[^A-Za-z-])filter\s*:/.test(printFrames[0].text), false);
assert.match(stylesCss, /prefers-reduced-motion:\s*reduce[\s\S]*\.order-ticket-row\.is-printing[^{]*\{[^}]*animation:\s*none/);
assert.equal(stylesCss.indexOf("@media print"), -1);

var renderStart = scriptJs.indexOf("function renderTicket");
var dishRows = scriptJs.slice(
  scriptJs.indexOf("lines.forEach(function (line)", renderStart),
  scriptJs.indexOf("extras.forEach(function (extra)", renderStart)
);
var extraRows = scriptJs.slice(
  scriptJs.indexOf("extras.forEach(function (extra)", renderStart),
  scriptJs.indexOf("var open = lines.length", renderStart)
);
assert.match(dishRows, /order-ticket-note-btn/);
assert.match(dishRows, /"Nota"/);
assert.match(dishRows, /if \(showNote\)[\s\S]*appendChild\(note\)/);
assert.match(dishRows, /order-ticket-note/);
assert.match(dishRows, /setAttribute\(\s*"maxlength",\s*"80"\s*\)/);
assert.match(dishRows, /line\.note/);
assert.equal(extraRows.indexOf("order-ticket-note-btn"), -1);
assert.equal(extraRows.indexOf("order-ticket-note"), -1);
assert.equal(extraRows.indexOf("extra.note"), -1);
assert.match(scriptJs, /stored\.note = line\.note\.slice\(0,\s*80\)/);
assert.match(scriptJs, /restored\.note = item\.note\.slice\(0,\s*80\)/);
assert.match(scriptJs, /note:\s*line\.note/);
assert.match(scriptJs, /!reduceMotion\.matches[\s\S]{0,80}is-printing/);
assert.equal(scriptJs.indexOf("extra.note"), -1);

var contactoStart = indexHtml.indexOf('<aside class="contacto-card">');
var contactoEnd = indexHtml.indexOf("</aside>", contactoStart);
var contactoCard = indexHtml.slice(contactoStart, contactoEnd);
var mesaQr = "https://el-richy.github.io/menu-la-cayenne/";
assert.match(contactoCard, /src="assets\/mesa-qr\.png"/);
assert.match(contactoCard, /width="[0-9]+"/);
assert.match(contactoCard, /height="[0-9]+"/);
assert.match(contactoCard, /alt="Código QR de la carta\."/);
assert.match(contactoCard, /Escanea para ver la carta\./);
assert.ok(contactoCard.indexOf(mesaQr) !== -1);
assert.equal(/qrserver|api\.qrserver|chart\.googleapis/.test(indexHtml), false);
assert.equal(stylesCss.indexOf("@media print"), -1);
var mesaQrBytes = fs.readFileSync(path.join(root, "assets", "mesa-qr.png"));
assert.equal(mesaQrBytes[0], 0x89);
assert.equal(mesaQrBytes[1], 0x50);
assert.equal(mesaQrBytes[2], 0x4e);
assert.equal(mesaQrBytes[3], 0x47);

console.log("menu-logic tests passed");
