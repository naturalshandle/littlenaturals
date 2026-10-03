/* ==========================================================================
   Little Naturals — scroll-film.js
   Home page opening film: scroll scrubs a 240-frame WebP sequence drawn to a
   <canvas>, with chapter cards from js/film-data.js.

   - The stage is pinned with CSS position: sticky; GSAP ScrollTrigger reads
     the scroll progress (scrub 0.6 smoothing) and Lenis smooths the wheel.
     All three are loaded here, only when motion is allowed.
   - Frames load progressively: every 8th frame first (31 frames), then the
     gaps. The poster is in the HTML, so the first frame is instant.
   - Save-Data / 2G: no frames, chapter posters crossfade instead.
   - prefers-reduced-motion: no pinning or scrubbing; chapters become a list.
   ========================================================================== */
(function () {
  "use strict";

  var DATA = window.LN_FILM;
  var section = document.querySelector("[data-scroll-film]");
  if (!DATA || !section) return;

  var root = document.documentElement;
  var chapters = DATA.chapters;
  var FRAMES = DATA.frames, FPS = DATA.fps, DURATION = DATA.duration;
  var VENDOR = ["js/vendor/gsap-3.12.5.min.js", "js/vendor/ScrollTrigger-3.12.5.min.js", "js/vendor/lenis-1.1.20.min.js"];
  var PORTRAIT = "(max-width: 767px), (max-aspect-ratio: 1/1)"; // keep in sync with the <picture> in index.html

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var conn = navigator.connection || {};
  var lite = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || "");
  var portraitMQ = window.matchMedia(PORTRAIT);
  var phoneMQ = window.matchMedia("(max-width: 767px)");

  var stage = section.querySelector(".sf__stage");
  var media = section.querySelector(".sf__media");
  var canvas = section.querySelector(".sf__canvas");
  var fx = section.querySelector(".sf__fx");
  var cardsBox = section.querySelector(".sf__cards");
  var railList = section.querySelector(".sf__rail ol");
  var skip = section.querySelector(".sf__skip");
  var after = document.getElementById("after-film");

  /* ---------------- Content from the data files ---------------- */
  var names = {};
  (window.LN_MENU || []).forEach(function (cat) {
    names[cat.id] = cat.category;
    cat.items.forEach(function (it) { names[it.id] = it.name; });
  });
  function bodyText(ch) {
    var b = ch.body || "";
    if (b.indexOf("{party}") > -1) {
      var p = window.LN_BIRTHDAY_PACKAGE;
      b = b.replace("{party}", p ? p.name + ": " + p.guests + ", " + p.duration + "." : "");
    }
    return b;
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function posterPicture(name) { // chapter poster (static list / lite mode)
    var pic = document.createElement("picture");
    var src = document.createElement("source");
    src.media = PORTRAIT; src.srcset = "assets/film/posters/" + name + "-mobile.webp";
    var img = document.createElement("img");
    img.src = "assets/film/posters/" + name + "-desktop.webp";
    img.alt = ""; img.loading = "lazy"; img.decoding = "async";
    pic.appendChild(src); pic.appendChild(img);
    return pic;
  }

  var cards = chapters.map(function (ch, i) {
    var card = el("article", "sf-card");
    card.id = "film-" + ch.id;
    card.setAttribute("data-side", ch.side || "left");
    card.setAttribute("aria-labelledby", card.id + "-title");
    var chips = (ch.services || []).map(function (id) { return names[id]; }).filter(Boolean).concat(ch.extras || []);
    var body = bodyText(ch);
    if (ch.neon) card.classList.add("sf-card--neon");
    if (chips.length && body) card.classList.add("sf-card--mobile-" + (ch.mobile === "chips" ? "chips" : "body"));

    var panel = el("div", "sf-card__panel");
    panel.innerHTML = '<svg class="sf-card__arch" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 100A50 100 0 0 1 100 100" vector-effect="non-scaling-stroke"/></svg>';
    var n = 0;
    function add(node) { node.style.setProperty("--i", n++); panel.appendChild(node); }
    if (ch.eyebrow) add(el("p", "eyebrow", ch.eyebrow));
    var h = el("h2", "sf-card__title" + (ch.neon ? " neon" : ""), ch.heading);
    h.id = card.id + "-title";
    add(h);
    if (body) add(el("p", "sf-card__body", body));
    if (chips.length) {
      var ul = el("ul", "sf-card__chips");
      ul.setAttribute("role", "list");
      ul.setAttribute("aria-label", "Services");
      chips.forEach(function (c) { var li = el("li", "sf-chip", c); ul.appendChild(li); });
      add(ul);
    }
    if (ch.action && ch.action.href) {
      var p = el("p", "sf-card__action");
      var a = el("a", "btn btn--primary", ch.action.label);
      a.href = ch.action.href;
      p.appendChild(a);
      add(p);
    }
    card.appendChild(panel);
    cardsBox.appendChild(card);
    return card;
  });

  var dots = chapters.map(function (ch, i) {
    var li = el("li");
    var b = el("button", "sf-dot");
    b.type = "button";
    b.setAttribute("aria-label", "Chapter " + (i + 1) + ": " + ch.name);
    b.setAttribute("aria-controls", "film-" + ch.id);
    var lab = el("span", "sf-dot__label", ch.name);
    lab.setAttribute("aria-hidden", "true");
    b.appendChild(lab);
    li.appendChild(b);
    railList.appendChild(li);
    return b;
  });

  /* ---------------- Chapter state ---------------- */
  var current = -1;
  var neonLit = false, lastConfetti = 0;
  function setChapter(i, forward) {
    if (i === current) return;
    var prev = current;
    current = i;
    cards.forEach(function (c, k) {
      if (k === i) { c.classList.remove("is-leaving"); c.classList.add("is-active"); }
      else if (k === prev) {
        c.classList.remove("is-active"); c.classList.add("is-leaving");
        setTimeout(function () { if (current !== k) c.classList.remove("is-leaving"); }, 460);
      }
    });
    dots.forEach(function (d, k) {
      if (k === i) d.setAttribute("aria-current", "step"); else d.removeAttribute("aria-current");
    });
    if (prev !== -1) {
      bubbleWipe();
      if (lite) showLite(i);
    }
    if (i === chapters.length - 1) finale(forward);
  }
  function finale(forward) {
    var h = cards[cards.length - 1].querySelector(".neon");
    if (h && !neonLit) { neonLit = true; h.classList.add("is-lit"); }
    var now = performance.now();
    if (forward && window.LNConfetti && now - lastConfetti > 6000) {
      lastConfetti = now;
      var w = window.innerWidth, cols = window.LNConfetti.colors(["--butter", "--baby-blue", "--cream", "--glow"]);
      window.LNConfetti.burst({ x: w * 0.3, y: -10, angle: 75, spread: 50, count: 14, velocity: 5, colors: cols });
      window.LNConfetti.burst({ x: w * 0.7, y: -10, angle: 105, spread: 50, count: 14, velocity: 5, colors: cols });
    }
  }

  /* ---------------- Reduced motion: a calm list ---------------- */
  if (reduce) {
    section.classList.add("sf--static");
    cards.forEach(function (c, i) {
      var fig = el("figure", "sf-card__poster");
      fig.appendChild(posterPicture("chapter-" + (i + 1)));
      c.insertBefore(fig, c.firstChild);
      c.classList.add("is-active");
    });
    var h = cards[cards.length - 1].querySelector(".neon");
    if (h) h.classList.add("is-lit");
    return;
  }
  // Chapter 1 card is on screen straight away (no entrance animation on load)
  section.classList.add("sf--instant");
  setChapter(0, true);
  requestAnimationFrame(function () { requestAnimationFrame(function () { section.classList.remove("sf--instant"); }); });

  /* ---------------- Scroll length + time mapping ---------------- */
  var lens = [], cum = [], totalVh = 0, vh = window.innerHeight, lastW = window.innerWidth;
  function measure() {
    vh = stage.clientHeight || window.innerHeight;
    var per = phoneMQ.matches ? DATA.vhPerSecond.mobile : DATA.vhPerSecond.desktop;
    totalVh = 0;
    chapters.forEach(function (ch, i) {
      lens[i] = Math.max((ch.end - ch.start) * per, DATA.minVh);
      cum[i] = totalVh;
      totalVh += lens[i];
    });
    totalVh += DATA.holdVh;
    section.style.setProperty("--sf-length", Math.round(totalVh / 100 * vh + vh) + "px");
  }
  function timeAt(p) { // scroll progress 0..1 → film seconds + chapter
    var s = p * totalVh;
    for (var i = 0; i < chapters.length; i++) {
      if (s < cum[i] + lens[i]) {
        var ch = chapters[i], u = Math.max(0, (s - cum[i]) / lens[i]);
        return { t: ch.start + u * (ch.end - ch.start), i: i };
      }
    }
    return { t: DURATION, i: chapters.length - 1 };
  }
  function chapterY(i) { // where to land for chapter i
    var top = section.getBoundingClientRect().top + window.scrollY;
    var s = i === 0 ? 0 : cum[i] + lens[i] * (i === chapters.length - 1 ? 0.7 : 0.4);
    return top + s / 100 * vh;
  }

  /* ---------------- Frames ---------------- */
  var ctx = canvas.getContext("2d", { alpha: false });
  var set = "", frames = [], loading = 0, queue = [], gen = 0, firstLeft = 0;
  var want = 0, drawn = -1, dirty = true, cvW = 0, cvH = 0;
  // Loading order: nothing until the page has loaded (the poster is the first
  // frame), then the first pass (every 8th frame), then — once the visitor
  // starts scrolling — every remaining frame.
  var pageLoaded = false, interacted = false;
  function frameUrl(n) { return "assets/film/" + set + "/f" + ("00" + n).slice(-3) + ".webp"; }
  function startFrames() {
    var next = portraitMQ.matches ? "mobile" : "desktop";
    if (next === set) return;
    set = next; gen++; frames = new Array(FRAMES); queue = []; loading = 0; drawn = -1;
    section.classList.remove("is-playing");
    var seen = {};
    [8, 4, 2, 1].forEach(function (step, pass) {
      for (var n = 0; n < FRAMES; n += step) if (!seen[n]) { seen[n] = 1; queue.push({ n: n, first: pass === 0 }); }
      if (pass === 0 && !seen[FRAMES - 1]) { seen[FRAMES - 1] = 1; queue.push({ n: FRAMES - 1, first: true }); }
    });
    firstLeft = queue.filter(function (j) { return j.first; }).length;
    pump();
  }
  function pump() {
    var g = gen;
    while (pageLoaded && loading < 6 && queue.length) {
      if (!queue[0].first && (firstLeft > 0 || !interacted)) break;
      var job = queue.shift();
      loading++;
      load(job, g);
    }
  }
  function load(job, g) {
    var img = new Image();
    img.decoding = "async";
    if ("fetchPriority" in img) img.fetchPriority = job.first ? "high" : "low";
    img.src = frameUrl(job.n);
    var finish = function (ok) {
      if (g !== gen) return;
      loading--;
      if (job.first) firstLeft--;
      if (ok) {
        frames[job.n] = img;
        if (Math.abs(job.n - want) <= 8) { dirty = true; draw(); }
      }
      pump();
    };
    (img.decode ? img.decode() : new Promise(function (r, j) { img.onload = r; img.onerror = j; }))
      .then(function () { finish(true); }, function () { finish(false); });
  }
  function sizeCanvas() {
    var r = media.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (r.width * dpr > 2400) dpr = 2400 / r.width; // no sharper than the frames themselves
    var w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (w !== cvW || h !== cvH) { canvas.width = cvW = w; canvas.height = cvH = h; dirty = true; }
  }
  function nearest(n) {
    for (var d = 0; d < FRAMES; d++) {
      if (frames[n - d]) return n - d;
      if (frames[n + d]) return n + d;
    }
    return -1;
  }
  function draw() {
    var n = nearest(want);
    if (n < 0 || (n === drawn && !dirty)) return;
    var img = frames[n], iw = img.naturalWidth, ih = img.naturalHeight;
    var s = Math.max(cvW / iw, cvH / ih), dw = iw * s, dh = ih * s;
    var focusY = set === "mobile" ? 0.38 : 0.5; // faces sit in the upper half of the portrait frames
    ctx.drawImage(img, (cvW - dw) / 2, (cvH - dh) * focusY, dw, dh);
    drawn = n; dirty = false;
    if (!section.classList.contains("is-playing")) section.classList.add("is-playing");
  }

  /* ---------------- Lite mode (Save-Data / 2G): posters crossfade ---------------- */
  var liteImgs = [];
  function setupLite() {
    var box = el("div", "sf__lite");
    box.setAttribute("aria-hidden", "true");
    chapters.forEach(function (c, i) {
      var pic = posterPicture(i === 0 ? "first" : "chapter-" + (i + 1));
      var img = pic.querySelector("img");
      img.loading = "eager";
      box.appendChild(pic);
      liteImgs.push(img);
    });
    media.insertBefore(box, media.querySelector(".sf__vignette"));
  }
  function showLite(i) { liteImgs.forEach(function (img, k) { img.classList.toggle("is-on", k === i); }); }

  /* ---------------- Bubble wipe on chapter change ---------------- */
  var fctx = fx.getContext("2d"), bubbles = [], bRaf = 0, onScreen = true, fw = 0, fh = 0;
  var tint = (function () {
    var cs = getComputedStyle(root);
    function rgb(name) {
      var h = cs.getPropertyValue(name).trim().replace("#", "");
      if (h.length === 3) h = h.replace(/./g, "$&$&");
      var v = parseInt(h, 16);
      return [(v >> 16) & 255, (v >> 8) & 255, v & 255].join(",");
    }
    return { blue: rgb("--baby-blue"), glow: rgb("--glow"), deep: rgb("--blue-deep") };
  })();
  function sizeFx() {
    var r = stage.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 1.5);
    fw = r.width; fh = r.height;
    fx.width = Math.round(fw * d); fx.height = Math.round(fh * d);
    fctx.setTransform(d, 0, 0, d, 0, 0);
  }
  function bubbleWipe() {
    if (!onScreen) return;
    var count = phoneMQ.matches ? 4 : 7, now = performance.now();
    for (var k = 0; k < count; k++) {
      var r = (phoneMQ.matches ? 14 : 20) + Math.random() * (phoneMQ.matches ? 22 : 38);
      bubbles.push({
        x: fw * (0.05 + Math.random() * 0.9), y: fh + r + Math.random() * fh * 0.15,
        r: r, vx: (Math.random() - 0.5) * 0.12, vy: -(0.32 + Math.random() * 0.22),
        wob: Math.random() * 6.28, born: now + k * 70, life: 1700 + Math.random() * 700
      });
    }
    if (!bRaf) bRaf = requestAnimationFrame(tickBubbles);
  }
  function tickBubbles(now) {
    fctx.clearRect(0, 0, fw, fh);
    bubbles = bubbles.filter(function (b) { return now - b.born < b.life; });
    bubbles.forEach(function (b) {
      var age = now - b.born; if (age < 0) return;
      var k = age / b.life, a = Math.min(1, k * 5) * (1 - k) * 0.85;
      var x = b.x + b.vx * age + Math.sin(b.wob + age / 380) * 10, y = b.y + b.vy * age;
      var g = fctx.createRadialGradient(x, y, b.r * 0.5, x, y, b.r);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.7, "rgba(255,255,255," + 0.06 * a + ")");
      g.addColorStop(0.82, "rgba(" + tint.blue + "," + 0.45 * a + ")");
      g.addColorStop(0.9, "rgba(" + tint.glow + "," + 0.55 * a + ")");
      g.addColorStop(0.97, "rgba(" + tint.deep + "," + 0.35 * a + ")");
      g.addColorStop(1, "rgba(" + tint.deep + ",0)");
      fctx.fillStyle = g;
      fctx.beginPath(); fctx.arc(x, y, b.r, 0, 6.2832); fctx.fill();
      fctx.fillStyle = "rgba(255,255,255," + 0.75 * a + ")";
      fctx.beginPath(); fctx.ellipse(x - b.r * 0.38, y - b.r * 0.4, b.r * 0.16, b.r * 0.1, -0.6, 0, 6.2832); fctx.fill();
    });
    bRaf = bubbles.length && onScreen ? requestAnimationFrame(tickBubbles) : 0;
    if (!bRaf) fctx.clearRect(0, 0, fw, fh);
  }

  /* ---------------- Visibility: pause loops off-screen ---------------- */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      onScreen = en[0].isIntersecting;
      section.classList.toggle("is-offscreen", !onScreen);
    }).observe(section);
  }

  /* ---------------- Scrolling helpers (Lenis when ready) ---------------- */
  var lenis = null;
  function scrollToY(y) {
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }
  dots.forEach(function (d, i) { d.addEventListener("click", function () { scrollToY(chapterY(i)); }); });
  // Tabbing into a card that isn't on screen yet brings its chapter up
  cardsBox.addEventListener("focusin", function (e) {
    var i = cards.indexOf(e.target.closest(".sf-card"));
    if (i < 0 || i === current) return;
    if (lenis) lenis.scrollTo(chapterY(i), { immediate: true }); else window.scrollTo(0, chapterY(i));
  });
  if (skip && after) {
    skip.addEventListener("click", function (e) {
      e.preventDefault();
      var y = after.getBoundingClientRect().top + window.scrollY;
      if (lenis) lenis.scrollTo(y, { duration: 1.6, onComplete: function () { after.focus({ preventScroll: true }); } });
      else { window.scrollTo({ top: y, behavior: "smooth" }); after.focus({ preventScroll: true }); }
    });
  }

  /* ---------------- Rendering ---------------- */
  function renderP(p) {
    if (!totalVh) return; // not measured yet
    var at = timeAt(p);
    want = Math.min(FRAMES - 1, Math.round(at.t * FPS));
    if (!lite) draw();
    setChapter(at.i, at.i > current);
    section.style.setProperty("--sf-p", p.toFixed(4));
    section.classList.toggle("is-scrolled", p > 0.004);
  }
  function nativeP() {
    var dist = section.offsetHeight - vh;
    return dist > 0 ? Math.min(1, Math.max(0, -section.getBoundingClientRect().top / dist)) : 0;
  }
  // Until GSAP arrives, a plain scroll listener scrubs directly (no smoothing)
  var nativeScrub = function () { renderP(nativeP()); };
  window.addEventListener("scroll", nativeScrub, { passive: true });

  /* ---------------- Boot ---------------- */
  // Nothing heavy competes with the first paint: frames start after "load";
  // GSAP, ScrollTrigger, Lenis and the remaining frames wait for the first
  // scroll / touch / key press.
  if (lite) { setupLite(); showLite(0); }
  // Layout reads wait for the first frame: one layout pass instead of several
  requestAnimationFrame(function () {
    measure();
    if (!lite) { sizeCanvas(); startFrames(); }
    sizeFx();
    renderP(nativeP()); // e.g. page restored mid-film
  });

  // First pass starts once the page has loaded AND the poster has painted
  // (largest contentful paint), then the browser is idle — it never competes
  // with the first frame on screen.
  var go = function () {
    if (pageLoaded) return;
    pageLoaded = true;
    if ("requestIdleCallback" in window) requestIdleCallback(pump, { timeout: 1500 });
    else setTimeout(pump, 300);
  };
  var lcpSeen = false, loaded = document.readyState === "complete";
  var maybeGo = function () { if (lcpSeen && loaded) go(); };
  try {
    new PerformanceObserver(function () { lcpSeen = true; maybeGo(); })
      .observe({ type: "largest-contentful-paint", buffered: true });
  } catch (e) { lcpSeen = true; }
  setTimeout(function () { lcpSeen = true; maybeGo(); }, 2500); // browsers without LCP entries
  if (loaded) maybeGo(); else window.addEventListener("load", function () { loaded = true; maybeGo(); }, { once: true });

  var WAKE = ["scroll", "wheel", "touchstart", "pointerdown", "keydown"];
  function wake() {
    WAKE.forEach(function (t) { window.removeEventListener(t, wake, true); });
    interacted = true;
    pump();
    Promise.all(VENDOR.map(loadScript)).then(start, function () { /* keep native scrubbing */ });
  }
  WAKE.forEach(function (t) { window.addEventListener(t, wake, { capture: true, passive: true }); });

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src; s.async = false;
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  var ST = null, rt = 0;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var w = window.innerWidth;
      // ignore mobile URL-bar height changes; react to real resizes
      if (w !== lastW || Math.abs(window.innerHeight - vh) > 120) { lastW = w; measure(); if (ST) ST.refresh(); }
      if (!lite) { startFrames(); sizeCanvas(); dirty = true; draw(); }
      sizeFx();
    }, 150);
  });

  function start() {
    var gsap = window.gsap;
    ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });

    lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 0.9 });
    lenis.on("scroll", ST.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    // pause smooth scroll under the party chooser and the mobile menu
    var lockCheck = function () {
      if (root.classList.contains("pc-lock") || root.classList.contains("menu-open")) lenis.stop(); else lenis.start();
    };
    new MutationObserver(lockCheck).observe(root, { attributes: true, attributeFilter: ["class"] });

    // ScrollTrigger takes over from the native listener, with scrub smoothing
    window.removeEventListener("scroll", nativeScrub);
    var proxy = { p: 0 };
    var tw = gsap.fromTo(proxy, { p: 0 }, {
      p: 1, ease: "none",
      scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true },
      onUpdate: function () { renderP(proxy.p); }
    });
    tw.progress(tw.scrollTrigger.progress); // continue from where the native scrub was, no rewind

    // Ending: the film settles back as the pin releases into the page
    gsap.fromTo(media, { scale: 1, opacity: 1 }, {
      scale: 0.94, opacity: 0.55, ease: "none",
      scrollTrigger: { trigger: section, start: "bottom bottom", end: "bottom 35%", scrub: true }
    });
    gsap.fromTo(cardsBox, { opacity: 1 }, {
      opacity: 0, ease: "none",
      scrollTrigger: { trigger: section, start: "bottom bottom", end: "bottom 70%", scrub: true }
    });
  }
})();
