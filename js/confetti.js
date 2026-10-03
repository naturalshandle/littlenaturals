/* ==========================================================================
   Little Naturals — confetti.js
   Tiny, dependency-free confetti engine on one full-screen <canvas>.

   API:
     LNConfetti.burst({
       x, y,            // origin in viewport px
       angle: -90,      // direction in degrees (-90 = straight up)
       spread: 60,      // cone width in degrees
       count: 60,
       velocity: 14,    // initial speed (px per frame at 60fps)
       colors: [...]    // optional CSS colours; defaults to brand tokens
     });
     LNConfetti.colors(["--butter", "--glow"])  // resolve token names to colours

   Physics: initial velocity, gravity, air drag, spin, and an X-axis flip
   (flutter) on rectangles. The rAF loop stops and the canvas is cleared as
   soon as the last piece is gone. Does nothing with prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var canvas = null, ctx = null, pieces = [], raf = 0, dpr = 1, last = 0;

  var GRAVITY = 0.32, DRAG = 0.985, LIFE = 2600, FADE = 700;
  var BRAND = ["--butter", "--baby-blue", "--blue-deep", "--glow", "--oak", "--cream"];

  function token(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function colors(names) {
    return names.map(function (n) { return n.indexOf("--") === 0 ? token(n) : n; }).filter(Boolean);
  }
  function defaultColors() { return colors(BRAND); }

  function ensureCanvas() {
    if (canvas) return;
    canvas = document.createElement("canvas");
    canvas.className = "confetti-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
  }
  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function burst(opts) {
    if (reduce.matches) return;
    opts = opts || {};
    ensureCanvas();
    var palette = opts.colors && opts.colors.length ? colors(opts.colors) : defaultColors();
    var brass = token("--brass");
    var count = opts.count || 60;
    var angle = (opts.angle == null ? -90 : opts.angle) * Math.PI / 180;
    var spread = (opts.spread == null ? 60 : opts.spread) * Math.PI / 180;
    var speed = opts.velocity || 14;
    var now = performance.now();
    for (var i = 0; i < count; i++) {
      var a = angle + rand(-spread / 2, spread / 2);
      var v = speed * rand(0.55, 1.15);
      var r = Math.random();
      var shape = r < 0.5 ? "rect" : r < 0.75 ? "dot" : r < 0.9 ? "star" : "bubble";
      var color = palette[(Math.random() * palette.length) | 0];
      var size = shape === "bubble" ? rand(6, 11) : rand(4, 8);
      // a few small brass accents (default palette only)
      if (!opts.colors && brass && Math.random() < 0.06) { color = brass; size *= 0.7; }
      pieces.push({
        x: opts.x, y: opts.y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        rot: rand(0, Math.PI * 2), vr: rand(-0.25, 0.25),
        flip: rand(0, Math.PI * 2), vflip: rand(0.08, 0.22),
        size: size, shape: shape, color: color,
        born: now, life: LIFE * rand(0.75, 1.1)
      });
    }
    if (!raf) { last = now; raf = requestAnimationFrame(tick); }
  }

  function drawStar(s) {
    ctx.beginPath();
    for (var k = 0; k < 10; k++) {
      var rr = k % 2 ? s * 0.45 : s;
      var t = k * Math.PI / 5 - Math.PI / 2;
      ctx.lineTo(Math.cos(t) * rr, Math.sin(t) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }

  function tick(now) {
    var dt = Math.min((now - last) / 16.67, 3); // frame-rate independent
    last = now;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    var h = window.innerHeight + 40;
    for (var i = pieces.length - 1; i >= 0; i--) {
      var p = pieces[i];
      var age = now - p.born;
      if (age > p.life || p.y > h) { pieces.splice(i, 1); continue; }
      p.vx *= Math.pow(DRAG, dt);
      p.vy = p.vy * Math.pow(DRAG, dt) + GRAVITY * dt * (p.shape === "bubble" ? 0.35 : 1);
      p.x += p.vx * dt + Math.sin(p.flip) * 0.6 * dt; // gentle flutter drift
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.flip += p.vflip * dt;
      var alpha = age > p.life - FADE ? Math.max(0, (p.life - age) / FADE) : 1;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      if (p.shape === "rect") {
        ctx.scale(1, Math.cos(p.flip)); // flip on the X axis
        ctx.fillRect(-p.size / 2, -p.size * 0.9, p.size, p.size * 1.8);
      } else if (p.shape === "dot") {
        ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill();
      } else if (p.shape === "star") {
        drawStar(p.size * 0.8);
      } else { // bubble: a thin ring with a highlight
        ctx.globalAlpha = alpha * 0.8;
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(-p.size * 0.35, -p.size * 0.35, p.size * 0.22, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    if (pieces.length) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }
  }

  // Move the canvas into another container (e.g. an open <dialog>, which renders
  // in the top layer) so confetti can sit between the page and a modal card.
  function mount(parent) {
    ensureCanvas();
    (parent || document.body).appendChild(canvas);
  }

  window.LNConfetti = {
    burst: burst,
    mount: mount,
    colors: colors,
    isRunning: function () { return raf !== 0; },
    pieceCount: function () { return pieces.length; }
  };
})();
