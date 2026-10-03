# Little Naturals — Kids Salon · Website Plan (Phase 1)

Status: **approved 2026-09-30, built**. Decisions are recorded in §10.

---

## 0. Reference check

| File | Status |
|---|---|
| `references/LITTLE_NATURALS_PHOENIX_MALL_DESIGN_PRESENTATION_R01.pdf` | ✅ present, all 18 pages studied |
| `references/logo-reference.png` | ✅ present (224 × 128 px, low-res) |
| `references/photo-booth-reference.png` | ❌ **missing**. See Q1 |

### PDF page map (the page number ≠ the view number)

| PDF page | Content | Embedded image |
|---|---|---|
| 1 | Cover: soap bubble on clouds, "LITTLE NATURALS / DESIGN PRESENTATION" in spaced serif caps | stock-style bubble photo |
| 2 | Furniture layout, "AREA – 1287 SQ.FT" | 1955 × 1061 watercolour plan |
| 3 | "INTERIOR VIEWS" divider | – |
| 4 | View 01, option 01: entry, ribbon ceiling, sign **unlit** (gold) | 2000 × 1125 |
| 5 | View 01, option 02: same, sign **glowing warm** | 2000 × 1125 |
| 6 | View 02: billing counter, strands, nails, mural | 2000 × 1125 |
| 7 | View 03: strands, cactus mirrors, wash arch, **mobile-game poster** (right) | 2000 × 1125 |
| 8 | View 04: "Colour Of The Year" wall, "LOOK NAILS" displays, nail tables | 2000 × 1125 |
| 9 | View 05: nail tables, mural, cubes | 2000 × 1125 |
| 10 | View 06: top-down nail art table | 2000 × 1125 |
| 11 | View 07: junior styling, fluted wall, helicopter, cactus mirrors | 2000 × 1125 |
| 12 | View 08: Kids Play wall + sub-junior mirrors (**toy-film decals**) | 2000 × 1125 |
| 13 | View 09: climbing wall + ball pit, "Bubble up Shine bright!!!" wash arch | 2000 × 1125 |
| 14 | View 10: sub-junior mirror (**toy-film decals**, left) + pedicure lounge (right) | 2000 × 1125 |
| 15 | View 11, option 01: pedicure, **lego-stud** lower wall | 1672 × 941 |
| 16 | View 11, option 02: pedicure, **oak** lower wall | 1672 × 941 |
| 17 | View 12: top-down pedicure | 1672 × 941 |
| 18 | "Thank you" bubble slide | stock-style bubble photo |

The "VIEW 0X" labels are separate PDF text, not part of the images. I extract the embedded renders directly, so they come out with no labels and no crop needed to remove them.

---

## 1. Sitemap & sections

The header and footer are identical on every page.

**Header (sticky):** logo · Home · Services · Our Salon · Photo Booth · Parties · Contact · **Book a Visit** → `contact.html`. On scroll it shrinks and gets a cream blur backdrop. On mobile: a full-screen menu with the wave motif.

**Footer:** logo · brand line · nav · address, hours, phone/WhatsApp and Instagram placeholders · © auto year.

| Page | Sections |
|---|---|
| `index.html` | 1 Hero (ribbon ceiling + glowing sign + bubbles, headline, two buttons, arched View 01 crop) · 2 Offer marquee · 3 Brand promise (3 pillars) · 4 Zones preview (5 arched cards) · 5 "be you be little" neon teaser → Photo Booth · 6 Visit steps (4 numbered) · 7 Location band "Now open at Phoenix Mall" · 8 Final CTA + wave divider |
| `services.html` | Page hero · tabbed menu (Hair / Little Nails / Pedicure / Photo Booth / Packages) rendered from `js/services-data.js` · booking CTA |
| `our-salon.html` | 1 Interactive SVG floor plan + side panel / bottom sheet, "1,287 sq ft · Phoenix Mall" · 2 Zone-by-zone story (one section per zone, each with its own motif) · 3 Masonry gallery + lightbox |
| `photo-booth.html` | Illustrated booth hero (scalloped cloud arch, swaying swing, "be you be little" and "little star" neon, twinkling stars) · design elements row · "Perfect for" icons · Mom & Me block · tagline "Smile. Pose. Create. Share. Repeat." |
| `parties.html` | Intro · 3 package cards (all placeholders) · "What's included" illustrated list · enquiry CTA |
| `contact.html` | Booking enquiry form with validation, success panel and WhatsApp link · address/hours/phone placeholders · "Get directions" placeholder link (no map iframe) |

The services draft items are: kids' haircut, first haircut, toddler trim, hair wash & blow-dry, braids & styling (Hair tab); kids' manicure, nail art (Little Nails); kids' pedicure (Pedicure); photo booth session (Photo Booth); mom & me pamper (Packages). All are marked as a draft in `PLACEHOLDERS.md`.

---

## 2. Colour tokens

**How I sampled them:** I took bright-pixel medians from clean areas of the renders, and non-background pixels from the logo. The renders have a strong **warm lighting cast** (every blue reads grey-green, e.g. the pedicure tile samples as `#AEB5AA`). So for the render-sourced colours, the token is the sample white-balanced back to its intended material colour. The logo colours are taken directly.

| Token | Source (sample) | Raw sample | **Proposed token** | Brief approx. |
|---|---|---|---|---|
| `--cream` | floor tile V09 / logo background | `#FCE9C4` / `#F8F3F0` | **`#F7F0E4`** | `#F6EFE2` |
| `--sand` | lit wall plaster V04 | `#D0BE9B` (in shade) | **`#EBDDC4`** | `#EADCC3` |
| `--baby-blue` | pedicure tiles / lego studs / nail display boards | `#AEB5AA` `#ACB7AD` `#AFB9B8` | **`#B7CFDA`** | `#B7D0DC` |
| `--blue-deep` | logo sprout (no cast) | `#8AAAC2` | **`#8AAAC2`** | `#7FA6BE` |
| `--butter` | star cushions / kids' chairs / fluted wall | `#EED079` `#DFBF5F` `#D2BA78` | **`#F2D680`** | `#F3D98A` |
| `--glow` | lit ribbon faces / neon halo | `#F3F7E6` `#FFFFEA` | **`#FFEAB0`** | `#FFE9A8` |
| `--oak` | oak floor / billing counter | `#E4D1B3` `#AF9574` | **`#D6B88F`** | `#D8B88E` |
| `--brass` | chair bases | `#DEC79D` (lit) | **`#C9A45F`** | `#C8A35E` |
| `--ink` | logo lettering (no cast) | `#1C2D37` | **`#1E2F3D`** | `#1F3A5C` |
| `--white` | – | – | **`#FFFFFF`** | `#FFFFFF` |

**Contrast (WCAG AA), measured:**

| Pair | Ratio | Use |
|---|---|---|
| ink on cream | 12.1 : 1 ✅ | body text |
| ink on sand | 10.3 : 1 ✅ | section bands |
| ink on baby-blue | 8.5 : 1 ✅ | blue bands, cards |
| ink on butter | 9.6 : 1 ✅ | primary button |
| ink on white | 13.7 : 1 ✅ | cards |
| cream / glow on ink | 12.1 / 11.5 : 1 ✅ | dark neon sections, footer |
| blue-deep on cream | 2.2 : 1 ❌ | decoration only: link underlines, icons, dividers |
| brass on cream | 2.1 : 1 ❌ | decoration only |
| white on any light token | < 2.5 : 1 ❌ | never used for text |

Because of this, **links are ink text with a blue-deep underline**, not blue text. `--ink` is sampled from the logo and is darker and less saturated than the brief's `#1F3A5C` (see Q2).

The photo booth board is the named colour-theme source, and it's missing. Once it's added I'll re-sample and adjust these tokens before building.

---

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| Display / headings | **Quicksand 600–700** | Rounded geometric, closest to the logo's rounded terminals |
| Body | **Nunito 400 / 600** | – |
| Neon quotes only | **Caveat 600** | The render neon ("Little Toes Big Smiles") is a casual handwritten print, not a looped script, so Caveat is closer than Pacifico |
| Premium eyebrows | **Cinzel 400–500**, letter-spacing 0.3em | The cover lettering has flared Trajan-style capitals; Cinzel matches it better than Cormorant SC |

Fonts load from Google Fonts with `display=swap`, and each has a fallback stack. There is one `clamp()` type scale, from step −1 to step 6, defined in `tokens.css`.

**Logo:** the reference is a rounded humanist sans very close to Nunito. It has a double-storey "a", "little" in regular weight, "naturals" slightly heavier, and "KIDS SALON" in spaced capitals. The sprout is two **outlined** (stroke-only) leaves in blue-deep. Its stem curls down out of the "e" of "little" and hooks under it.

To make the SVG, I'll convert Nunito glyph outlines to paths once, with a Python `fontTools` script at dev time only; nothing ships. The sprout is drawn by hand. Deliverables: `logo.svg` (ink + blue-deep), `logo-white.svg`, and `favicon.svg` (the sprout mark on a cream rounded square). The reference is only 224 px wide, so the result is a faithful redraw, not a trace.

---

## 4. Image list

The sources are the extracted 2000 × 1125 renders (1672 × 941 for Views 11–12). Crops are given as source pixels `x0–x1, y0–y1`. Each crop is exported as WebP in two sizes, **800w** and **1600w**, or native width if the crop is narrower than 1600. Every image uses `srcset`, `width`/`height` and `loading="lazy"` below the fold, with the caption *"Store design preview"*.

| # | Web file | Source | Crop | Used on | Rule 4 note |
|---|---|---|---|---|---|
| 1 | `hero-entry` | View 01 opt 02 (p5) | x 400–1300, y 40–650 (wide arch) | Home hero | Crop stops above the sub-junior mirror tops (decals begin ≈ y 670) |
| 2 | `entry-billing` | View 02 (p6) | x 1280–2000, full height (portrait) | Our Salon: Entry & Billing, gallery | Left side (mural mirrors with decals) cropped out |
| 3 | `junior-retail` | View 03 (p7) | x 0–1740, full height | Our Salon: Retail, gallery | **Mobile-game poster (x ≈ 1775–1975) cropped out** |
| 4 | `nails-colour-wall` | View 04 (p8) | full frame | Home zone card (Little Nails), Our Salon: Little Nails, gallery | Clean |
| 5 | `nails-bar` | View 05 (p9) | x 0–1200, full height | Gallery | Sub-junior mirrors with decals (x ≈ 1240–1500) cropped out |
| 6 | `nails-table-top` | View 06 (p10) | x 620–1600, y 280–1125 | Gallery | Clean; the "% OFF / BOOK NOW" ad screen is cropped out so no offer is implied |
| 7 | `junior-styling` | View 07 (p11) | x 330–1780, full height | Home zone card (Styling), Our Salon: Junior Styling, gallery | Clean |
| 8 | `kids-play-wall` | View 08 (p12) | x 0–800, full height | Home zone card (Play Zone), Our Salon: Kids Play Wall, gallery | **Sub-junior mirrors with toy-film decals cropped out** |
| 9 | `ballpit-climb` | View 09 (p13) | x 0–820, full height | Our Salon: Ball Pit & Climbing Wall, gallery | Clean |
| 10 | `hair-wash` | View 09 (p13) | x 820–2000, full height | Our Salon: Hair Wash, gallery | Clean |
| 11 | `pedicure-bear` | View 10 (p14) | x 900–2000, full height | Our Salon: Pedicure, gallery | **Left half (mirror with toy-film decals) cropped out** |
| 12 | `pedicure-lounge` | View 11 opt 01 (p15) | full frame | Home zone card (Pedicure), gallery | Clean |
| 13 | `pedicure-top` | View 12 (p17) | full frame | Gallery | Clean |

**Excluded:**
- **View 10 left half** and **View 08 right of x 800**: toy-film character decals.
- **View 03 right edge**: mobile-game poster.
- **View 01 opt 01**: duplicate of opt 02 with the sign unlit.
- **View 11 opt 02**: duplicate of opt 01 (see Q4).
- **Pages 1 and 18 bubble photos**: these look like stock photography of unknown licence, so bubbles are built in CSS/SVG instead.
- **Page 2 watercolour plan**: redrawn as SVG instead.

**Sub-Junior Styling has no clean render.** All three arched mirrors carry "WOODY" badges and toy-film figures at the top and bottom, and they appear in Views 01, 02, 05, 08 and 10. By default this zone is shown with an illustrated panel instead of a photo: soft rainbow arcs, a balloon, clouds, and three arched mirror outlines with yellow chairs. The alternative is Q3.

The Photo Booth zone is also shown as illustration only, per the brief.

---

## 5. Floor plan (SVG redraw of page 2)

I'll redraw the trapezoid footprint in brand colours: cream floor, baby-blue walls and oak furniture blocks. Each zone is a focusable `<a>`/`<button>` hotspot that shows an outline glow on hover or focus. Clicking one opens a side panel on desktop, or a bottom sheet on mobile, with the zone name, a one-line description and its render. Esc closes it and focus returns to the hotspot.

| Hotspot | Position on the layout |
|---|---|
| Entry & Billing | Bottom: two entries, billing island, retail display above it |
| Junior Styling | Right wall, lower-middle, 3 mirrors |
| Hair Wash | Right, middle, 2 wash chairs |
| Kids Ball Pit & Climbing Wall | Right, upper, curved pit |
| Sub-Junior Styling | Left wall, upper-middle, 3 mirrors |
| Little Nails | Left, curved blue zone: nail bar + 4 nail art tables |
| Retail | Left wall retail displays + billing retail display |
| Pedicure Lounge | Top-left room, 3 stations |
| Kids Play Wall | **not labelled on the layout** (Q5) |
| Photo Booth & Content Creator | **not on the layout** (Q5) |

Counter, pantry, storage and "existing video wall" are drawn as neutral, unlabelled, non-interactive areas.

---

## 6. Motion map

All motion uses CSS keyframes/transitions, plus `IntersectionObserver` and `requestAnimationFrame` for pointer effects. Under `prefers-reduced-motion: reduce`, every item below is switched off and content shows in its final state. The `.reveal` hidden state is only applied when `<html class="js">` is set, so content stays visible if JS fails.

| Effect | Where | Reduced-motion fallback |
|---|---|---|
| Sprout grows (leaf scale + stroke draw), then hero text rises with a stagger | Header logo on page load; hero on every page | Static logo, text visible |
| Ribbon ceiling undulates (layered SVG ribbons, translate/skew keyframes) + pointer parallax (desktop, `pointer: fine` only) | Home hero; small version in page heroes | Static ribbons |
| Iridescent soap bubbles rise; click/tap pops them into sparkles | Home hero, Hair Wash story section, final CTA | No bubbles animate; a few static ones stay as decoration |
| Neon flicker-on when entering view, then a soft glow pulse | "be you be little" teaser, Pedicure "Little Toes, Big Smiles", Hair Wash "Bubble up, Shine bright!!!", Photo Booth neon | Steady glow, no flicker |
| Helicopter + clouds dashed line draws itself (`stroke-dashoffset`), rotor spins slowly | Our Salon: Junior Styling | Fully drawn, rotor still |
| Hanging product strands and blue cubes sway on scroll | Our Salon: Retail and Entry sections; Home zones band | Still |
| Swing sways; stars twinkle | Photo Booth hero | Still |
| Fade + 24px rise, staggered in card groups | All sections | Visible immediately |
| Arched cards lift + image zoom on hover | Zone cards, package cards | Colour/shadow change only |
| Buttons: soft glow + slight magnetic pull (desktop) | All primary buttons | Glow only |
| Wave dividers between colour bands | All pages | Static (they don't move anyway) |
| Butter-yellow scroll-progress bar | All pages | Kept (it is feedback, not decoration) |
| Page-to-page fade | Internal links | Instant navigation |

**Per-zone motif in the Our Salon story:**

| Zone | Motif |
|---|---|
| Entry & Billing | Perforated oak dot pattern |
| Junior Styling | Helicopter draw + fluted butter stripes + cactus mirror outline |
| Sub-Junior Styling | Rainbow arcs + balloon + clouds |
| Hair Wash | Bubbles + cloud arch |
| Ball Pit & Climbing | Pegboard dots + rainbow wallpaper arches |
| Kids Play Wall | Bead abacus row |
| Little Nails | "Colour of the Year" O/X grid |
| Pedicure Lounge | Neon flicker + lego-stud texture + bear-face outline (simple geometric circle-and-ears shape, not traced) |
| Photo Booth | Scalloped cloud arch + stars |
| Retail | Hanging strands with beads and glass discs |

---

## 7. Placeholders (all go into `PLACEHOLDERS.md`)

- `[PLACEHOLDER: domain]`: canonical URLs, OG URLs, sitemap, robots
- `[PLACEHOLDER: store address, Phoenix Mall]`: which Phoenix Mall/city, unit/floor
- `[PLACEHOLDER: opening hours]`
- `[PLACEHOLDER: phone number]`
- `[PLACEHOLDER: WhatsApp number]`: used in the `wa.me` link, international format without "+"
- `[PLACEHOLDER: Instagram handle/URL]`
- `[PLACEHOLDER: Google Maps directions link]`
- `[PLACEHOLDER: price]`: ×10 service items
- `[PLACEHOLDER: service duration]`: optional; shown only if you want durations
- **Draft service list** (10 items, section 1), needs confirmation
- `[PLACEHOLDER: party package name]` ×3, `[PLACEHOLDER: inclusions]` ×3, `[PLACEHOLDER: price]` ×3
- `[PLACEHOLDER: party enquiry details: minimum guests / booking notice]`, only if you want it shown
- `[PLACEHOLDER: OG share image]`: I'll generate one from the hero crop + logo; swap later if you like
- Real photography to replace every "Store design preview" render
- Backend endpoint for the booking form (commented in `js/forms.js`)

Copy I'll write myself (general, no claims): headlines, the three pillars, zone one-liners, visit steps, party intro. These are listed in `PLACEHOLDERS.md` as "draft copy, please review".

---

## 8. Tech notes

- **Stack:** plain HTML/CSS/vanilla JS as specified. The file structure follows brief section 7 exactly.
- **Dev-time only (not shipped):** Python + PyMuPDF/Pillow to extract and crop the renders and export WebP, and `fontTools` to outline the logo text. Neither is part of the site.
- **SEO:** unique title/description per page, OG + Twitter tags, canonical placeholder, `robots.txt`, `sitemap.xml`, `HairSalon` JSON-LD with placeholders, one `<h1>` per page.
- **Lighthouse:** I'll run it through a local static server with headless Chrome, if Chrome is available on this machine, and report the scores.

---

## 9. Questions

**Q1. Photo booth board (blocking for the Photo Booth page and the final colours).**
`references/photo-booth-reference.png` isn't in the project. Please add it. Until then, the Photo Booth page can only follow the brief's text description, and the colour tokens above come from the renders and logo only.

**Q2. Ink colour.**
The logo samples as `#1E2F3D`, a dark slate-navy. The brief suggests `#1F3A5C`, a bluer navy. Which one should I use: the logo sample (recommended, so the SVG logo and text match), or the brief value?

**Q3. Sub-Junior Styling image.**
Every render of that zone has toy-film decals.
- **(a)** Use an illustrated panel instead of a render. *(Default, and fully within the brief's "crop or don't use" rule.)*
- **(b)** Let me retouch the small decal areas in View 08 (paint them over with the surrounding mirror frame colour), so the real zone can be shown.

**Q4. Chosen design options.**
The PDF has two options for View 01 and View 11. I plan to use:
- **View 01 option 02**, with the glowing sign, which matches "warmly glowing sign".
- **View 11 option 01**, with the lego-stud lower wall, which matches the brief's "Lego-stud / soft-tile wall".

Are those the approved options?

**Q5. Floor-plan positions for two zones.**
- **Kids Play Wall:** View 08 suggests it sits on the left wall between Little Nails and Sub-Junior Styling. Is that right?
- **Photo Booth & Content Creator Area:** it isn't on the page-2 layout at all. Should it appear on the floor plan (and where), or be left off the plan and shown only on its own page?

**Q6. Digital screens in the renders.**
The nail-zone screens show mock ads ("Tropical Vibes", "NAIL ART … Larana, Inc.", "% OFF BOOK NOW"). They aren't characters, so I've kept them where they're small (Views 04, 05). Tell me if you'd rather I crop them out too.

---

## 10. Approved decisions (client answers, 2026-09-30)

| Q | Decision | Status in the build |
|---|---|---|
| Q1 | The photo booth board is to be added, re-sampled, and any colour changes shown | **Still pending.** `references/photo-booth-reference.png` was not in the project at build time. Tokens are from renders + logo (§2) and all live in `css/tokens.css`. |
| Q2 | `--ink` = logo sample `#1E2F3D` | Done |
| Q3 | (a) Illustrated panel for Sub-Junior Styling | Done (`sub-junior-illustration.svg`, inline on Our Salon + floor-plan panel) |
| Q4 | View 01 option 02 and View 11 option 01; one image reference per zone | Done. Images are named by zone (`hero-*`, `zone-pedicure-*`, …), so swapping means replacing a file. |
| Q5 | Photo Booth and Kids Play Wall left off the floor plan | Done. Both are listed in PLACEHOLDERS.md as "confirm with client". Kids Play stays in the story + gallery. |
| Q6 | Crop or blur all digital ad screens | Done. "Tropical Vibes" and "NAIL ART / Larana" screens are softened to blank lightboxes in Views 01, 04, 05 and the View 07 mirror reflection. The "% OFF / BOOK NOW" screen in View 06 is cropped out. |
| — | Logo redraw is temporary | Listed in PLACEHOLDERS.md ("original vector logo from client") |
