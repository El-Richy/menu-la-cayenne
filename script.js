(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var header = document.querySelector(".site-header");
  var hero = document.querySelector(".hero");
  var scrollFrame = 0;
  var revealSettled = function () {};

  if (!reduceMotion.matches) {
    document.documentElement.classList.add("motion");
  }

  function onScroll() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(function () {
      scrollFrame = 0;
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
      if (!hero || !document.documentElement.classList.contains("motion")) return;
      if (hero.getBoundingClientRect().bottom <= 0) return;
      var cover = hero.clientHeight * 0.06;
      var shift = Math.min(56, cover, Math.max(0, window.scrollY * 0.18));
      hero.style.setProperty("--hero-shift", shift.toFixed(2) + "px");
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");

  function setNavOpen(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNavOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !nav.classList.contains("is-open")) return;
      setNavOpen(false);
      toggle.focus();
    });
  }

  var stagger = document.querySelector(".t-stagger");
  if (stagger) {
    requestAnimationFrame(function () {
      stagger.classList.add("is-shown");
    });
  }

  var bar = document.querySelector(".menu-filters");
  var pill = bar ? bar.querySelector(".t-tabs-pill") : null;
  var filters = document.querySelectorAll(".filter-btn");
  var categories = document.querySelectorAll(".menu-category");

  function activeFilter() {
    return document.querySelector(".filter-btn.is-active") || filters[0];
  }

  function movePill(tab, animate) {
    if (!pill || !tab) return;
    if (!animate) {
      var prev = pill.style.transition;
      pill.style.transition = "none";
      pill.style.transform = "translateX(" + tab.offsetLeft + "px)";
      pill.style.width = tab.offsetWidth + "px";
      void pill.offsetWidth;
      pill.style.transition = prev;
    } else {
      pill.style.transform = "translateX(" + tab.offsetLeft + "px)";
      pill.style.width = tab.offsetWidth + "px";
    }
  }

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");

      filters.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");

      categories.forEach(function (cat) {
        var catName = cat.getAttribute("data-category");
        var show = filter === "all" || catName === filter;
        cat.classList.toggle("is-hidden", !show);
      });

      movePill(btn, true);
      revealSettled();
      btn.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: reduceMotion.matches ? "auto" : "smooth"
      });
    });
  });

  if (bar && pill) {
    requestAnimationFrame(function () {
      movePill(activeFilter(), false);
    });
    window.addEventListener("resize", function () {
      movePill(activeFilter(), false);
    });
  }

  if (finePointer.matches && !reduceMotion.matches) {
    document.querySelectorAll(".menu-card.featured, .menu-card:has(.badge-sold), .contacto-card").forEach(function (card) {
      var wrap = document.createElement("div");
      wrap.className = "t-tilt";
      card.parentNode.insertBefore(wrap, card);
      wrap.appendChild(card);
      card.classList.add("t-tilt-card");

      var glare = document.createElement("div");
      glare.className = "t-tilt-glare";
      glare.setAttribute("aria-hidden", "true");
      card.appendChild(glare);

      var MAX = 6;
      var tiltFrame = 0;
      var pendingX = 0;
      var pendingY = 0;
      var hasPending = false;

      function reset() {
        wrap.classList.remove("is-hover");
        card.classList.remove("is-tilting");
        card.style.setProperty("--tilt-rx", "0deg");
        card.style.setProperty("--tilt-ry", "0deg");
      }

      function applyTilt(clientX, clientY) {
        if (reduceMotion.matches) return;
        var rect = wrap.getBoundingClientRect();
        var px = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        var py = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
        wrap.classList.add("is-hover");
        card.classList.add("is-tilting");
        card.style.setProperty("--tilt-ry", ((px - 0.5) * MAX).toFixed(2) + "deg");
        card.style.setProperty("--tilt-rx", ((0.5 - py) * MAX).toFixed(2) + "deg");
        card.style.setProperty("--tilt-gx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--tilt-gy", (py * 100).toFixed(1) + "%");
      }

      function track(event) {
        pendingX = event.clientX;
        pendingY = event.clientY;
        hasPending = true;
        if (tiltFrame) return;
        tiltFrame = requestAnimationFrame(function () {
          tiltFrame = 0;
          if (!hasPending) return;
          hasPending = false;
          applyTilt(pendingX, pendingY);
        });
      }

      wrap.addEventListener("pointermove", track);
      wrap.addEventListener("pointerleave", function (event) {
        if (tiltFrame) {
          cancelAnimationFrame(tiltFrame);
          tiltFrame = 0;
        }
        hasPending = false;
        if (event.pointerType === "mouse") reset();
      });
    });
  }

  if (!reduceMotion.matches) {
    requestAnimationFrame(startAtmosphere);
  }

  function startAtmosphere() {
    var host = document.getElementById("atmosphere");
    if (!host) return;

    var canvas = document.createElement("canvas");
    host.appendChild(canvas);
    var ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    var mobile = window.innerWidth <= 768;
    var count = mobile ? 18 : 26;
    var particles = [];
    var w = 0;
    var h = 0;
    var raf = 0;

    function resize() {
      mobile = window.innerWidth <= 768;
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    var i;
    for (i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * (window.innerWidth || 1),
        y: Math.random() * (window.innerHeight || 1),
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.04 - Math.random() * 0.1,
        r: 0.8 + Math.random() * 1.4
      });
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(201, 162, 39, 0.28)";

      for (i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx + Math.sin((p.y + i) * 0.006) * 0.08;
        p.y += p.vy;
        if (p.y < -6) {
          p.y = h + 6;
          p.x = Math.random() * w;
        }
        if (p.x < -6) p.x = w + 6;
        if (p.x > w + 6) p.x = -6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener("resize", resize, { passive: true });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    });
  }

  function paintStatus() {
    var api = window.LaCayenne;
    if (!api || typeof api.statusAt !== "function") return;
    var status = api.statusAt(new Date());
    var el = document.getElementById("openStatus");
    if (el) {
      var dot = el.querySelector(".open-status-dot");
      var text = el.querySelector(".open-status-text");
      if (!dot) {
        dot = document.createElement("span");
        dot.className = "open-status-dot";
        dot.setAttribute("aria-hidden", "true");
        el.appendChild(dot);
      }
      if (!text) {
        text = document.createElement("span");
        text.className = "open-status-text";
        el.appendChild(text);
      }
      text.textContent = status.label + " \u00b7 " + status.detail;
      el.hidden = false;
      el.setAttribute("data-state", status.state);
    }
    var kicker = document.querySelector(".card-kicker");
    if (kicker) kicker.textContent = status.label;
  }

  paintStatus();
  setInterval(paintStatus, 60000);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) paintStatus();
  });

  function siblingIndex(el) {
    var parent = el.parentElement;
    if (!parent) return 0;
    var seen = 0;
    var child = parent.firstElementChild;
    while (child) {
      if (child.matches(".menu-card, .drink-group, .adicion, .contacto-card")) {
        if (child === el) return Math.min(seen, 6);
        seen += 1;
      }
      child = child.nextElementSibling;
    }
    return 0;
  }

  function portionVisible(el) {
    var rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return 0;
    var viewH = window.innerHeight || document.documentElement.clientHeight;
    var viewW = window.innerWidth || document.documentElement.clientWidth;
    var visH = Math.min(rect.bottom, viewH) - Math.max(rect.top, 0);
    var visW = Math.min(rect.right, viewW) - Math.max(rect.left, 0);
    if (visH <= 0 || visW <= 0) return 0;
    return (visH * visW) / (rect.width * rect.height);
  }

  function setupMotion() {
    if (!document.documentElement.classList.contains("motion")) return;
    var titles = document.querySelectorAll(".category-title");
    var settle = document.querySelectorAll(".menu-card, .drink-group, .adicion, .contacto-card");

    settle.forEach(function (el) {
      el.style.transitionDelay = (siblingIndex(el) * 40) + "ms";
    });

    if (typeof IntersectionObserver !== "function") {
      titles.forEach(function (el) { el.classList.add("is-in"); });
      settle.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.18 });

    titles.forEach(function (el) { io.observe(el); });
    settle.forEach(function (el) { io.observe(el); });

    revealSettled = function () {
      requestAnimationFrame(function () {
        function markShown(el) {
          if (el.classList.contains("is-in")) return;
          if (portionVisible(el) <= 0) return;
          el.classList.add("is-in");
          io.unobserve(el);
        }
        titles.forEach(markShown);
        settle.forEach(markShown);
      });
    };
  }

  setupMotion();

  function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function plainText(node) {
    return node ? node.textContent.replace(/\s+/g, " ").trim() : "";
  }

  function flavorName(li) {
    var name = "";
    li.childNodes.forEach(function (node) {
      if (node.nodeType === 3) name += node.textContent;
    });
    return name.replace(/\s+/g, " ").trim();
  }

  function drinkName(flavor, base) {
    var name = /^limonada/i.test(flavor) ? flavor : "Jugo de " + flavor;
    return name + " en " + base;
  }

  function normalizeFlavor(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function limonadaLineName(flavor) {
    var key = normalizeFlavor(flavor);
    if (key === "cerezada") return "Limonada cerezada en agua";
    if (key === "hierbabuena") return "Limonada de hierbabuena en agua";
    if (key === "coco") return "Limonada de coco en leche";
    return "Limonada de " + flavor;
  }

  function initOrder() {
    var api = window.LaCayenne;
    if (!api || typeof api.parsePrice !== "function" || typeof api.nextQty !== "function" || typeof api.drinkBases !== "function" || typeof api.buildMessage !== "function") return;

    var lines = [];
    var delivery = false;
    var collapsed = false;
    var ticketWasOpen = false;
    var openFrame = 0;
    var binders = [];
    var catalog = {};
    var STORAGE_KEY = "lacayenne-order-v2";
    var DELIVERY_PRICE = 6000;

    function lineKey(name, unit) {
      return name + "\u0000" + String(unit);
    }

    function remember(name, unit) {
      if (!name || typeof unit !== "number" || !isFinite(unit)) return false;
      catalog[lineKey(name, unit)] = true;
      return true;
    }

    function qtyOf(name, unit) {
      var i;
      for (i = 0; i < lines.length; i++) {
        if (lines[i].name === name && lines[i].unit === unit) return lines[i].qty;
      }
      return 0;
    }

    function persist() {
      if (lines.length === 0) delivery = false;
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
          lines: lines.map(function (line) {
            return { name: line.name, unit: line.unit, qty: line.qty };
          }),
          delivery: delivery
        }));
      } catch (err) {
        return;
      }
    }

    function changeQty(name, unit, delta) {
      var next = api.nextQty(qtyOf(name, unit), delta);
      var i;
      for (i = 0; i < lines.length; i++) {
        if (lines[i].name === name && lines[i].unit === unit) {
          if (next === 0) lines.splice(i, 1);
          else lines[i].qty = next;
          persist();
          paintOrder();
          return;
        }
      }
      if (next <= 0) return;
      lines.push({ name: name, unit: unit, qty: next });
      persist();
      paintOrder();
    }

    function makeBtn(className, label, text, onClick) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = className;
      btn.setAttribute("aria-label", label);
      btn.textContent = text;
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      });
      return btn;
    }

    function fillStepper(ctl, name, unit, qty) {
      ctl.appendChild(makeBtn("qty-btn", "Restar " + name, "\u2212", function () {
        changeQty(name, unit, -1);
      }));
      var num = document.createElement("span");
      num.className = "qty-num";
      num.textContent = String(qty);
      ctl.appendChild(num);
      ctl.appendChild(makeBtn("qty-btn", "Sumar " + name, "+", function () {
        changeQty(name, unit, 1);
      }));
    }

    function bindSimple(host, row, name, unit) {
      if (!remember(name, unit)) return false;
      var ctl = document.createElement("span");
      ctl.className = "qty-ctl";
      host.appendChild(ctl);
      binders.push(function () {
        var qty = qtyOf(name, unit);
        row.classList.toggle("is-in-order", qty > 0);
        clearNode(ctl);
        if (qty > 0) fillStepper(ctl, name, unit, qty);
        else {
          ctl.appendChild(makeBtn("qty-btn", "Sumar " + name, "+", function () {
            changeQty(name, unit, 1);
          }));
        }
      });
      return true;
    }

    function bindJugo(host, row, flavor, aguaUnit, lecheUnit, nameFor) {
      var label = nameFor || function (base) { return drinkName(flavor, base); };
      var aguaName = label("agua");
      var lecheName = label("leche");
      if (!remember(aguaName, aguaUnit) || !remember(lecheName, lecheUnit)) return false;
      var ctl = document.createElement("span");
      ctl.className = "qty-ctl";
      host.appendChild(ctl);
      var choicesOpen = false;
      binders.push(function () {
        var aguaQty = qtyOf(aguaName, aguaUnit);
        var lecheQty = qtyOf(lecheName, lecheUnit);
        row.classList.toggle("is-in-order", aguaQty + lecheQty > 0);
        clearNode(ctl);
        if (aguaQty > 0) fillStepper(ctl, aguaName, aguaUnit, aguaQty);
        if (lecheQty > 0) fillStepper(ctl, lecheName, lecheUnit, lecheQty);
        if (aguaQty > 0 && lecheQty > 0) {
          choicesOpen = false;
          return;
        }
        ctl.appendChild(makeBtn("qty-btn", "Sumar " + flavor, "+", function () {
          choicesOpen = !choicesOpen;
          paintOrder();
        }));
        if (!choicesOpen) return;
        if (aguaQty === 0) {
          ctl.appendChild(makeBtn(
            "qty-choice",
            "Sumar " + aguaName,
            "Agua \u00b7 " + api.formatMoney(aguaUnit),
            function () {
              choicesOpen = false;
              changeQty(aguaName, aguaUnit, 1);
            }
          ));
        }
        if (lecheQty === 0) {
          ctl.appendChild(makeBtn(
            "qty-choice",
            "Sumar " + lecheName,
            "Leche \u00b7 " + api.formatMoney(lecheUnit),
            function () {
              choicesOpen = false;
              changeQty(lecheName, lecheUnit, 1);
            }
          ));
        }
      });
      return true;
    }

    function bindByBases(host, row, flavor, aguaUnit, lecheUnit, nameFor) {
      var bases = api.drinkBases(flavor);
      var label = nameFor || function (base) { return drinkName(flavor, base); };
      if (bases.length === 1) {
        var base = bases[0] === "leche" ? "leche" : "agua";
        var unit = base === "leche" ? lecheUnit : aguaUnit;
        return bindSimple(host, row, label(base), unit);
      }
      return bindJugo(host, row, flavor, aguaUnit, lecheUnit, label);
    }

    function flavorsOf(group) {
      var flavors = [];
      if (!group) return flavors;
      group.querySelectorAll(".flavor-list li").forEach(function (li) {
        var flavor = flavorName(li);
        if (flavor) flavors.push(flavor);
      });
      return flavors;
    }

    function drinkGroup(title) {
      var found = null;
      document.querySelectorAll(".drink-group").forEach(function (group) {
        if (!found && plainText(group.querySelector("h4")) === title) found = group;
      });
      return found;
    }

    function bindJarra(row, unit, flavors, nameFor) {
      var entries = [];
      flavors.forEach(function (flavor) {
        var name = nameFor(flavor);
        if (!remember(name, unit)) return;
        entries.push({ flavor: flavor, name: name });
      });
      if (!entries.length) return false;
      var ctl = document.createElement("span");
      ctl.className = "qty-ctl";
      row.appendChild(ctl);
      var choicesOpen = false;
      binders.push(function () {
        var any = false;
        var missing = [];
        clearNode(ctl);
        entries.forEach(function (entry) {
          var qty = qtyOf(entry.name, unit);
          if (qty > 0) {
            any = true;
            fillStepper(ctl, entry.name, unit, qty);
          } else {
            missing.push(entry);
          }
        });
        row.classList.toggle("is-in-order", any);
        if (!missing.length) {
          choicesOpen = false;
          return;
        }
        ctl.appendChild(makeBtn("qty-btn", "Elegir sabor", "+", function () {
          choicesOpen = !choicesOpen;
          paintOrder();
        }));
        if (!choicesOpen) return;
        missing.forEach(function (entry) {
          ctl.appendChild(makeBtn(
            "qty-choice",
            "Sumar " + entry.name,
            entry.flavor,
            function () {
              choicesOpen = false;
              changeQty(entry.name, unit, 1);
            }
          ));
        });
      });
      return true;
    }

    document.querySelectorAll(".menu-card").forEach(function (card) {
      var name = plainText(card.querySelector("h4"));
      var unit = api.parsePrice(plainText(card.querySelector(".price")));
      bindSimple(card, card, name, unit);
    });

    document.querySelectorAll(".adicion").forEach(function (row) {
      var name = plainText(row.querySelector("strong"));
      var unit = api.parsePrice(row.textContent);
      bindSimple(row, row, name, unit);
    });

    var juiceFlavors = flavorsOf(drinkGroup("Jugos naturales"));
    var limonadaFlavors = flavorsOf(drinkGroup("Limonadas"));

    document.querySelectorAll(".drink-rows li").forEach(function (row) {
      var name = plainText(row.querySelector("span"));
      var unit = api.parsePrice(plainText(row.querySelector(".price")));
      if (name === "Jarra jugo agua") {
        bindJarra(row, unit, juiceFlavors, function (flavor) {
          return "Jarra de " + flavor + " en agua";
        });
        return;
      }
      if (name === "Jarra jugo leche") {
        bindJarra(row, unit, juiceFlavors.filter(function (flavor) {
          var bases = api.drinkBases(flavor);
          return !(bases.length === 1 && bases[0] === "agua");
        }), function (flavor) {
          return "Jarra de " + flavor + " en leche";
        });
        return;
      }
      if (name === "Jarra limonadas") {
        bindJarra(row, unit, limonadaFlavors, function (flavor) {
          return "Jarra de " + flavor.toLocaleLowerCase("es");
        });
        return;
      }
      bindSimple(row, row, name, unit);
    });

    document.querySelectorAll(".flavor-special").forEach(function (row) {
      var name = plainText(row.querySelector(".flavor-special-name"));
      var unit = api.parsePrice(plainText(row.querySelector(".price")));
      if (normalizeFlavor(name) === "frutos rojos") {
        bindJugo(row, row, name, unit, unit, function (base) {
          return name + " en " + base;
        });
        return;
      }
      bindSimple(row, row, name, unit);
    });

    document.querySelectorAll(".drink-group").forEach(function (group) {
      var title = plainText(group.querySelector("h4"));
      var strongs = group.querySelectorAll(".drink-prices strong");
      if (title === "Jugos naturales") {
        var agua = strongs[0] ? api.parsePrice(strongs[0].textContent) : null;
        var leche = strongs[1] ? api.parsePrice(strongs[1].textContent) : null;
        group.querySelectorAll(".flavor-list li").forEach(function (li) {
          bindByBases(li, li, flavorName(li), agua, leche);
        });
      } else if (title === "Limonadas") {
        var unit = strongs[0] ? api.parsePrice(strongs[0].textContent) : null;
        group.querySelectorAll(".flavor-list li").forEach(function (li) {
          bindSimple(li, li, limonadaLineName(flavorName(li)), unit);
        });
      }
    });

    function restore() {
      var raw;
      try {
        raw = sessionStorage.getItem(STORAGE_KEY);
      } catch (err) {
        return;
      }
      if (!raw) return;
      var parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        return;
      }
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !Array.isArray(parsed.lines)) return;
      parsed.lines.forEach(function (item) {
        if (!item || typeof item.name !== "string") return;
        var unit = Number(item.unit);
        if (!catalog[lineKey(item.name, unit)]) return;
        var qty = api.nextQty(0, Number(item.qty) || 0);
        if (qty > 0) lines.push({ name: item.name, unit: unit, qty: qty });
      });
      delivery = lines.length > 0 && parsed.delivery === true;
    }

    var ticket = document.createElement("div");
    ticket.id = "orderTicket";
    ticket.className = "order-ticket";
    ticket.setAttribute("role", "region");
    ticket.setAttribute("aria-label", "Tu pedido");
    ticket.setAttribute("aria-hidden", "true");
    ticket.inert = true;

    var bar = document.createElement("div");
    bar.className = "order-ticket-bar";

    var title = document.createElement("p");
    title.className = "order-ticket-title";
    title.textContent = "Tu pedido";
    bar.appendChild(title);

    var countEl = document.createElement("p");
    countEl.className = "order-ticket-count";
    bar.appendChild(countEl);

    var totalEl = document.createElement("p");
    totalEl.className = "order-ticket-total";
    bar.appendChild(totalEl);

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "order-ticket-toggle";
    toggle.addEventListener("click", function () {
      collapsed = !collapsed;
      renderTicket();
    });
    bar.appendChild(toggle);
    ticket.appendChild(bar);

    var list = document.createElement("ul");
    list.className = "order-ticket-list";
    ticket.appendChild(list);

    var deliveryBtn = document.createElement("button");
    deliveryBtn.type = "button";
    deliveryBtn.className = "order-ticket-delivery";
    deliveryBtn.addEventListener("click", function () {
      delivery = !delivery;
      persist();
      renderTicket();
    });
    ticket.appendChild(deliveryBtn);

    var link = document.createElement("a");
    link.className = "btn btn-primary order-ticket-wa";
    link.textContent = "Pedir por WhatsApp";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    ticket.appendChild(link);
    document.body.appendChild(ticket);

    function syncTicketOpen(open) {
      if (!open) {
        openFrame += 1;
        ticket.classList.remove("is-open");
        ticket.inert = true;
        ticket.setAttribute("aria-hidden", "true");
        document.body.classList.remove("has-order");
        return;
      }
      document.body.classList.add("has-order");
      if (ticket.classList.contains("is-open")) return;
      var frame = ++openFrame;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (frame !== openFrame) return;
          ticket.inert = false;
          ticket.setAttribute("aria-hidden", "false");
          ticket.classList.add("is-open");
        });
      });
    }

    function renderTicket() {
      clearNode(list);
      var productTotal = 0;
      var count = 0;
      lines.forEach(function (line) {
        var row = document.createElement("li");
        row.className = "order-ticket-row";
        var qty = document.createElement("span");
        qty.textContent = String(line.qty);
        var name = document.createElement("span");
        name.className = "order-ticket-name";
        name.textContent = line.name;
        var money = document.createElement("span");
        money.textContent = api.formatMoney(line.unit * line.qty);
        row.appendChild(qty);
        row.appendChild(name);
        row.appendChild(money);
        row.appendChild(makeBtn("qty-btn", "Quitar una " + line.name, "\u2212", function () {
          changeQty(line.name, line.unit, -1);
        }));
        list.appendChild(row);
        productTotal += line.unit * line.qty;
        count += line.qty;
      });
      var open = lines.length > 0;
      if (!open) {
        collapsed = false;
        ticketWasOpen = false;
      } else if (!ticketWasOpen) {
        collapsed = false;
        ticketWasOpen = true;
      }
      var total = productTotal + (delivery ? DELIVERY_PRICE : 0);
      countEl.textContent = count === 1 ? "1 ítem" : count + " ítems";
      totalEl.textContent = "Total: " + api.formatMoney(total);
      deliveryBtn.setAttribute("aria-pressed", delivery ? "true" : "false");
      deliveryBtn.textContent = delivery ? "Quitar domicilio" : "Domicilio · " + api.formatMoney(DELIVERY_PRICE);
      toggle.textContent = collapsed ? "Ver pedido" : "Ocultar";
      toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      ticket.classList.toggle("is-collapsed", open && collapsed);
      var messageLines = lines.map(function (line) {
        return { name: line.name, unit: line.unit, qty: line.qty };
      });
      if (delivery) messageLines.push({ name: "Domicilio", unit: DELIVERY_PRICE, qty: 1 });
      link.href = "https://wa.me/573184003076?text=" + encodeURIComponent(api.buildMessage(messageLines));
      syncTicketOpen(open);
    }

    function paintOrder() {
      binders.forEach(function (paint) { paint(); });
      renderTicket();
    }

    restore();
    paintOrder();
  }

  initOrder();

})();
