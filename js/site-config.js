/* ==========================================================================
   Little Naturals — SITE CONFIG
   Fill these in as the details become available. Anything left empty stays
   hidden on the site (no gaps, no placeholder text).
   ========================================================================== */
window.SITE_CONFIG = {
  phone: "",
  whatsapp: "",        // international format, digits only, e.g. "971500000000"
  email: "",
  instagram: "",       // handle ("littlenaturals") or full URL
  address: "Phoenix Mall",
  hours: [],           // e.g. [{ days: "Mon–Sun", time: "10am–10pm" }]
  directionsUrl: "",
  domain: ""           // e.g. "https://www.example.com" (no trailing slash)
};

/* --------------------------------------------------------------------------
   Renderer — you shouldn't need to edit below this line.

   Markup hooks (elements ship with the `hidden` attribute and are revealed
   only when their value is filled):
     data-config-show="phone whatsapp"  show if ANY listed value is non-empty
     data-config-text="phone"           set text to the value
     data-config-href="phone"           set href (tel:, wa.me, mailto:, instagram, url)
     data-config-hours                  render the opening hours as lines

   SEO: canonical / og:url / og:image tags are added from `domain` when it is
   set. For best results, once the domain is final also add them statically
   to each page's <head> and restore sitemap.xml (see PLACEHOLDERS.md).
   -------------------------------------------------------------------------- */
(function () {
  "use strict";
  var C = window.SITE_CONFIG;

  function has(key) {
    var v = C[key];
    return Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim());
  }
  function href(key) {
    var v = String(C[key] || "").trim();
    if (key === "phone") return "tel:" + v.replace(/[^\d+]/g, "");
    if (key === "whatsapp") return "https://wa.me/" + v.replace(/\D/g, "");
    if (key === "email") return "mailto:" + v;
    if (key === "instagram") return /^https?:/.test(v) ? v : "https://www.instagram.com/" + v.replace(/^@/, "") + "/";
    return v;
  }
  function text(key) {
    var v = String(C[key] || "").trim();
    if (key === "instagram" && !/^https?:/.test(v)) return "@" + v.replace(/^@/, "");
    return v;
  }

  function apply() {
    document.querySelectorAll("[data-config-show]").forEach(function (el) {
      var keys = el.getAttribute("data-config-show").split(/\s+/);
      el.hidden = !keys.some(has);
    });
    document.querySelectorAll("[data-config-text]").forEach(function (el) {
      var k = el.getAttribute("data-config-text");
      if (has(k)) el.textContent = text(k);
    });
    document.querySelectorAll("[data-config-href]").forEach(function (el) {
      var k = el.getAttribute("data-config-href");
      if (!has(k)) return;
      el.setAttribute("href", href(k));
      if (/^https?:/.test(href(k))) { el.target = "_blank"; el.rel = "noopener"; }
    });
    document.querySelectorAll("[data-config-hours]").forEach(function (el) {
      el.textContent = "";
      (C.hours || []).forEach(function (h) {
        var line = document.createElement("span");
        line.className = "config-line";
        line.textContent = [h.days, h.time].filter(Boolean).join(" · ");
        el.appendChild(line);
      });
    });

    if (has("domain")) {
      var base = String(C.domain).replace(/\/+$/, "");
      var path = location.pathname.split("/").pop();
      var url = base + "/" + (path === "index.html" ? "" : path);
      var head = document.head;
      var add = function (tag, attrs) {
        var el = document.createElement(tag);
        Object.keys(attrs).forEach(function (a) { el.setAttribute(a, attrs[a]); });
        head.appendChild(el);
      };
      add("link", { rel: "canonical", href: url });
      add("meta", { property: "og:url", content: url });
      add("meta", { property: "og:image", content: base + "/assets/images/og-image.jpg" });
      add("meta", { name: "twitter:image", content: base + "/assets/images/og-image.jpg" });
    }
  }

  window.LN_CONFIG = { has: has, href: href, text: text };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
