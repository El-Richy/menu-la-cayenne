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

  /* Mascota escaladora: baja con el scroll (lerp + rAF, mobile-first) */
  (function initMascota() {
    var el = document.getElementById("mascota");
    if (!el) return;

    var img = el.querySelector("img");

    /* prefers-reduced-motion: fija, sin animación */
    if (reduceMotion.matches) {
      el.classList.add("is-static");
      return;
    }

    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var cores = navigator.hardwareConcurrency || 8;
    var hoverNone = window.matchMedia("(hover: none)").matches;
    /* Modo simple: save-data, CPU baja, o touch+CPU limitada → solo translate Y */
    var simple =
      !!(conn && conn.saveData) ||
      cores <= 4 ||
      (hoverNone && cores <= 6);

    if (simple) el.classList.add("is-simple");

    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var facing = 1;
    var raf = 0;
    var scrollQueued = false;
    var LERP = simple ? 0.16 : 0.12;
    var STEPS = hoverNone ? 6 : 8;
    var HOP_AMP = simple ? 0 : (hoverNone ? 6 : 8);
    var L = null;

    function scrollProgress() {
      var doc = document.documentElement;
      var maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      return Math.min(1, Math.max(0, window.scrollY / maxScroll));
    }

    function layout() {
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var w = el.offsetWidth || 56;
      var h = el.offsetHeight || 60;
      var leftPad = Math.max(6, Math.min(12, vw * 0.02));
      /* Debajo del header sticky; margen inferior para no pelear con WA/safe-area */
      var topPad = 72;
      var bottomPad = vw <= 720 ? 36 : 24;
      var y0 = topPad;
      var y1 = Math.max(y0 + 8, vh - h - bottomPad);
      var zigAmp = simple ? 0 : Math.min(hoverNone ? 32 : 48, Math.max(18, vw * 0.07));
      return { w: w, h: h, leftPad: leftPad, y0: y0, y1: y1, zigAmp: zigAmp };
    }

    function pathAt(p) {
      var y = L.y0 + p * (L.y1 - L.y0);
      var x = L.leftPad;
      var face = 1;

      if (!simple && L.zigAmp > 0) {
        var phase = p * STEPS;
        /* Triángulo 0→amp→0: escalones / zigzag lateral */
        var tri = 1 - Math.abs((phase % 2) - 1);
        x = L.leftPad + tri * L.zigAmp;
        face = (phase % 2) < 1 ? 1 : -1;
        /* Saltito hacia arriba en cada escalón */
        var hop = Math.sin(phase * Math.PI);
        if (hop > 0) y -= hop * HOP_AMP;
      }

      return { x: x, y: y, facing: face };
    }

    function setTargetsFromScroll() {
      var pt = pathAt(scrollProgress());
      targetX = pt.x;
      targetY = pt.y;
      facing = pt.facing;
    }

    function applyTransform() {
      el.style.transform =
        "translate3d(" + currentX.toFixed(2) + "px," + currentY.toFixed(2) + "px,0)";
      if (img) {
        img.style.transform = simple ? "none" : "scaleX(" + facing + ")";
      }
    }

    function onScroll() {
      if (scrollQueued) return;
      scrollQueued = true;
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function tick() {
      scrollQueued = false;
      setTargetsFromScroll();

      var dx = targetX - currentX;
      var dy = targetY - currentY;
      currentX += dx * LERP;
      currentY += dy * LERP;
      applyTransform();

      if (Math.abs(dx) > 0.25 || Math.abs(dy) > 0.25) {
        raf = requestAnimationFrame(tick);
      } else {
        currentX = targetX;
        currentY = targetY;
        applyTransform();
        raf = 0;
      }
    }

    function hardSync() {
      L = layout();
      setTargetsFromScroll();
      currentX = targetX;
      currentY = targetY;
      applyTransform();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () {
      hardSync();
      onScroll();
    }, { passive: true });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
        scrollQueued = false;
      } else {
        hardSync();
        onScroll();
      }
    });

    hardSync();
    onScroll();
  })();

})();
