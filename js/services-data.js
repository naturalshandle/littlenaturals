/* ==========================================================================
   SERVICE MENU — edit everything here, in one place.
   Used by services.html (menu, search, "Book" links) and contact.html
   (booking dropdown + ?service=<item id> preselect).

   Shape of each category:
   {
     id:       unique category id
     audience: boys | girls | toddlers | nails | extras | mums | packages
     category: heading shown on the card
     icon:     scissors | hairdryer | braid | crown | droplet | leaf | polish | baby | sparkle
     items: [
       { id: unique item id (used in contact.html?service=<id>),
         name: service name,
         note: what's included (optional, "" if none),
         lengths: ["Short", "Medium", ...] (optional) }
     ]
   }
   No prices are shown anywhere on the site.
   ========================================================================== */

window.LN_AUDIENCES = [
  { id: "boys",     label: "Boys" },
  { id: "girls",    label: "Girls" },
  { id: "toddlers", label: "Toddlers" },
  { id: "nails",    label: "Nails & Pedicure" },
  { id: "extras",   label: "Fun Extras" },
  { id: "mums",     label: "For Mums", intro: "Treat yourself while your little one is pampered." },
  { id: "packages", label: "Packages" }
];

(function () {
var SML = ["Short", "Medium", "Long"];
var SMLV = ["Short", "Medium", "Long", "Very Long"];
var SL = ["Short", "Long"];

window.LN_MENU = [
  /* ---------------- Boys ---------------- */
  {
    id: "boys-hair", audience: "boys", category: "Hair Services for Boys", icon: "scissors",
    items: [
      { id: "boys-haircut", name: "Haircut" },
      { id: "boys-cut-fringe", name: "Cut Fringe" },
      { id: "boys-hair-trim", name: "Hair Trim" },
      { id: "boys-hair-fix", name: "Hair Fix", note: "Style correction" },
      { id: "boys-trendy-custom-cut", name: "Trendy Custom Cut" },
      { id: "boys-hair-wash", name: "Hair Wash" },
      { id: "boys-hair-blow-dry", name: "Hair Blow Dry" },
      { id: "boys-wash-blow-dry", name: "Hair Wash & Blow Dry" },
      { id: "boys-haircut-wash", name: "Haircut & Hair Wash" }
    ]
  },
  {
    id: "boys-treatments", audience: "boys", category: "Hair Treatments for Boys", icon: "leaf",
    items: [
      { id: "boys-anti-dandruff", name: "Anti-Dandruff Treatment", lengths: SL },
      { id: "boys-anti-lice", name: "Anti-Lice Treatment" }
    ]
  },

  /* ---------------- Girls ---------------- */
  {
    id: "girls-hair", audience: "girls", category: "Hair Services for Girls", icon: "scissors",
    items: [
      { id: "girls-full-haircut", name: "Full Haircut" },
      { id: "girls-hair-trim", name: "Hair Trim" },
      { id: "girls-hair-fringe", name: "Hair Fringe" },
      { id: "girls-detangle", name: "Detangle" },
      { id: "girls-hair-wash", name: "Hair Wash" }
    ]
  },
  {
    id: "girls-blow-dry", audience: "girls", category: "Blow Dry for Girls", icon: "hairdryer",
    items: [
      { id: "girls-blow-dry", name: "Blow Dry", lengths: SMLV }
    ]
  },
  {
    id: "girls-braids", audience: "girls", category: "Hair Braids & Extensions", icon: "braid",
    items: [
      { id: "girls-braid", name: "Braid" },
      { id: "girls-hair-extension", name: "Hair Extension" },
      { id: "girls-hair-tinsel", name: "Hair Tinsel", note: "Per piece" }
    ]
  },
  {
    id: "girls-treatments", audience: "girls", category: "Hair Treatments for Girls", icon: "leaf",
    items: [
      { id: "girls-anti-dandruff", name: "Anti-Dandruff Treatment", lengths: SML },
      { id: "girls-anti-lice", name: "Anti-Lice Treatment" }
    ]
  },

  /* ---------------- Toddlers ---------------- */
  {
    id: "toddlers-first-haircut", audience: "toddlers", category: "Baby's First Haircut", icon: "baby",
    items: [
      { id: "baby-first-haircut-certificate", name: "Baby First Haircut with Certificate" }
    ]
  },

  /* ---------------- Nails & Pedicure (kids) ---------------- */
  {
    id: "little-nails", audience: "nails", category: "Little Nails", icon: "polish",
    items: [
      { id: "nails-cut-file", name: "Cut & File" },
      { id: "nails-polish-change", name: "Polish Change" },
      { id: "nails-art-sticker", name: "Nail Art Sticker", note: "Per nail" },
      { id: "nails-cut-file-polish", name: "Cut, File & Polish" }
    ]
  },
  {
    id: "pedicure", audience: "nails", category: "Pedicure", icon: "droplet",
    items: [
      { id: "pedicure-basic", name: "Pedicure Basic", note: "Foot soak, cleaning, cut & file" },
      { id: "pedicure-polish", name: "Pedicure + Nail Polish", note: "Basic pedicure with nail polish application" }
    ]
  },

  /* ---------------- Fun Extras ---------------- */
  {
    id: "fun-extras", audience: "extras", category: "Fun Extras", icon: "sparkle",
    items: [
      { id: "extra-hair-spray-colour", name: "Hair Spray Colour" },
      { id: "extra-face-gem-stickers", name: "Face Gem Stickers" },
      { id: "extra-face-paint-shimmer", name: "Face Paint with Shimmer & Shine" }
    ]
  },

  /* ---------------- For Mums ---------------- */
  {
    id: "mums-nails", audience: "mums", category: "Nails for Mums", icon: "polish",
    items: [
      { id: "mums-manicure", name: "Manicure" },
      { id: "mums-pedicure", name: "Pedicure" },
      { id: "mums-basic-nail-cleaning", name: "Basic Nail Cleaning" },
      { id: "mums-polish-only", name: "Polish Only" },
      { id: "mums-pedicure-foot-spa", name: "Pedicure with Organic Foot Spa" }
    ]
  },

  /* ---------------- Packages ---------------- */
  {
    id: "packages-boys", audience: "packages", category: "Packages for Boys", icon: "crown",
    items: [
      { id: "pkg-boys-glow-go", name: "Glow & Go", note: "Hair wash, haircut, nail cut & file" },
      { id: "pkg-boys-superstar", name: "Superstar Package (Little Prince)", highlight: true,
        note: "Haircut, hair wash, blow dry, nail cut & file, hair spray colour" }
    ]
  },
  {
    id: "packages-girls", audience: "packages", category: "Packages for Girls", icon: "crown",
    items: [
      { id: "pkg-girls-glow-go", name: "Glow & Go", note: "Hair wash, blow dry & hand polish change", lengths: SML },
      { id: "pkg-girls-superstar", name: "Superstar Package", highlight: true, lengths: SML,
        note: "Haircut, blow dry, hair curling or straightening, polish change with 2 nail arts, one hair braid" }
    ]
  }
];
})();

/* Birthday party (shown on parties.html, not in the Services menu) */
window.LN_BIRTHDAY_PACKAGE = { name: "Birthday Party — Deluxe Package", guests: "10 to 16 guests", duration: "2.5 hours" };

/* Small line icons (decorative, inherit colour from CSS) */
window.LN_ICONS = {
  scissors: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g class="i-line"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 7.5 20 17M8 16.5 20 7"/></g></svg>',
  hairdryer: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g class="i-line"><path d="M4 8.5a5 5 0 0 1 5-5h6.5v10H9a5 5 0 0 1-5-5Z"/><circle cx="9" cy="8.5" r="1.8"/><path d="M11 13.5 12.5 21h3L14 13.5M15.5 5.5h3M15.5 8.5h4M15.5 11.5h3"/></g></svg>',
  braid: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g class="i-line"><path d="M12 2c3 2.5-3 4.5 0 7s-3 4.5 0 7-3 3.5 0 5"/><path d="M12 2c-3 2.5 3 4.5 0 7s3 4.5 0 7 3 3.5 0 5"/><path d="M10 21.5h4"/></g></svg>',
  crown: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g class="i-line"><path d="M3.5 17.5 2.5 7l5.5 4.5L12 5l4 6.5L21.5 7l-1 10.5Z"/><path d="M4 20.5h16"/></g></svg>',
  droplet: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g class="i-line"><path d="M12 3c3.8 5 6 8.3 6 11.2a6 6 0 0 1-12 0C6 11.3 8.2 8 12 3Z"/><path d="M9.2 14.5a2.9 2.9 0 0 0 2.8 2.8"/></g></svg>',
  leaf: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g class="i-line"><path d="M5 19C4 10 10 4.5 20 4c.5 10-5 16-14 15Z"/><path d="M5 19c3-5 6-8 10-10"/></g></svg>',
  polish: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g class="i-line"><rect x="7.5" y="10" width="9" height="11" rx="2"/><path d="M9.5 10V7h5v3M10.5 3h3v4h-3z"/></g></svg>',
  baby: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g class="i-line"><circle cx="12" cy="13" r="8"/><path d="M12 5c-1.5-1.5 0-3 1.5-2"/><circle cx="9.3" cy="12" r=".6"/><circle cx="14.7" cy="12" r=".6"/><path d="M9.8 16c1.3 1.1 3.1 1.1 4.4 0"/></g></svg>',
  sparkle: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g class="i-line"><path d="M12 3l2 6.5 6.5 2-6.5 2L12 20l-2-6.5L3.5 11.5l6.5-2Z"/><path d="M19 3v3M17.5 4.5h3"/></g></svg>'
};
