/* ==========================================================================
   Little Naturals — floorplan.js  (our-salon.html)
   Hotspots on the SVG floor plan open a side panel (desktop) or a bottom
   sheet (mobile) with the zone name, a one-line description and its render.

   ZONE IMAGES: each zone points at ONE image file in assets/images/.
   To swap a render, replace that file (keep the name) or change `img` here.
   ========================================================================== */
(function () {
  "use strict";

  var ZONES = {
    "entry-billing": {
      name: "Entry & Billing",
      desc: "Two open entries, a perforated-oak billing counter and the first glimpse of the retail display.",
      img: "zone-entry-billing", w: 720, h: 1125,
      alt: "Design render of the billing counter with a perforated oak front, hanging product strands and blue cubes."
    },
    "junior-styling": {
      name: "Junior Styling",
      desc: "Three backlit cactus mirrors against a butter-yellow fluted wall with a dashed helicopter drawing.",
      img: "zone-junior-styling", w: 1450, h: 1125,
      alt: "Design render of three cactus-shaped backlit mirrors and white styling chairs on a yellow fluted wall with a helicopter line drawing."
    },
    "sub-junior-styling": {
      name: "Sub-Junior Styling",
      desc: "Three arched mirrors with climbing-hold panels, yellow kids' chairs and a rainbow & giraffe mural.",
      illus: true
    },
    "hair-wash": {
      name: "Hair Wash",
      desc: "Two comfy wash chairs beneath a cloud arch that reads “Bubble up, Shine bright!!!”",
      img: "zone-hair-wash", w: 1180, h: 1125,
      alt: "Design render of two pale blue hair-wash chairs in front of a cloud-painted arch with the words Bubble up, Shine bright."
    },
    "ballpit": {
      name: "Kids Ball Pit & Climbing Wall",
      desc: "A curved ball pit beside a pegboard climbing wall topped with rainbow wallpaper arches.",
      img: "zone-ballpit-climbing", w: 820, h: 1125,
      alt: "Design render of a curved yellow ball pit in front of an oak pegboard climbing wall with rainbow-patterned arches."
    },
    "little-nails": {
      name: "Little Nails",
      desc: "A nail bar and nail art tables, “Look Nails” displays and the Colour of the Year wall.",
      img: "zone-little-nails", w: 2000, h: 1125,
      alt: "Design render of the nail area with a Colour Of The Year noughts-and-crosses polish wall, nail displays and oak nail tables."
    },
    "pedicure": {
      name: "Pedicure Lounge",
      desc: "Three pedicure stations under a glowing bear-face wall and the neon “Little Toes, Big Smiles”.",
      img: "zone-pedicure", w: 1672, h: 941,
      alt: "Design render of the pedicure lounge: a cream bench with three foot spas, a backlit bear-face sign and soft blue studded walls."
    },
    "retail": {
      name: "Retail",
      desc: "Hanging product strands with little glass shelves and wooden beads, plus retail display walls.",
      img: "zone-retail", w: 1740, h: 1125,
      alt: "Design render of hanging product strands with glass discs and wooden beads in front of the yellow fluted wall."
    }
  };

  var map = document.querySelector(".floorplan__map");
  var panel = document.getElementById("zone-panel");
  if (!map || !panel) return;

  var media = panel.querySelector(".zone-panel__media");
  var title = panel.querySelector(".zone-panel__title");
  var text = panel.querySelector(".zone-panel__text");
  var link = panel.querySelector(".zone-panel__link");
  var intro = panel.querySelector(".zone-panel__intro");
  var closeBtn = panel.querySelector(".zone-panel__close");
  var backdrop = document.querySelector(".sheet-backdrop");
  var illusTpl = document.getElementById("tpl-subjunior");
  var mobile = window.matchMedia("(max-width: 900px)");
  var hotspots = Array.prototype.slice.call(document.querySelectorAll("[data-zone]"));
  var lastTrigger = null;

  function render(id) {
    var z = ZONES[id];
    if (!z) return;
    media.innerHTML = "";
    media.classList.toggle("zone-panel__media--illus", !!z.illus);
    if (z.illus && illusTpl) {
      media.appendChild(illusTpl.content.cloneNode(true));
    } else {
      var img = new Image();
      img.src = "assets/images/" + z.img + "-800.webp";
      img.srcset = "assets/images/" + z.img + "-800.webp 800w, assets/images/" + z.img + "-1600.webp 1600w";
      img.sizes = "(max-width: 900px) 100vw, 40vw";
      img.width = 800;
      img.height = Math.round(800 * z.h / z.w);
      img.alt = z.alt;
      img.decoding = "async";
      media.appendChild(img);
    }
    title.textContent = z.name;
    text.textContent = z.desc;
    link.href = "#zone-" + id;
    link.hidden = false;
    if (intro) intro.hidden = true;
    panel.querySelector(".caption").hidden = !!z.illus;
  }

  function open(id, trigger) {
    lastTrigger = trigger || null;
    hotspots.forEach(function (h) {
      var on = h.getAttribute("data-zone") === id;
      h.classList.toggle("is-active", on);
      if (h.hasAttribute("aria-pressed")) h.setAttribute("aria-pressed", String(on));
    });
    panel.classList.add("is-swapping");
    setTimeout(function () {
      render(id);
      panel.classList.remove("is-swapping");
    }, 140);
    if (mobile.matches) {
      panel.classList.add("is-open");
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      backdrop.classList.add("is-open");
      document.documentElement.style.overflow = "hidden";
      setTimeout(function () { closeBtn.focus(); }, 60);
    }
  }

  function close() {
    panel.classList.remove("is-open");
    panel.removeAttribute("aria-modal");
    panel.setAttribute("role", "region");
    backdrop.classList.remove("is-open");
    document.documentElement.style.overflow = "";
    if (lastTrigger) lastTrigger.focus();
  }

  hotspots.forEach(function (h) {
    h.addEventListener("click", function () { open(h.getAttribute("data-zone"), h); });
    if (h.tagName.toLowerCase() === "g") {
      h.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(h.getAttribute("data-zone"), h); }
      });
    }
  });
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  link.addEventListener("click", function () { if (mobile.matches) close(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("is-open")) close();
    // simple focus trap inside the bottom sheet
    if (e.key === "Tab" && panel.classList.contains("is-open")) {
      var f = panel.querySelectorAll("button, a[href]:not([hidden])");
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  mobile.addEventListener("change", function (m) { if (!m.matches) close(); });
})();
