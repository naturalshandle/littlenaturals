/* ==========================================================================
   Little Naturals — services-menu.js  (services.html)
   Renders the service menu from js/services-data.js:
   audience pill bar (deep-linkable: services.html#girls), live search with
   highlighted matches, category cards with dotted-leader rows and length
   chips, package cards, and "Book" links → contact.html?service=<id>.
   ========================================================================== */
(function () {
  "use strict";

  var panel = document.getElementById("menu-panel");
  if (!panel || !window.LN_MENU || !window.LN_AUDIENCES) return;

  var AUD = window.LN_AUDIENCES;
  var MENU = window.LN_MENU;
  var ICONS = window.LN_ICONS || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var section = document.getElementById("menu");
  var bar = section.querySelector(".menu__bar");
  var nav = section.querySelector(".pills");
  var track = section.querySelector(".pills__track");
  var indicator = section.querySelector(".pills__indicator");
  var input = document.getElementById("menu-search");
  var status = document.getElementById("menu-status");
  var current = null;

  var TICK = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="i-line" d="m5 12.5 4.5 4.5L19 7.5"/></svg>';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function audience(id) { return AUD.filter(function (a) { return a.id === id; })[0]; }

  /* Text with <mark> around matches (built with DOM nodes, never innerHTML) */
  function marked(text, q) {
    var frag = document.createDocumentFragment();
    if (!q) { frag.appendChild(document.createTextNode(text)); return frag; }
    var lower = text.toLowerCase(), i = 0, at;
    while ((at = lower.indexOf(q, i)) !== -1) {
      if (at > i) frag.appendChild(document.createTextNode(text.slice(i, at)));
      frag.appendChild(el("mark", "", text.slice(at, at + q.length)));
      i = at + q.length;
    }
    if (i < text.length) frag.appendChild(document.createTextNode(text.slice(i)));
    return frag;
  }

  function chips(item, idx) {
    var ul = el("ul", "chips");
    if (!item.lengths || !item.lengths.length) { ul.setAttribute("aria-hidden", "true"); return ul; }
    ul.setAttribute("aria-label", "Lengths");
    item.lengths.forEach(function (len, j) {
      var li = el("li", "chip", len);
      li.style.setProperty("--j", j);
      ul.appendChild(li);
    });
    return ul;
  }

  function bookLink(item, cat, cls, label) {
    var a = el("a", cls);
    a.href = "contact.html?service=" + encodeURIComponent(item.id);
    a.appendChild(el("span", "", label || "Book"));
    a.appendChild(el("span", "visually-hidden", " " + item.name + ", " + cat.category));
    return a;
  }

  function row(item, cat, q) {
    var li = el("li", "svc-row");
    var main = el("div", "svc-row__main");
    var name = el("span", "svc-row__name"); name.appendChild(marked(item.name, q));
    main.appendChild(name);
    if (item.note) { var note = el("span", "svc-row__note"); note.appendChild(marked(item.note, q)); main.appendChild(note); }
    li.appendChild(main);
    var leader = el("span", "svc-row__leader"); leader.setAttribute("aria-hidden", "true");
    li.appendChild(leader);
    li.appendChild(chips(item));
    li.appendChild(bookLink(item, cat, "svc-row__book"));
    return li;
  }

  function card(cat, items, i, q, showAudience) {
    var c = el("article", "menu-card");
    c.style.setProperty("--i", i);
    var head = el("div", "menu-card__head");
    var badge = el("span", "menu-card__icon");
    badge.setAttribute("data-icon", cat.icon);
    badge.innerHTML = ICONS[cat.icon] || ""; // static SVG from services-data.js
    head.appendChild(badge);
    if (showAudience) head.appendChild(el("span", "menu-card__aud", audience(cat.audience).label));
    var h = el("h3", "", null); h.appendChild(marked(cat.category, q));
    h.id = "cat-" + cat.id;
    head.appendChild(h);
    c.setAttribute("aria-labelledby", h.id);
    c.appendChild(head);
    var ul = el("ul", "svc-list");
    items.forEach(function (item) { ul.appendChild(row(item, cat, q)); });
    c.appendChild(ul);
    return c;
  }

  function packageCard(cat, item, i) {
    var c = el("article", "pkg-card" + (item.highlight ? " is-star" : ""));
    c.style.setProperty("--i", i);
    if (item.highlight) c.appendChild(el("span", "pkg-card__ribbon", "★ Superstar"));
    var badge = el("span", "menu-card__icon"); badge.setAttribute("data-icon", cat.icon);
    badge.innerHTML = ICONS[cat.icon] || "";
    c.appendChild(badge);
    c.appendChild(el("p", "pkg-card__for", cat.category));
    var h = el("h3", "pkg-card__name", item.name); h.id = "pkg-" + item.id;
    c.setAttribute("aria-labelledby", h.id);
    c.appendChild(h);
    if (item.note) {
      var ul = el("ul", "pkg-card__list");
      ul.setAttribute("aria-label", "Includes");
      item.note.split(/,\s*/).forEach(function (part) {
        var li = el("li");
        li.innerHTML = TICK; // static icon
        li.appendChild(el("span", "", part.charAt(0).toUpperCase() + part.slice(1)));
        ul.appendChild(li);
      });
      c.appendChild(ul);
    }
    var ch = chips(item); ch.classList.add("chips--center"); c.appendChild(ch);
    c.appendChild(bookLink(item, cat, "btn btn--primary pkg-card__book", "Book"));
    return c;
  }

  /* ---------------- Rendering ---------------- */
  function renderAudience(id) {
    panel.textContent = "";
    var aud = audience(id);
    var headWrap = el("div", "menu__intro");
    headWrap.appendChild(el("p", "eyebrow", aud.label));
    if (aud.intro) headWrap.appendChild(el("p", "lede", aud.intro));
    panel.appendChild(headWrap);
    var cats = MENU.filter(function (c) { return c.audience === id; });
    if (id === "packages") {
      var grid = el("div", "pkg-grid"), n = 0;
      cats.forEach(function (cat) { cat.items.forEach(function (item) { grid.appendChild(packageCard(cat, item, n++)); }); });
      panel.appendChild(grid);
    } else {
      var g = el("div", "menu__grid" + (cats.length === 1 ? " menu__grid--single" : ""));
      cats.forEach(function (cat, i) { g.appendChild(card(cat, cat.items, i, "", false)); });
      panel.appendChild(g);
    }
    status.textContent = "";
  }

  function renderSearch(raw) {
    var q = raw.trim().toLowerCase();
    panel.textContent = "";
    var total = 0, g = el("div", "menu__grid"), i = 0;
    MENU.forEach(function (cat) {
      var catHit = cat.category.toLowerCase().indexOf(q) !== -1;
      var items = cat.items.filter(function (it) {
        return catHit || it.name.toLowerCase().indexOf(q) !== -1 || (it.note || "").toLowerCase().indexOf(q) !== -1;
      });
      if (!items.length) return;
      total += items.length;
      g.appendChild(card(cat, items, i++, q, true));
    });
    if (total) {
      panel.appendChild(g);
      status.textContent = total + (total === 1 ? " service matches " : " services match ") + "“" + raw.trim() + "”";
    } else {
      var empty = el("div", "menu__empty");
      empty.appendChild(el("p", "menu__empty-title", "No services match “" + raw.trim() + "”"));
      empty.appendChild(el("p", "", "Try another word, or ask us and we’ll help you pick."));
      var row2 = el("div", "btn-row");
      var clear = el("button", "btn btn--ghost", "Clear search"); clear.type = "button";
      clear.addEventListener("click", function () { input.value = ""; update(); input.focus(); });
      var ask = el("a", "btn btn--primary", "Book a Visit"); ask.href = "contact.html";
      row2.appendChild(clear); row2.appendChild(ask);
      empty.appendChild(row2);
      panel.appendChild(empty);
      status.textContent = "No services match";
    }
  }

  function update() {
    var searching = input.value.trim().length > 0;
    nav.classList.toggle("is-searching", searching);
    if (searching) renderSearch(input.value); else renderAudience(current);
  }

  /* ---------------- Pills + sliding indicator ---------------- */
  var pills = AUD.map(function (a) {
    var link = el("a", "menu-pill", a.label);
    link.href = "#" + a.id;
    link.setAttribute("data-aud", a.id);
    track.appendChild(link);
    return link;
  });

  function moveIndicator(animate) {
    var active = pills.filter(function (p) { return p.getAttribute("data-aud") === current; })[0];
    if (!active) return;
    if (!animate) indicator.style.transition = "none";
    indicator.style.setProperty("--x", active.offsetLeft + "px");
    indicator.style.setProperty("--w", active.offsetWidth + "px");
    if (!animate) { void indicator.offsetWidth; indicator.style.transition = ""; }
    // keep the active pill in view inside the horizontally scrolling bar
    var target = active.offsetLeft - (track.clientWidth - active.offsetWidth) / 2;
    track.scrollTo({ left: Math.max(0, target), behavior: animate && !reduce.matches ? "smooth" : "auto" });
  }

  function checkOverflow() {
    track.classList.toggle("is-overflowing", track.scrollWidth > track.clientWidth + 2);
    track.classList.toggle("at-start", track.scrollLeft < 4);
    track.classList.toggle("at-end", track.scrollLeft + track.clientWidth > track.scrollWidth - 4);
  }

  function select(id, opts) {
    opts = opts || {};
    if (!audience(id)) id = AUD[0].id;
    var changed = id !== current;
    current = id;
    pills.forEach(function (p) {
      if (p.getAttribute("data-aud") === id) p.setAttribute("aria-current", "true");
      else p.removeAttribute("aria-current");
    });
    moveIndicator(!opts.initial);
    if (input.value) input.value = "";
    if (changed || opts.initial) update();
    if (opts.scroll) scrollToMenu(opts.initial);
  }

  function scrollToMenu(instant) {
    var header = document.querySelector(".site-header");
    var offset = (header ? header.getBoundingClientRect().height : 60) + bar.offsetHeight + 12;
    var y = panel.getBoundingClientRect().top + window.scrollY - offset;
    if (instant || window.scrollY > y) {
      window.scrollTo({ top: y, behavior: instant || reduce.matches ? "auto" : "smooth" });
    }
  }

  track.addEventListener("click", function (e) {
    var p = e.target.closest(".menu-pill");
    if (!p || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    var id = p.getAttribute("data-aud");
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    select(id, { scroll: true });
  });
  track.addEventListener("scroll", checkOverflow, { passive: true });
  window.addEventListener("resize", function () { moveIndicator(false); checkOverflow(); });
  window.addEventListener("hashchange", function () {
    var id = location.hash.slice(1);
    if (audience(id)) select(id, { scroll: true });
  });

  input.addEventListener("input", update);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && input.value) { e.preventDefault(); input.value = ""; update(); }
  });

  /* ---------------- Start ---------------- */
  var fromHash = location.hash.slice(1);
  select(audience(fromHash) ? fromHash : AUD[0].id, { initial: true });
  checkOverflow();
  if (audience(fromHash)) {
    var go = function () { scrollToMenu(true); };
    if (document.readyState === "complete") go(); else window.addEventListener("load", go, { once: true });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveIndicator(false); checkOverflow(); });
})();
