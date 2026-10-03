/* ==========================================================================
   Little Naturals — main.js
   Header, mobile menu, reveals, progress bar, page transitions, magnetic
   buttons, services tabs. Vanilla JS, no dependencies.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var LN = (window.LN = window.LN || {});
  LN.reduceMotion = function () { return reduceMotion.matches; };

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Header state + progress bar ---------- */
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".progress");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (header) header.classList.toggle("is-scrolled", y > 24);
      if (progress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.setProperty("--progress", max > 0 ? (y / max).toFixed(4) : 0);
      }
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobile-menu");
  function setMenu(open) {
    if (!toggle || !menu) return;
    root.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".menu-toggle__label").textContent = open ? "Close" : "Menu";
    menu.toggleAttribute("inert", !open);
    menu.setAttribute("aria-hidden", String(!open));
    if (open) {
      var first = menu.querySelector("a");
      if (first) setTimeout(function () { first.focus(); }, 250);
    }
  }
  if (toggle && menu) {
    menu.setAttribute("inert", "");
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("menu-open")) {
        setMenu(false);
        toggle.focus();
      }
      // keep Tab inside header toggle + menu while open
      if (e.key === "Tab" && root.classList.contains("menu-open")) {
        var items = [toggle].concat(Array.prototype.slice.call(menu.querySelectorAll("a")));
        var i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (m) {
      if (m.matches) setMenu(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }
  // Staggered groups: children get --i
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty("--i", i);
    });
  });

  /* ---------- Placeholder links (e.g. "Get directions") ----------
     Replace href="#" with the real URL and remove data-placeholder. */
  document.querySelectorAll("a[data-placeholder]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); });
  });

  /* ---------- Page-to-page fade ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a || reduceMotion.matches) return;
    if (window.CSSViewTransitionRule) return; // native cross-document view transition handles it
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== "_self") return;
    if (a.hasAttribute("download")) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin && location.protocol !== "file:") return;
    if (url.protocol !== location.protocol) return;
    if (url.pathname === location.pathname && url.hash) return; // same-page anchor
    if (!/\.html?$|\/$/.test(url.pathname)) return;
    e.preventDefault();
    document.body.classList.add("is-leaving");
    setTimeout(function () { location.href = a.href; }, 240);
  });
  // Restore when coming back via bfcache
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) document.body.classList.remove("is-leaving");
  });

  /* ---------- Magnetic buttons (desktop only) ---------- */
  if (finePointer.matches && !reduceMotion.matches) {
    document.querySelectorAll(".btn").forEach(function (btn) {
      var raf = 0;
      btn.addEventListener("pointermove", function (e) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var r = btn.getBoundingClientRect();
          var x = (e.clientX - (r.left + r.width / 2)) / r.width;
          var y = (e.clientY - (r.top + r.height / 2)) / r.height;
          btn.style.setProperty("--mx", (x * 8).toFixed(2) + "px");
          btn.style.setProperty("--my", (y * 6).toFixed(2) + "px");
        });
      });
      btn.addEventListener("pointerleave", function () {
        cancelAnimationFrame(raf);
        btn.style.setProperty("--mx", "0px");
        btn.style.setProperty("--my", "0px");
      });
    });
  }
})();
