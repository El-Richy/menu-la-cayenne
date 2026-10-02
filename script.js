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

  /* Mascota multi-pose: se agarra a .menu-card al scroll (lerp + rAF) */
  (function initMascota() {
    var el = document.getElementById("mascota");
    if (!el) return;

    var img = el.querySelector("img");
    var POSES = {
      idle: "assets/mascota.png",
      hang: "assets/mascota-hang.png",
      jump: "assets/mascota-jump.png",
      cling: "assets/mascota-cling.png",
      reach: "assets/mascota-reach.png"
    };

    /* Prefetch poses (además de <link rel=preload> en HTML) */
    Object.keys(POSES).forEach(function (key) {
      var pre = new Image();
      pre.decoding = "async";
      pre.src = POSES[key];
    });

    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var cores = navigator.hardwareConcurrency || 8;
    /* Modo simple: save-data o CPU baja → 1 pose + translateY */
    var simple = !!(conn && conn.saveData) || cores <= 4;
    if (simple) el.classList.add("is-simple");

    var anchors = [];
    var baseLeft = 0;
    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var facing = 1;
    var raf = 0;
    var scrollQueued = false;
    var currentPose = simple ? "idle" : "hang";
    var activeIndex = 0;
    var lastScrollY = window.scrollY;
    var lastScrollT = performance.now();
    var velocity = 0;
    var LERP = simple ? 0.18 : 0.14;
    var JUMP_VEL = 900;
    var REACH_DIST = 70;
    var resizeTimer = 0;

    function setPose(next) {
      if (!img || next === currentPose) return;
      var src = POSES[next] || POSES.idle;
      if (img.getAttribute("src") !== src) {
        img.setAttribute("src", src);
      }
      currentPose = next;
      el.dataset.pose = next;
    }

    function measureBase() {
      var cs = window.getComputedStyle(el);
      baseLeft = parseFloat(cs.left) || 0;
    }

    function rebuildAnchors() {
      anchors = [];
      var cards = document.querySelectorAll(".menu-card");
      var sy = window.scrollY;
      var sx = window.scrollX;
      var i;
      for (i = 0; i < cards.length; i++) {
        var card = cards[i];
        var cat = card.closest(".menu-category");
        if (cat && cat.classList.contains("is-hidden")) continue;
        var r = card.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        anchors.push({
          docTop: r.top + sy,
          docLeft: r.left + sx,
          width: r.width,
          height: r.height,
          side: anchors.length % 2
        });
      }
    }

    function cardIndex() {
      if (!anchors.length) return 0;
      /* Línea de foco ~28% viewport: cards cuyo top ya pasó */
      var focus = window.scrollY + window.innerHeight * 0.28;
      var idx = 0;
      var k;
      for (k = 0; k < anchors.length; k++) {
        if (anchors[k].docTop <= focus) idx = k;
        else break;
      }
      return idx;
    }

    function targetFor(index, mw, mh) {
      if (!anchors.length) {
        return { x: 8, y: 96, pose: simple ? "idle" : "hang", face: 1 };
      }
      var a = anchors[Math.max(0, Math.min(anchors.length - 1, index))];
      var top = a.docTop - window.scrollY;
      var left = a.docLeft - window.scrollX;
      var x;
      var y;
      var pose;
      var face;

      if (simple) {
        /* Solo Y entre cards; X fija al lado izquierdo de la card */
        x = left - mw * 0.15;
        y = top - mh * 0.08;
        pose = "idle";
        face = 1;
      } else if (a.side === 0) {
        /* top-right → hang */
        x = left + a.width - mw * 0.62;
        y = top - mh * 0.1;
        pose = "hang";
        face = 1;
      } else {
        /* top-left / costado → cling */
        x = left - mw * 0.38;
        y = top - mh * 0.06;
        pose = "cling";
        face = -1;
      }

      /* No tapar WA (abajo-derecha) ni salirse del viewport */
      var maxX = window.innerWidth - mw - 10;
      var maxY = window.innerHeight - mh - 88;
      x = Math.max(4, Math.min(maxX, x));
      y = Math.max(64, Math.min(maxY, y));

      return { x: x - baseLeft, y: y, pose: pose, face: face };
    }

    function pickPose(settledPose, dist, vel, indexChanged) {
      if (simple) return "idle";
      var absV = Math.abs(vel);
      if (absV > JUMP_VEL || (indexChanged && absV > 420)) return "jump";
      if (dist > REACH_DIST) return "reach";
      return settledPose;
    }

    function applyTransform() {
      el.style.transform =
        "translate3d(" + currentX.toFixed(2) + "px," + currentY.toFixed(2) + "px,0)";
      if (img && !simple) {
        img.style.transform = "scaleX(" + facing + ")";
      } else if (img) {
        img.style.transform = "none";
      }
    }

    function setTargetsFromScroll() {
      var mw = el.offsetWidth || 56;
      var mh = el.offsetHeight || 60;
      var index = cardIndex();
      var indexChanged = index !== activeIndex;
      var pt = targetFor(index, mw, mh);

      /* Arco de salto si vamos rápido hacia otra card */
      var dist = Math.hypot(pt.x - currentX, pt.y - currentY);
      var pose = pickPose(pt.pose, dist, velocity, indexChanged);
      if (pose === "jump") {
        pt.y -= Math.min(36, 10 + dist * 0.12);
      }

      targetX = pt.x;
      targetY = pt.y;
      facing = pt.face;
      setPose(pose);
      activeIndex = index;
    }

    function onScroll() {
      var now = performance.now();
      var sy = window.scrollY;
      var dt = Math.max(8, now - lastScrollT);
      velocity = ((sy - lastScrollY) / dt) * 1000;
      lastScrollY = sy;
      lastScrollT = now;

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

      /* Amortiguar velocity cuando no hay scroll reciente */
      if (performance.now() - lastScrollT > 120) {
        velocity *= 0.85;
      }

      if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3 || Math.abs(velocity) > 40) {
        raf = requestAnimationFrame(tick);
      } else {
        currentX = targetX;
        currentY = targetY;
        /* Al asentarse, pose hang/cling definitiva */
        if (!simple && anchors.length) {
          var settled = anchors[activeIndex] && anchors[activeIndex].side === 0 ? "hang" : "cling";
          setPose(settled);
        }
        applyTransform();
        raf = 0;
      }
    }

    function hardSync() {
      measureBase();
      rebuildAnchors();
      setTargetsFromScroll();
      currentX = targetX;
      currentY = targetY;
      applyTransform();
    }

    function scheduleRebuild() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        hardSync();
        onScroll();
      }, 120);
    }

    /* prefers-reduced-motion: fija en primera card */
    if (reduceMotion.matches) {
      el.classList.add("is-static");
      measureBase();
      rebuildAnchors();
      setPose(simple ? "idle" : "hang");
      var mw0 = el.offsetWidth || 56;
      var mh0 = el.offsetHeight || 60;
      var pin = targetFor(0, mw0, mh0);
      currentX = targetX = pin.x;
      currentY = targetY = pin.y;
      facing = pin.face;
      applyTransform();
      window.addEventListener("resize", scheduleRebuild, { passive: true });
      window.addEventListener("orientationchange", scheduleRebuild, { passive: true });
      return;
    }

    setPose(currentPose);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleRebuild, { passive: true });
    window.addEventListener("orientationchange", scheduleRebuild, { passive: true });

    document.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        requestAnimationFrame(function () {
          rebuildAnchors();
          onScroll();
        });
      });
    });

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
