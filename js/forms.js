/* ==========================================================================
   Little Naturals — forms.js  (contact.html)
   Booking enquiry: client-side validation with friendly inline errors,
   success panel, and a pre-filled WhatsApp link.

   ── CONNECTING A REAL BACKEND LATER ─────────────────────────────────────
   Right now nothing is sent anywhere: on submit we validate, then build a
   WhatsApp message the parent can send themselves.
   To store enquiries, replace the block marked "SEND ENQUIRY" in
   handleSubmit() with a request to your endpoint, for example:

     fetch("https://YOUR-ENDPOINT/enquiries", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(data)
     }).then(function (res) { if (!res.ok) throw new Error(res.status); showSuccess(data); })
       .catch(function () { status.textContent = "Sorry, something went wrong. Please try WhatsApp instead."; });

   A form service (Formspree, Netlify Forms, Google Apps Script, your CRM)
   works the same way. Keep the WhatsApp button as a backup.
   ========================================================================== */
(function () {
  "use strict";

  /* WhatsApp number comes from js/site-config.js (SITE_CONFIG.whatsapp). While it is
     empty, the success panel asks the parent to show the details at the front desk. */
  var WHATSAPP_NUMBER = String((window.SITE_CONFIG && window.SITE_CONFIG.whatsapp) || "").replace(/\D/g, "");

  var form = document.getElementById("booking-form");
  if (!form) return;

  var success = document.getElementById("booking-success");
  var status = document.getElementById("form-status");
  var waLink = document.getElementById("wa-link");

  /* Fill the service dropdown from js/services-data.js: one <optgroup> per audience.
     Each option carries the item id (data-id) for ?service=<id> preselect. */
  var select = form.querySelector("#service");
  if (select && window.LN_MENU) {
    (window.LN_AUDIENCES || []).forEach(function (aud) {
      var group = document.createElement("optgroup");
      group.label = aud.label;
      window.LN_MENU.filter(function (c) { return c.audience === aud.id; }).forEach(function (cat) {
        cat.items.forEach(function (item) {
          var label = item.name;
          // packages share names ("Glow & Go"), so add who they're for
          if (aud.id === "packages") label += " — " + cat.category.replace(/^Packages for /, "");
          var o = document.createElement("option");
          o.value = label + " (" + aud.label + ")";
          o.textContent = label;
          o.setAttribute("data-id", item.id);
          group.appendChild(o);
        });
      });
      if (group.children.length) select.appendChild(group);
    });
    /* Party enquiries (linked from parties.html via ?party=birthday / ?party=spa) */
    var parties = document.createElement("optgroup");
    parties.label = "Parties";
    ["Birthday Party enquiry", "Spa Party enquiry"].forEach(function (name) {
      var o = document.createElement("option");
      o.value = name;
      o.textContent = name;
      parties.appendChild(o);
    });
    select.appendChild(parties);
    var other = document.createElement("option");
    other.value = "Not sure yet";
    other.textContent = "Not sure yet — please advise";
    select.appendChild(other);
  }

  /* Preselect a party enquiry from the URL, e.g. contact.html?party=birthday */
  var PARTY = {
    birthday: { service: "Birthday Party enquiry", message: "I'd like to know more about a birthday party." },
    spa: { service: "Spa Party enquiry", message: "I'd like to know more about a spa party." }
  };
  var params = new URLSearchParams(location.search);
  var partyKey = params.get("party");
  if (select && PARTY[partyKey]) {
    select.value = PARTY[partyKey].service;
    var msg = form.querySelector("#message");
    if (msg && !msg.value) msg.value = PARTY[partyKey].message;
  }

  /* Preselect a service from a "Book" link, e.g. contact.html?service=girls-blow-dry */
  var serviceId = params.get("service");
  if (select && serviceId) {
    var match = select.querySelector('option[data-id="' + serviceId.replace(/[^\w-]/g, "") + '"]');
    if (match) select.value = match.value;
  }

  /* Earliest selectable date = today */
  var dateInput = form.querySelector("#date");
  var today = new Date();
  var iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  if (dateInput) dateInput.min = iso;

  var rules = {
    parent: function (v) { return v.trim().length >= 2 || "Please tell us your name."; },
    phone: function (v) {
      var digits = v.replace(/[^\d]/g, "");
      if (!v.trim()) return "We need a number to confirm your visit.";
      return (/^[+\d][\d\s()-]*$/.test(v.trim()) && digits.length >= 8 && digits.length <= 15) ||
        "That number doesn't look quite right — please use digits, with a country code if needed.";
    },
    child: function (v) { return v.trim().length >= 1 || "What's your little one's name?"; },
    age: function (v) {
      if (v === "") return "Please add your child's age.";
      var n = Number(v);
      return (n >= 0 && n <= 16 && Math.round(n * 2) === n * 2) || "Please enter an age between 0 and 16 (half years are fine).";
    },
    service: function (v) { return v !== "" || "Pick a service, or choose “Not sure yet”."; },
    date: function (v) {
      if (!v) return "Please choose a preferred date.";
      return v >= iso || "Please choose today or a future date.";
    },
    time: function (v) { return v !== "" || "Please choose a preferred time."; }
  };

  function validateField(input) {
    var rule = rules[input.name];
    if (!rule) return true;
    var result = rule(input.value);
    var field = input.closest(".field");
    var err = field.querySelector(".field__error");
    var ok = result === true;
    field.classList.toggle("is-invalid", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    if (err) err.textContent = ok ? "" : result;
    return ok;
  }

  Array.prototype.forEach.call(form.elements, function (el) {
    if (!el.name || !rules[el.name]) return;
    el.addEventListener("blur", function () { if (el.value !== "") validateField(el); });
    el.addEventListener("input", function () {
      if (el.closest(".field").classList.contains("is-invalid")) validateField(el);
    });
  });

  form.addEventListener("submit", handleSubmit);

  function handleSubmit(e) {
    e.preventDefault();
    var firstBad = null;
    Object.keys(rules).forEach(function (name) {
      var el = form.elements[name];
      if (el && !validateField(el) && !firstBad) firstBad = el;
    });
    if (firstBad) {
      status.textContent = "A couple of details need a quick look.";
      firstBad.focus();
      return;
    }
    status.textContent = "";

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });

    /* ===== SEND ENQUIRY =====
       No backend yet — see the note at the top of this file. */
    showSuccess(data);
  }

  function prettyDate(v) {
    var d = new Date(v + "T00:00:00");
    return isNaN(d) ? v : d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }

  function showSuccess(data) {
    var lines = [
      "Hello Little Naturals! I'd like to book a visit.",
      "",
      "Parent: " + data.parent,
      "Phone: " + data.phone,
      "Child: " + data.child + " (age " + data.age + ")",
      "Service: " + data.service,
      "Preferred date: " + prettyDate(data.date),
      "Preferred time: " + data.time
    ];
    if (data.message) lines.push("", "Note: " + data.message);

    var viaWhatsApp = WHATSAPP_NUMBER.length > 0;
    Array.prototype.forEach.call(success.querySelectorAll("[data-success]"), function (el) {
      el.hidden = el.getAttribute("data-success") !== (viaWhatsApp ? "whatsapp" : "desk");
    });
    if (viaWhatsApp) {
      waLink.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      success.querySelector("[data-child]").textContent = data.child;
    } else {
      // No WhatsApp yet: show a summary to present at the front desk (nothing is sent)
      success.querySelector("[data-parent]").textContent = data.parent;
      var dl = success.querySelector(".booking-summary");
      dl.textContent = "";
      [["Child", data.child + " (age " + data.age + ")"], ["Service", data.service],
       ["Preferred date", prettyDate(data.date)], ["Preferred time", data.time], ["Phone", data.phone]]
        .concat(data.message ? [["Note", data.message]] : [])
        .forEach(function (pair) {
          var dt = document.createElement("dt"); dt.textContent = pair[0];
          var dd = document.createElement("dd"); dd.textContent = pair[1];
          dl.appendChild(dt); dl.appendChild(dd);
        });
    }
    form.hidden = true;
    success.hidden = false;
    success.focus();
  }

  var again = document.getElementById("booking-again");
  if (again) again.addEventListener("click", function () {
    form.reset();
    success.hidden = true;
    form.hidden = false;
    form.querySelector("input").focus();
  });
})();
