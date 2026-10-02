(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
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
  var onMascotaFilter = null;

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
      btn.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: reduceMotion.matches ? "auto" : "smooth"
      });
      if (onMascotaFilter) onMascotaFilter();
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
    document.querySelectorAll(".menu-card, .contacto-card").forEach(function (card) {
      var wrap = document.createElement("div");
      wrap.className = "t-tilt";
      card.parentNode.insertBefore(wrap, card);
      wrap.appendChild(card);
      card.classList.add("t-tilt-card");

      var glare = document.createElement("div");
      glare.className = "t-tilt-glare";
      glare.setAttribute("aria-hidden", "true");
      card.appendChild(glare);

      var MAX = 12;

      function reset() {
        wrap.classList.remove("is-hover");
        card.classList.remove("is-tilting");
        card.style.setProperty("--tilt-rx", "0deg");
        card.style.setProperty("--tilt-ry", "0deg");
      }

      function track(event) {
        if (reduceMotion.matches) return;
        var rect = wrap.getBoundingClientRect();
        var px = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
        var py = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
        wrap.classList.add("is-hover");
        card.classList.add("is-tilting");
        card.style.setProperty("--tilt-ry", ((px - 0.5) * MAX).toFixed(2) + "deg");
        card.style.setProperty("--tilt-rx", ((0.5 - py) * MAX).toFixed(2) + "deg");
        card.style.setProperty("--tilt-gx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--tilt-gy", (py * 100).toFixed(1) + "%");
      }

      wrap.addEventListener("pointermove", track);
      wrap.addEventListener("pointerleave", function (event) {
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

  /* Mascot: right rail, spring, hang/jump. Decoration — one rAF. */
  (function initMascota() {
    var el = document.getElementById("mascota");
    if (!el) return;

    var poseList = el.querySelectorAll(".mascota-poses img[data-pose]");
    var poseNodes = {};
    var pi;
    for (pi = 0; pi < poseList.length; pi++) {
      poseNodes[poseList[pi].getAttribute("data-pose")] = poseList[pi];
    }

    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var cores = navigator.hardwareConcurrency || 8;
    var simple = !!(conn && conn.saveData) || cores <= 2;
    if (simple) el.classList.add("is-simple");

    var STIFFNESS = 260;
    var DAMPING = 18;
    var SLOW_VEL = 520;
    var POSE_DEBOUNCE_MS = 120;
    var HOVER_CLEAR_MS = 120;
    var BOOP_MS = 420;
    var DUCK_MS = 280;
    var LERP_SIMPLE = 0.2;
    var ROW_GROUP_PX = 40;

    var x = 0;
    var y = 0;
    var vx = 0;
    var vy = 0;
    var targetX = 0;
    var targetY = 0;
    var zone = "hero";
    var currentPose = "hang";
    var pendingPose = null;
    var lastPoseChangeT = 0;
    var raf = 0;
    var lastT = 0;
    var lastScrollY = window.scrollY;
    var lastScrollT = performance.now();
    var velocity = 0;
    var boopUntil = 0;
    var duckUntil = 0;
    var wasDucking = false;
    var rebuildRemain = 0;
    var resizeTimer = 0;
    var hoverCard = null;
    var hoverTimer = 0;

    var layout = {
      railX: 8,
      mw: 64,
      mh: 67,
      headerH: 64,
      waH: 54,
      filterEl: null,
      menuEl: null,
      contactSection: null,
      contact: null,
      featured: null,
      rows: []
    };

    function clamp(n, a, b) {
      return Math.max(a, Math.min(b, n));
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function applyTransform() {
      el.style.transform = "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0)";
    }

    function markReady() {
      el.classList.add("is-ready");
    }

    function applyPoseNow(next) {
      if (simple) next = "hang";
      var node = poseNodes[next] || poseNodes.hang;
      var name = node ? (node.getAttribute("data-pose") || "hang") : "hang";
      if (name === currentPose && el.dataset.pose === name) {
        pendingPose = null;
        return;
      }
      var i;
      for (i = 0; i < poseList.length; i++) {
        poseList[i].classList.toggle("is-active", poseList[i] === node);
      }
      currentPose = name;
      el.dataset.pose = name;
      lastPoseChangeT = performance.now();
      pendingPose = null;
    }

    function setPose(next) {
      if (simple) next = "hang";
      if (!poseNodes[next]) next = "hang";
      if (next === currentPose) {
        pendingPose = null;
        return;
      }
      var now = performance.now();
      if (now - lastPoseChangeT < POSE_DEBOUNCE_MS) {
        pendingPose = next;
        return;
      }
      applyPoseNow(next);
    }

    function flushPendingPose() {
      if (!pendingPose) return;
      if (performance.now() - lastPoseChangeT >= POSE_DEBOUNCE_MS) {
        applyPoseNow(pendingPose);
      }
    }

    function clampY(ny, mh) {
      return clamp(ny, layout.headerH + 4, window.innerHeight - mh - layout.waH - 16);
    }

    function clampX(nx, mw) {
      return clamp(nx, 8, window.innerWidth - mw - 10);
    }

    function perchRightTop(rect, mw, mh) {
      return {
        x: clampX(rect.right - mw * 0.55, mw),
        y: rect.top - mh * 0.15
      };
    }

    function rebuildLayout() {
      var mw = el.offsetWidth || 64;
      var mh = el.offsetHeight || 67;
      var sy = window.scrollY;
      var sx = window.scrollX;

      var headerEl = document.querySelector(".site-header");
      var headerH = headerEl ? headerEl.getBoundingClientRect().height : 64;

      var waEl = document.querySelector(".wa-float");
      var waH = 54;
      if (waEl) {
        var waR = waEl.getBoundingClientRect();
        if (waR.height > 1) waH = waR.height;
      }

      var inner = document.querySelector(".menu-section .section-inner");
      var railX = window.innerWidth - mw - 10;
      if (inner) {
        var innerR = inner.getBoundingClientRect();
        var padRight = parseFloat(window.getComputedStyle(inner).paddingRight) || 0;
        railX = innerR.right - padRight - mw * 0.42;
      }
      railX = clampX(railX, mw);

      var cards = [];
      var cardEls = document.querySelectorAll(".menu-card");
      var i;
      for (i = 0; i < cardEls.length; i++) {
        var card = cardEls[i];
        var cat = card.closest(".menu-category");
        if (cat && cat.classList.contains("is-hidden")) continue;
        var r = card.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        cards.push({
          el: card,
          docTop: r.top + sy,
          docBottom: r.bottom + sy,
          docRight: r.right + sx,
          featured: card.id === "plato-cayenne"
        });
      }
      cards.sort(function (a, b) { return a.docTop - b.docTop; });

      var rows = [];
      for (i = 0; i < cards.length; i++) {
        var c = cards[i];
        var last = rows[rows.length - 1];
        if (last && Math.abs(c.docTop - last.docTop) <= ROW_GROUP_PX) {
          last.docBottom = Math.max(last.docBottom, c.docBottom);
          last.right = Math.max(last.right, c.docRight);
          if (c.featured) last.featured = c;
        } else {
          rows.push({
            docTop: c.docTop,
            docBottom: c.docBottom,
            right: c.docRight,
            featured: c.featured ? c : null
          });
        }
      }

      var featured = null;
      var featEl = document.getElementById("plato-cayenne");
      if (featEl) {
        var featCat = featEl.closest(".menu-category");
        if (!(featCat && featCat.classList.contains("is-hidden"))) {
          var fr = featEl.getBoundingClientRect();
          if (fr.width >= 2 && fr.height >= 2) {
            featured = {
              el: featEl,
              docTop: fr.top + sy,
              docBottom: fr.bottom + sy,
              docRight: fr.right + sx
            };
          }
        }
      }

      var contactEl = document.querySelector(".contacto-card");
      var contact = null;
      if (contactEl) {
        var cr = contactEl.getBoundingClientRect();
        if (cr.width >= 2 && cr.height >= 2) {
          contact = {
            el: contactEl,
            docTop: cr.top + sy,
            docRight: cr.right + sx
          };
        }
      }

      layout.railX = railX;
      layout.mw = mw;
      layout.mh = mh;
      layout.headerH = headerH;
      layout.waH = waH;
      layout.filterEl = document.querySelector(".menu-filters");
      layout.menuEl = document.getElementById("menu");
      layout.contactSection = document.getElementById("contacto");
      layout.contact = contact;
      layout.featured = featured;
      layout.rows = rows;
    }

    function focusedRow(sy) {
      var rows = layout.rows;
      if (!rows.length) return { index: 0, frac: 0, next: 0, row: null, nextRow: null };
      var focus = sy + window.innerHeight * 0.28;
      var idx = 0;
      var k;
      for (k = 0; k < rows.length; k++) {
        if (rows[k].docTop <= focus) idx = k;
        else break;
      }
      var next = Math.min(rows.length - 1, idx + 1);
      var frac = 0;
      if (next > idx) {
        var span = rows[next].docTop - rows[idx].docTop;
        frac = span > 1 ? clamp((focus - rows[idx].docTop) / span, 0, 1) : 0;
      }
      return { index: idx, frac: frac, next: next, row: rows[idx], nextRow: rows[next] };
    }

    function updateTargets(now) {
      var mw = el.offsetWidth || layout.mw || 64;
      var mh = el.offsetHeight || layout.mh || 67;
      var sy = window.scrollY;
      var sx = window.scrollX;
      var pose = "hang";
      var nextZone = "climb";
      var nx = layout.railX;
      var ny = layout.headerH + 8;

      var menuTop = layout.menuEl ? layout.menuEl.getBoundingClientRect().top : 0;
      var contactTop = layout.contactSection
        ? layout.contactSection.getBoundingClientRect().top
        : Infinity;
      var prog = focusedRow(sy);

      if (menuTop > window.innerHeight * 0.55) {
        nextZone = "hero";
        nx = layout.railX;
        ny = layout.headerH + 8;
        pose = "hang";
      } else if (contactTop < window.innerHeight * 0.45 && layout.contact) {
        nextZone = "contact";
        nx = clampX(layout.contact.docRight - sx - mw * 0.55, mw);
        ny = layout.contact.docTop - sy - mh * 0.15;
        pose = "hang";
      } else if (hoverCard && finePointer.matches && !simple) {
        nextZone = "hover";
        var hr = hoverCard.getBoundingClientRect();
        var hp = perchRightTop(hr, mw, mh);
        nx = hp.x;
        ny = hp.y;
        pose = "hang";
      } else if (prog.row && prog.row.featured && layout.featured) {
        nextZone = "featured";
        nx = clampX(layout.featured.docRight - sx - mw * 0.55, mw);
        ny = layout.featured.docTop - sy - mh * 0.15;
        pose = "hang";
      } else if (prog.row) {
        nextZone = "climb";
        nx = layout.railX;
        var y0 = prog.row.docTop - sy - mh * 0.12;
        var y1 = prog.nextRow ? prog.nextRow.docTop - sy - mh * 0.12 : y0;
        ny = lerp(y0, y1, easeInOut(prog.frac));
        pose = Math.abs(velocity) < SLOW_VEL ? "hang" : "jump";
      } else {
        nextZone = "hero";
        nx = layout.railX;
        ny = layout.headerH + 8;
        pose = "hang";
      }

      if (now < duckUntil) {
        nextZone = "duck";
        nx = layout.railX;
        if (layout.filterEl) {
          ny = layout.filterEl.getBoundingClientRect().bottom;
        }
        pose = "hang";
      }

      if (now < boopUntil) {
        nextZone = "boop";
        pose = "jump";
      }

      if (simple) {
        nx = layout.railX;
        pose = "hang";
      }

      if (now >= duckUntil) {
        ny += clamp(velocity * 0.06, -36, 36);
      }

      targetX = clampX(nx, mw);
      targetY = clampY(ny, mh);
      zone = nextZone;
      setPose(pose);
    }

    function kick() {
      if (document.hidden) return;
      if (!raf) {
        lastT = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }

    function tick(now) {
      raf = 0;
      if (document.hidden) return;

      var dt = Math.min((now - lastT) / 1000, 1 / 30);
      lastT = now;
      if (dt < 0) dt = 0;

      if (rebuildRemain > 0) {
        rebuildLayout();
        rebuildRemain -= 1;
      }

      if (wasDucking && now >= duckUntil) {
        rebuildLayout();
        wasDucking = false;
      }

      updateTargets(now);
      flushPendingPose();

      if (simple) {
        y += (targetY - y) * LERP_SIMPLE;
        x += (targetX - x) * LERP_SIMPLE;
        vx = 0;
        vy = 0;
      } else {
        var ax = STIFFNESS * (targetX - x) - DAMPING * vx;
        var ay = STIFFNESS * (targetY - y) - DAMPING * vy;
        vx += ax * dt;
        vy += ay * dt;
        x += vx * dt;
        y += vy * dt;
      }

      applyTransform();

      if (now - lastScrollT > 120) {
        velocity *= 0.85;
        if (Math.abs(velocity) < 1) velocity = 0;
      }

      var dx = targetX - x;
      var dy = targetY - y;
      var busy =
        now < boopUntil ||
        now < duckUntil ||
        pendingPose ||
        now - lastScrollT < 80;
      var moving =
        Math.abs(vx) >= 8 ||
        Math.abs(vy) >= 8 ||
        Math.abs(dx) >= 0.5 ||
        Math.abs(dy) >= 0.5;

      if (busy || moving) {
        raf = requestAnimationFrame(tick);
      } else {
        x = targetX;
        y = targetY;
        vx = 0;
        vy = 0;
        if (!simple) setPose("hang");
        flushPendingPose();
        applyTransform();
        raf = 0;
      }
    }

    function hardSync() {
      rebuildLayout();
      updateTargets(performance.now());
      x = targetX;
      y = targetY;
      vx = 0;
      vy = 0;
      applyTransform();
    }

    function scheduleRebuild() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        hardSync();
        kick();
      }, 120);
    }

    function pinStatic() {
      rebuildLayout();
      applyPoseNow("hang");
      var mw = layout.mw;
      var mh = layout.mh;
      var sy = window.scrollY;
      x = layout.railX;
      if (layout.rows.length) {
        y = clampY(layout.rows[0].docTop - sy - mh * 0.12, mh);
      } else {
        y = layout.headerH + 8;
      }
      targetX = x;
      targetY = y;
      vx = 0;
      vy = 0;
      applyTransform();
      markReady();
    }

    if (reduceMotion.matches) {
      el.classList.add("is-static");
      pinStatic();
      window.addEventListener("resize", pinStatic, { passive: true });
      window.addEventListener("orientationchange", pinStatic, { passive: true });
      onMascotaFilter = pinStatic;
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden) pinStatic();
      });
      return;
    }

    applyPoseNow("hang");

    function onScroll() {
      var now = performance.now();
      var sy = window.scrollY;
      var dtMs = Math.max(8, now - lastScrollT);
      velocity = ((sy - lastScrollY) / dtMs) * 1000;
      lastScrollY = sy;
      lastScrollT = now;
      kick();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleRebuild, { passive: true });
    window.addEventListener("orientationchange", scheduleRebuild, { passive: true });

    onMascotaFilter = function () {
      duckUntil = performance.now() + DUCK_MS;
      wasDucking = true;
      rebuildRemain = 2;
      kick();
    };

    el.addEventListener("click", function (event) {
      event.preventDefault();
      if (simple) return;
      boopUntil = performance.now() + BOOP_MS;
      vy -= 420;
      setPose("jump");
      kick();
    });

    var menuSection = document.querySelector(".menu-section");
    if (menuSection && finePointer.matches && !simple) {
      menuSection.addEventListener("pointerenter", function (event) {
        var card = event.target.closest(".menu-card");
        if (!card || !menuSection.contains(card)) return;
        clearTimeout(hoverTimer);
        hoverCard = card;
        kick();
      }, true);
      menuSection.addEventListener("pointerleave", function (event) {
        var card = event.target.closest(".menu-card");
        if (!card) return;
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(function () {
          hoverCard = null;
          kick();
        }, HOVER_CLEAR_MS);
      }, true);
      el.addEventListener("pointerenter", function () {
        clearTimeout(hoverTimer);
      });
      el.addEventListener("pointerleave", function () {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(function () {
          hoverCard = null;
          kick();
        }, HOVER_CLEAR_MS);
      });
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      } else {
        hardSync();
        kick();
      }
    });

    hardSync();
    markReady();
    kick();
  })();

})();
