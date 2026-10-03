/* ==========================================================================
   Little Naturals — party-chooser.js
   Clicking any link to parties.html fires party poppers, blurs the page and
   opens a chooser: Birthday Party or Spa Party. Also handles arriving on
   parties.html#birthday / #spa-party (smooth scroll, highlight, small burst).

   • Without JS every link simply goes to parties.html.
   • Ctrl/Cmd/Shift/Alt/middle-click are left to the browser (new tab etc.).
   • Uses js/confetti.js when present; works without it.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mobile = window.matchMedia("(max-width: 640px)");
  var onPartiesPage = /(^|\/)parties\.html$/.test(location.pathname);
  var dialog = null, lastTrigger = null, busy = false;

  var OPTIONS = {
    birthday: { href: "parties.html#birthday", colors: ["--butter", "--glow", "--oak", "--cream"] },
    spa:      { href: "parties.html#spa-party", colors: ["--baby-blue", "--blue-deep", "--cream", "--glow"] }
  };

  function confetti(opts) {
    if (window.LNConfetti && !reduce.matches) window.LNConfetti.burst(opts);
  }

  /* ---------------- Link detection ---------------- */
  function partiesUrl(a) {
    if (!a || !a.href || a.hasAttribute("download") || a.hasAttribute("data-no-chooser")) return null;
    var url;
    try { url = new URL(a.href, location.href); } catch (e) { return null; }
    if (!/(^|\/)parties\.html$/.test(url.pathname)) return null;
    if (url.protocol !== location.protocol) return null;
    if (location.protocol !== "file:" && url.origin !== location.origin) return null;
    return url;
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a");
    var url = partiesUrl(a);
    if (!url) return;
    if (a.target && a.target !== "_self") return;
    if (dialog && dialog.contains(a)) return; // links inside the chooser behave normally
    if (url.hash) return;                     // deep links go straight to their section

    e.preventDefault();
    var menuWasOpen = closeMobileMenu();

    if (onPartiesPage) { // already here: just glide to the top
      window.scrollTo({ top: 0, behavior: reduce.matches ? "auto" : "smooth" });
      // the sticky header grows back near the top, which can leave a few px of scroll: settle it
      var settle = function () { if (window.scrollY > 0 && window.scrollY < 40) window.scrollTo(0, 0); };
      if ("onscrollend" in window) window.addEventListener("scrollend", settle, { once: true });
      else setTimeout(settle, 900);
      return;
    }
    // If the link lived in the (now inert) mobile menu, return focus to the menu button
    var trigger = menuWasOpen ? document.querySelector(".menu-toggle") : a;
    openChooser(trigger, a.getBoundingClientRect());
  }, true); // capture: runs before the site's page-fade handler

  function closeMobileMenu() {
    if (!root.classList.contains("menu-open")) return false;
    var toggle = document.querySelector(".menu-toggle");
    if (toggle) toggle.click();
    return true;
  }

  /* ---------------- Modal markup (built once, on first use) ---------------- */
  var BIRTHDAY_SVG =
    '<svg class="pc-illus" viewBox="0 0 200 150" aria-hidden="true" focusable="false">' +
      '<g class="pc-stars"><path class="pc-star" d="M28 30l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1Z"/><path class="pc-star" d="M176 22l1.6 3.6 3.8.6-2.8 2.6.8 3.8-3.4-2-3.4 2 .8-3.8-2.8-2.6 3.8-.6Z"/><path class="pc-star" d="M168 92l1.4 3 3.2.5-2.4 2.2.6 3.2-2.8-1.6-2.8 1.6.6-3.2-2.4-2.2 3.2-.5Z"/></g>' +
      '<g class="pc-balloons">' +
        '<g class="pc-bob" style="--d:3.2s;--dl:0s"><path class="pc-string" d="M62 64C60 80 70 90 92 104"/><ellipse class="pc-b1" cx="62" cy="42" rx="17" ry="21"/><path class="pc-b1" d="M58 62h8l-4 5Z"/><ellipse class="pc-shine" cx="55" cy="34" rx="4" ry="6"/></g>' +
        '<g class="pc-bob" style="--d:3.8s;--dl:-1.2s"><path class="pc-string" d="M100 50C98 70 102 88 98 104"/><ellipse class="pc-b2" cx="100" cy="28" rx="17" ry="21"/><path class="pc-b2" d="M96 48h8l-4 5Z"/><ellipse class="pc-shine" cx="93" cy="20" rx="4" ry="6"/></g>' +
        '<g class="pc-bob" style="--d:3.5s;--dl:-2.1s"><path class="pc-string" d="M138 62C140 80 128 92 104 104"/><ellipse class="pc-b3" cx="138" cy="40" rx="17" ry="21"/><path class="pc-b3" d="M134 60h8l-4 5Z"/><ellipse class="pc-shine" cx="131" cy="32" rx="4" ry="6"/></g>' +
      '</g>' +
      '<rect class="pc-cake-base" x="70" y="118" width="60" height="22" rx="5"/>' +
      '<path class="pc-icing" d="M70 124c5 5 10 5 15 0s10 5 15 0 10 5 15 0 10 5 15 0v-2a4 4 0 0 0-4-4H74a4 4 0 0 0-4 4Z"/>' +
      '<rect class="pc-candle" x="97" y="104" width="6" height="14" rx="2"/>' +
      '<path class="pc-flame" d="M100 91c4 5 4 9 0 12-4-3-4-7 0-12Z"/>' +
      '<rect class="pc-plate" x="62" y="139" width="76" height="4" rx="2"/>' +
    '</svg>';

  var SPA_SVG =
    '<svg class="pc-illus" viewBox="0 0 200 150" aria-hidden="true" focusable="false">' +
      '<g class="pc-bubbles">' +
        '<circle class="pc-bubble" cx="40" cy="110" r="7" style="--d:4.2s;--dl:0s"/>' +
        '<circle class="pc-bubble" cx="56" cy="120" r="4.5" style="--d:3.4s;--dl:-1.4s"/>' +
        '<circle class="pc-bubble" cx="150" cy="116" r="6" style="--d:4.6s;--dl:-0.6s"/>' +
        '<circle class="pc-bubble" cx="166" cy="122" r="4" style="--d:3.8s;--dl:-2.4s"/>' +
        '<circle class="pc-bubble" cx="140" cy="126" r="3.5" style="--d:3.1s;--dl:-1.9s"/>' +
      '</g>' +
      '<g class="pc-bear">' +
        '<circle cx="76" cy="36" r="12"/><circle cx="124" cy="36" r="12"/>' +
        '<circle cx="100" cy="66" r="36"/>' +
        '<circle class="pc-bear-eye" cx="87" cy="62" r="3.4"/><circle class="pc-bear-eye" cx="113" cy="62" r="3.4"/>' +
        '<ellipse class="pc-bear-eye" cx="100" cy="74" rx="5" ry="3.6"/>' +
        '<path class="pc-bear-mouth" d="M100 78v4M94 83c3 3 9 3 12 0"/>' +
      '</g>' +
      '<g class="pc-polish"><rect class="pc-polish-cap" x="33" y="118" width="12" height="12" rx="2"/><rect class="pc-polish-body" x="29" y="129" width="20" height="16" rx="4"/></g>' +
      '<path class="pc-cushion" d="M160 110l5 10 11 1.5-8 7.5 2 11-10-5.5-10 5.5 2-11-8-7.5 11-1.5Z"/>' +
    '</svg>';

  function optionHTML(key, title, neon, line, cta, svg) {
    var id = "pc-" + key;
    return '<a class="pc-opt pc-opt--' + key + '" href="' + OPTIONS[key].href + '" data-party="' + key + '"' +
             ' aria-labelledby="' + id + '-title" aria-describedby="' + id + '-line">' +
             '<span class="pc-opt__arch">' + svg +
               '<span class="neon neon-plate pc-opt__neon" aria-hidden="true">' + neon + '</span>' +
             '</span>' +
             '<span class="pc-opt__body">' +
               '<span class="pc-opt__title" id="' + id + '-title">' + title + '</span>' +
               '<span class="pc-opt__line" id="' + id + '-line">' + line + '</span>' +
               '<span class="btn btn--primary pc-opt__btn" aria-hidden="true">' + cta + '</span>' +
             '</span>' +
           '</a>';
  }

  function build() {
    dialog = document.createElement("dialog");
    dialog.className = "pc";
    dialog.setAttribute("aria-labelledby", "pc-title");
    dialog.setAttribute("aria-describedby", "pc-sub");
    dialog.innerHTML =
      '<div class="pc__veil" aria-hidden="true"></div>' +
      '<div class="pc__scroller">' +
        '<div class="pc__card" role="document">' +
          '<svg class="pc__waves" viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
            '<path d="M-10 30C80 6 160 54 250 30S420 6 510 30 610 40 610 40"/>' +
            '<path d="M-10 42C80 18 160 66 250 42S420 18 510 42 610 52 610 52"/>' +
          '</svg>' +
          '<button class="icon-btn pc__close" type="button" aria-label="Close party chooser">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="i-line" d="M6 6l12 12M18 6 6 18"/></svg>' +
          '</button>' +
          '<p class="eyebrow">Celebrate at Little Naturals</p>' +
          '<h2 class="pc__title" id="pc-title">What are we celebrating?</h2>' +
          '<p class="pc__sub" id="pc-sub">Pick a party and we’ll show you how it works.</p>' +
          '<div class="pc__options">' +
            optionHTML("birthday", "Birthday Party", "Make a wish!",
              "Haircuts, glitter, nail art, the photo booth and a room full of friends.",
              "Plan a birthday →", BIRTHDAY_SVG) +
            optionHTML("spa", "Spa Party", "Little Toes, Big Smiles",
              "Mini manicures, cosy pedicures and a calm, pampering afternoon with friends.",
              "Plan a spa party →", SPA_SVG) +
          '</div>' +
          '<p class="pc__foot"><a href="parties.html" data-no-chooser>Not sure yet? See all parties →</a></p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(dialog);

    dialog.querySelector(".pc__close").addEventListener("click", function () { closeChooser(); });
    // click outside the card (on the blurred area) closes
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog || e.target.classList.contains("pc__scroller")) closeChooser();
    });
    dialog.addEventListener("cancel", function (e) { e.preventDefault(); closeChooser(); }); // Esc
    dialog.addEventListener("keydown", trapTab);

    Array.prototype.forEach.call(dialog.querySelectorAll(".pc-opt"), function (opt) {
      opt.addEventListener("click", function (e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // allow new tab
        e.preventDefault();
        choose(opt);
      });
      // livelier illustration on hover/focus
      ["pointerenter", "focus"].forEach(function (t) { opt.addEventListener(t, function () { speed(opt, 2.2); }); });
      ["pointerleave", "blur"].forEach(function (t) { opt.addEventListener(t, function () { speed(opt, 1); }); });
    });
  }

  function speed(opt, rate) {
    if (!opt.getAnimations) return;
    opt.getAnimations({ subtree: true }).forEach(function (an) {
      if (an.animationName && /pc-(bob|rise)/.test(an.animationName)) an.playbackRate = rate;
    });
  }

  function focusables() {
    return Array.prototype.filter.call(
      dialog.querySelectorAll("a[href], button:not([disabled])"),
      function (el) { return el.offsetParent !== null || el === document.activeElement; });
  }
  function trapTab(e) {
    if (e.key !== "Tab") return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------------- Scroll lock (no layout jump) ---------------- */
  var lockPad = "";
  function lockScroll() {
    var sbw = window.innerWidth - root.clientWidth;
    lockPad = document.body.style.paddingRight;
    if (sbw > 0) document.body.style.paddingRight = sbw + "px";
    root.classList.add("pc-lock");
  }
  function unlockScroll() {
    root.classList.remove("pc-lock");
    document.body.style.paddingRight = lockPad;
  }

  /* ---------------- Open / close ---------------- */
  function openChooser(trigger, fromRect) {
    if (busy || (dialog && dialog.open)) return;
    if (!dialog) build();
    lastTrigger = trigger;
    dialog.classList.remove("is-closing", "is-choosing");
    Array.prototype.forEach.call(dialog.querySelectorAll(".pc-opt"), function (o) {
      o.classList.remove("is-chosen");
      o.style.removeProperty("--grow-x"); o.style.removeProperty("--grow-y"); o.style.removeProperty("--grow-s");
    });
    lockScroll();
    dialog.showModal();
    dialog.scrollTop = 0;
    dialog.querySelector(".pc__scroller").scrollTop = 0;
    dialog.querySelector(".pc-opt").focus({ preventScroll: true });

    if (window.LNConfetti && !reduce.matches) {
      window.LNConfetti.mount(dialog); // between the blurred page and the card
      var w = window.innerWidth, h = window.innerHeight, small = mobile.matches;
      var side = small ? 30 : 62, v = small ? 20 : 25;
      // steep enough to rise up the sides of the card, still angled toward the centre
      confetti({ x: 0, y: h, angle: -70, spread: 30, count: side, velocity: v });
      confetti({ x: w, y: h, angle: -110, spread: 30, count: side, velocity: v });
      if (fromRect && fromRect.width) {
        confetti({ x: fromRect.left + fromRect.width / 2, y: fromRect.top + fromRect.height / 2,
                   angle: 90, spread: 160, count: small ? 12 : 22, velocity: 7 });
      }
    }
  }

  function closeChooser() {
    if (!dialog || !dialog.open || busy) return;
    var finish = function () {
      dialog.close();
      dialog.classList.remove("is-closing");
      unlockScroll();
      if (window.LNConfetti) window.LNConfetti.mount(document.body);
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    };
    if (reduce.matches) { finish(); return; }
    dialog.classList.add("is-closing");
    setTimeout(finish, 200);
  }

  function choose(opt) {
    var key = opt.getAttribute("data-party");
    var href = opt.getAttribute("href");
    if (reduce.matches) { location.href = href; return; }
    busy = true;
    var r = opt.getBoundingClientRect();
    confetti({ x: r.left + r.width / 2, y: r.top + r.height * 0.35, angle: -90, spread: 120,
               count: mobile.matches ? 24 : 40, velocity: 11, colors: OPTIONS[key].colors });
    // grow the chosen card toward full screen
    var scale = Math.max(window.innerWidth / r.width, window.innerHeight / r.height) * 1.08;
    opt.style.setProperty("--grow-x", (window.innerWidth / 2 - (r.left + r.width / 2)).toFixed(1) + "px");
    opt.style.setProperty("--grow-y", (window.innerHeight / 2 - (r.top + r.height / 2)).toFixed(1) + "px");
    opt.style.setProperty("--grow-s", scale.toFixed(3));
    opt.classList.add("is-chosen");
    dialog.classList.add("is-choosing");
    setTimeout(function () { location.href = href; }, 460);
  }

  // Coming back via the back button (bfcache): reset everything
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted || !dialog) return;
    busy = false;
    if (dialog.open) dialog.close();
    dialog.classList.remove("is-closing", "is-choosing");
    unlockScroll();
    if (window.LNConfetti) window.LNConfetti.mount(document.body);
  });

  /* ---------------- parties.html: arriving on / jumping to a section ---------------- */
  var SECTIONS = { "birthday": OPTIONS.birthday.colors, "spa-party": OPTIONS.spa.colors };

  function celebrate(id, smooth) {
    var section = document.getElementById(id);
    if (!section) return;
    var heading = section.querySelector("[data-party-heading]") || section.querySelector("h2");
    var go = function () {
      section.scrollIntoView({ behavior: smooth && !reduce.matches ? "smooth" : "auto", block: "start" });
      var done = false;
      var after = function () {
        if (done) return; done = true;
        if (heading) {
          heading.classList.remove("is-highlight");
          void heading.offsetWidth; // restart the highlight animation
          heading.classList.add("is-highlight");
          var hr = heading.getBoundingClientRect();
          confetti({ x: hr.left + Math.min(hr.width, 420) / 2, y: hr.top + hr.height / 2, angle: -90, spread: 110,
                     count: mobile.matches ? 22 : 36, velocity: 10, colors: SECTIONS[id] });
        }
      };
      if ("onscrollend" in window && smooth && !reduce.matches) {
        window.addEventListener("scrollend", after, { once: true });
        setTimeout(after, 1200); // in case no scroll was needed
      } else {
        setTimeout(after, reduce.matches ? 0 : 500);
      }
    };
    go();
  }

  if (onPartiesPage) {
    var initial = location.hash.replace("#", "");
    if (SECTIONS[initial] && document.getElementById(initial)) {
      // start from the top, then glide down once the page has settled
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
      var start = function () { setTimeout(function () { celebrate(initial, true); }, 350); };
      if (document.readyState === "complete") start(); else window.addEventListener("load", start, { once: true });
    }
    // in-page jump buttons (#birthday / #spa-party)
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href").slice(1);
      if (!SECTIONS[id]) return;
      e.preventDefault();
      if (history.pushState) history.pushState(null, "", "#" + id);
      celebrate(id, true);
    });
  }
})();
