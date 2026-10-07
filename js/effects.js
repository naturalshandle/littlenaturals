/* ==========================================================================
   Little Naturals — effects.js
   Soap bubbles, neon warm-up, ribbon parallax, helicopter line draw,
   trust badge stamp-in,
   strand/cube sway, twinkling stars. Every effect respects
   prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasIO = "IntersectionObserver" in window;

  function rand(min, max) { return min + Math.random() * (max - min); }

  function onView(els, cb, opts) {
    if (!els.length) return;
    if (!hasIO) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { cb(en.target); io.unobserve(en.target); }
      });
    }, opts || { threshold: 0.35 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Soap bubbles ----------
     <div class="bubbles" data-bubbles="10"></div>
     Decorative only: aria-hidden, not focusable. Click/tap pops them. */
  // Created after load + idle so they never compete with first paint.
  function whenIdle(fn) {
    var run = function () { ("requestIdleCallback" in window) ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 400); };
    if (document.readyState === "complete") run(); else window.addEventListener("load", run, { once: true });
  }
  whenIdle(function () { document.querySelectorAll("[data-bubbles]").forEach(initBubbles); });
  function initBubbles(box) {
    var count = parseInt(box.getAttribute("data-bubbles"), 10) || 8;
    if (window.innerWidth < 640) count = Math.ceil(count * 0.6);
    box.setAttribute("aria-hidden", "true");
    for (var i = 0; i < count; i++) box.appendChild(makeBubble(i, count, true));

    function makeBubble(i, n, initial) {
      var b = document.createElement("span");
      b.className = "bubble";
      var size = rand(22, 88);
      b.style.setProperty("--s", size.toFixed(0) + "px");
      b.style.setProperty("--hue", rand(0, 360).toFixed(0) + "deg");
      b.style.left = ((i + rand(0.1, 0.9)) / n * 100).toFixed(1) + "%";
      if (reduce) {
        // a few static bubbles, resting in place
        b.style.bottom = rand(10, 80).toFixed(0) + "%";
        b.style.opacity = "0.55";
      } else {
        b.style.setProperty("--d", rand(14, 26).toFixed(1) + "s");
        b.style.setProperty("--drift", rand(-40, 40).toFixed(0) + "px");
        b.style.setProperty("--delay", (initial ? -rand(0, 24) : rand(0, 3)).toFixed(1) + "s");
      }
      if (!reduce) b.addEventListener("pointerdown", pop);
      return b;
    }

    function pop(e) {
      var b = e.currentTarget;
      var boxRect = box.getBoundingClientRect();
      var r = b.getBoundingClientRect();
      var cx = r.left + r.width / 2 - boxRect.left;
      var cy = r.top + r.height / 2 - boxRect.top;
      for (var k = 0; k < 8; k++) {
        var s = document.createElement("span");
        s.className = "sparkle";
        var ang = (k / 8) * Math.PI * 2;
        var dist = r.width * 0.6 + rand(6, 22);
        s.style.left = cx + "px";
        s.style.top = cy + "px";
        s.style.setProperty("--tx", (Math.cos(ang) * dist).toFixed(0) + "px");
        s.style.setProperty("--ty", (Math.sin(ang) * dist).toFixed(0) + "px");
        box.appendChild(s);
        s.addEventListener("animationend", function () { this.remove(); });
      }
      var idx = Array.prototype.indexOf.call(box.querySelectorAll(".bubble"), b);
      b.remove();
      setTimeout(function () { box.appendChild(makeBubble(Math.max(idx, 0), count, false)); }, 1800);
    }
  }

  /* ---------- Neon signs: flicker on when in view ---------- */
  onView(Array.prototype.slice.call(document.querySelectorAll(".neon[data-neon], .sign, .booth-illus")), function (el) {
    el.classList.add("is-lit");
  }, { threshold: 0.5 });

  /* ---------- Ribbon ceiling pointer parallax (desktop) ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll(".ribbons").forEach(function (rib) {
      var host = rib.parentElement;
      var svg = rib.querySelector("svg");
      var raf = 0;
      host.addEventListener("pointermove", function (e) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var r = host.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5;
          var y = (e.clientY - r.top) / r.height - 0.5;
          svg.style.setProperty("--px", (x * -24).toFixed(1) + "px");
          svg.style.setProperty("--py", (y * -12).toFixed(1) + "px");
        });
      });
      host.addEventListener("pointerleave", function () {
        svg.style.setProperty("--px", "0px");
        svg.style.setProperty("--py", "0px");
      });
    });
  }

  /* ---------- Helicopter + clouds draw themselves ---------- */
  var helis = Array.prototype.slice.call(document.querySelectorAll(".heli"));
  if (reduce) helis.forEach(function (h) { h.classList.add("is-static"); });
  else onView(helis, function (h) { h.classList.add("is-in"); }, { threshold: 0.4 });

  /* ---------- Strands & cubes sway with scroll velocity ---------- */
  var strands = Array.prototype.slice.call(document.querySelectorAll(".strands"));
  if (strands.length && !reduce) {
    var lastY = window.scrollY, sway = 0, rafId = 0, settle = 0;
    var tick = function () {
      var y = window.scrollY;
      var v = y - lastY;
      lastY = y;
      sway += (Math.max(-14, Math.min(14, v)) * 0.35 - sway) * 0.12;
      strands.forEach(function (s) { s.style.setProperty("--sway", sway.toFixed(2)); });
      if (Math.abs(sway) > 0.02 || Math.abs(v) > 0) { settle = 0; rafId = requestAnimationFrame(tick); }
      else if (settle++ < 20) rafId = requestAnimationFrame(tick);
      else rafId = 0;
    };
    window.addEventListener("scroll", function () {
      if (!rafId) rafId = requestAnimationFrame(tick);
    }, { passive: true });
  }

  /* ---------- Trust badges: stamp in once + dots for the phone swipe row ---------- */
  var badgeRows = Array.prototype.slice.call(document.querySelectorAll("[data-badges]"));
  onView(badgeRows, function (row) { row.classList.add("is-stamped"); }, { threshold: 0.3 });
  badgeRows.forEach(function (row) {
    var items = Array.prototype.slice.call(row.children), raf = 0;
    var dots = document.createElement("div");
    dots.className = "badges__dots";
    dots.setAttribute("aria-hidden", "true");
    items.forEach(function () { dots.appendChild(document.createElement("span")); });
    row.parentNode.insertBefore(dots, row.nextSibling);
    function mark() {
      raf = 0;
      var mid = row.scrollLeft + row.clientWidth / 2, best = 0, gap = Infinity;
      items.forEach(function (it, i) {
        var d = Math.abs(it.offsetLeft + it.offsetWidth / 2 - mid);
        if (d < gap) { gap = d; best = i; }
      });
      Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle("is-on", i === best); });
    }
    row.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(mark); }, { passive: true });
    // keyboard-scrollable only while it actually is a swipe row
    var swipe = window.matchMedia("(max-width: 767px)");
    var sync = function () { if (swipe.matches) row.tabIndex = 0; else row.removeAttribute("tabindex"); mark(); };
    if (swipe.addEventListener) swipe.addEventListener("change", sync); else swipe.addListener(sync);
    sync();
  });

  /* ---------- Twinkling stars ----------
     <div class="stars" data-stars="14"></div> */
  document.querySelectorAll("[data-stars]").forEach(function (box) {
    var n = parseInt(box.getAttribute("data-stars"), 10) || 10;
    box.setAttribute("aria-hidden", "true");
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span");
      s.className = "star";
      s.style.left = rand(2, 96).toFixed(1) + "%";
      s.style.top = rand(4, 92).toFixed(1) + "%";
      s.style.setProperty("--s", rand(7, 18).toFixed(0) + "px");
      s.style.setProperty("--d", rand(2.2, 4.8).toFixed(1) + "s");
      s.style.setProperty("--delay", (-rand(0, 4)).toFixed(1) + "s");
      box.appendChild(s);
    }
  });
})();
