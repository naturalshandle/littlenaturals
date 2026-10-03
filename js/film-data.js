/* ==========================================================================
   SCROLL FILM — chapter config for the home page film (js/scroll-film.js).
   Edit text, timecodes and buttons here, in one place.

   start / end   seconds in the film (0–10). Keep each chapter on ONE line as
                 "start: X, end: Y": scripts/prepare-film.sh reads these to
                 render the chapter posters (re-run it after changing them).
   side          where the card sits on desktop: "left" | "right" | "center",
                 chosen so it never covers faces or the softened wall text.
   eyebrow       small Cinzel label above the heading ("" for none).
   heading       chapter heading (an <h2>).
   neon          true = heading is lit in the Caveat neon style.
   body          short line under the heading ("" for none). {party} is
                 replaced with the birthday package facts from services-data.js.
   services      chips, by id from js/services-data.js: an item id
                 ("girls-braid") shows that item's name; a category id
                 ("boys-treatments") shows the category heading.
   extras        extra chips for facts that live elsewhere on the site.
   mobile        on phones a card shows the body OR the chips (space is tight):
                 "body" (default) or "chips".
   action        { label, href } — a link to parties.html opens the existing
                 party chooser automatically (js/party-chooser.js). null = none
                 (chapter 1 shows the "Scroll to step inside" cue instead).
   No prices anywhere.
   ========================================================================== */

window.LN_FILM = {
  duration: 10,
  fps: 24,
  frames: 240,
  // Scroll length, in % of the viewport height (vh). Each chapter gets
  // (its seconds × vhPerSecond), but never less than minVh; holdVh keeps the
  // last frame on screen a little before the film releases.
  vhPerSecond: { desktop: 60, mobile: 55 },
  minVh: 85,
  holdVh: 45,

  chapters: [
    { id: "welcome", name: "Welcome",
      start: 0.00, end: 1.50, side: "left",
      eyebrow: "Welcome to Little Naturals",
      heading: "Every little visit starts with a big hello.",
      body: "Kids' salon at Phoenix Mall. Haircuts, treatments, nails and a little sparkle.",
      services: [],
      action: null },

    { id: "girls", name: "For girls",
      start: 1.50, end: 3.15, side: "left",
      eyebrow: "For girls",
      heading: "Braids, curls & a little sparkle",
      body: "",
      services: ["girls-full-haircut", "girls-detangle", "girls-blow-dry", "girls-braid", "girls-hair-extension", "girls-hair-tinsel", "girls-treatments"],
      action: { label: "Explore girls' services", href: "services.html#girls" } },

    { id: "boys", name: "For boys",
      start: 3.15, end: 4.65, side: "left",
      eyebrow: "For boys",
      heading: "Fresh cuts, big grins",
      body: "",
      services: ["boys-haircut", "boys-trendy-custom-cut", "boys-wash-blow-dry", "boys-treatments", "extra-hair-spray-colour"],
      action: { label: "Explore boys' services", href: "services.html#boys" } },

    { id: "toddlers", name: "For toddlers",
      start: 4.65, end: 6.05, side: "left",
      eyebrow: "For toddlers",
      heading: "Baby's first haircut",
      body: "A gentle first trim, with a keepsake certificate if you'd like one.",
      services: ["baby-first-haircut-certificate"],
      action: { label: "See first haircut", href: "services.html#toddlers" } },

    { id: "mums", name: "For mums",
      start: 6.05, end: 7.60, side: "right",
      eyebrow: "For mums",
      heading: "Mom & Me",
      body: "Treat yourself while your little one is pampered.",
      services: ["mums-manicure", "mums-pedicure", "mums-pedicure-foot-spa"],
      mobile: "chips",
      action: { label: "See treatments for mums", href: "services.html#mums" } },

    { id: "parties", name: "Parties",
      start: 7.60, end: 9.20, side: "right",
      eyebrow: "Parties",
      heading: "Birthdays they'll remember",
      body: "{party}",
      services: ["extra-face-paint-shimmer", "extra-face-gem-stickers"],
      extras: ["Party styling", "Photo booth"],
      action: { label: "Plan a party", href: "parties.html" } },

    { id: "finale", name: "Be you. Be little.",
      start: 9.20, end: 10.00, side: "center",
      eyebrow: "",
      heading: "Be you. Be little.",
      neon: true,
      body: "",
      services: [],
      action: { label: "Book a Visit", href: "contact.html" } }
  ]
};
