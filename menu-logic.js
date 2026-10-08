(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LaCayenne = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var OPEN = {
    Sun: [16 * 60 + 30, 23 * 60],
    Mon: [15 * 60 + 30, 22 * 60],
    Tue: [15 * 60 + 30, 22 * 60],
    Wed: null,
    Thu: [15 * 60 + 30, 22 * 60],
    Fri: [16 * 60 + 30, 23 * 60],
    Sat: [16 * 60 + 30, 23 * 60]
  };
  var DAY_ES = {
    Sun: "domingo",
    Mon: "lunes",
    Tue: "martes",
    Wed: "miércoles",
    Thu: "jueves",
    Fri: "viernes",
    Sat: "sábado"
  };

  function parsePrice(text) {
    var match = String(text == null ? "" : text).match(/\$\s*(\d{1,3}(?:\.\d{3})+|\d+)/);
    if (!match) return null;
    return Number(match[1].replace(/\./g, ""));
  }

  function formatMoney(n) {
    var s = String(Math.round(Number(n)));
    var out = "";
    while (s.length > 3) {
      out = "." + s.slice(-3) + out;
      s = s.slice(0, -3);
    }
    return "$" + s + out;
  }

  function clockLabel(minutes) {
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    var suffix = h >= 12 ? "p.m." : "a.m.";
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    var mm = m < 10 ? "0" + m : String(m);
    return h12 + ":" + mm + " " + suffix;
  }

  function statusFromParts(parts) {
    var weekday = parts.weekday;
    var minutes = parts.minutes;
    var today = OPEN[weekday];
    if (today && minutes >= today[0] && minutes < today[1]) {
      return {
        state: "open",
        label: "Abierto ahora",
        detail: "Hasta las " + clockLabel(today[1])
      };
    }
    if (today && minutes < today[0]) {
      return {
        state: "closed",
        label: "Cerrado",
        detail: "Abrimos hoy a las " + clockLabel(today[0])
      };
    }
    var idx = DAYS.indexOf(weekday);
    var nextIdx = (idx + 1) % 7;
    var steps = 1;
    while (!OPEN[DAYS[nextIdx]]) {
      nextIdx = (nextIdx + 1) % 7;
      steps += 1;
    }
    var nextDay = DAYS[nextIdx];
    var openAt = clockLabel(OPEN[nextDay][0]);
    return {
      state: "closed",
      label: weekday === "Wed" ? "Hoy cerrado" : "Cerrado",
      detail: steps === 1
        ? "Abrimos mañana a las " + openAt
        : "Abrimos el " + DAY_ES[nextDay] + " a las " + openAt
    };
  }

  function statusAt(date) {
    var map = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date).forEach(function (part) {
      map[part.type] = part.value;
    });
    var hour = Number(map.hour);
    if (hour === 24) hour = 0;
    return statusFromParts({
      weekday: map.weekday,
      minutes: hour * 60 + Number(map.minute)
    });
  }

  function buildMessage(lines) {
    var rows = [];
    var total = 0;
    var i;
    for (i = 0; i < lines.length; i++) {
      var line = lines[i];
      var lineTotal = line.unit * line.qty;
      total += lineTotal;
      rows.push(line.qty + " × " + line.name + " — " + formatMoney(lineTotal));
    }
    return "Hola, quiero pedir en La Cayenne:\n" + rows.join("\n") + "\n\nTotal: " + formatMoney(total);
  }

  function nextQty(current, delta) {
    var n = Math.round(Number(current) + Number(delta));
    if (!isFinite(n) || n < 0) return 0;
    if (n > 12) return 12;
    return n;
  }

  function foldFlavor(text) {
    return String(text == null ? "" : text)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function drinkBases(flavor) {
    var key = foldFlavor(flavor);
    if (
      key === "limonada natural" ||
      key === "limonada de panela" ||
      key === "cerezada" ||
      key === "hierbabuena"
    ) {
      return ["agua"];
    }
    if (key === "coco") return ["leche"];
    return ["agua", "leche"];
  }

  return {
    parsePrice: parsePrice,
    formatMoney: formatMoney,
    statusFromParts: statusFromParts,
    statusAt: statusAt,
    buildMessage: buildMessage,
    nextQty: nextQty,
    drinkBases: drinkBases
  };
});
