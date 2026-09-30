(function () {
  "use strict";

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

  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (canHover) {
    document.querySelectorAll(".menu-card, .highlight-card, .contacto-card").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", event.clientX - rect.left + "px");
        card.style.setProperty("--mouse-y", event.clientY - rect.top + "px");
      });
    });
  }

  var filters = document.querySelectorAll(".filter-btn");
  var categories = document.querySelectorAll(".menu-category");

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
    });
  });

  var allFilter = document.querySelector('.filter-btn[data-filter="all"]');
  document.querySelectorAll(".clasicos a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (allFilter && !allFilter.classList.contains("is-active")) allFilter.click();
    });
  });
})();
