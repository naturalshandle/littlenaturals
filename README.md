# Little Naturals — Kids Salon website

A static, multi-page site built with plain HTML, CSS and vanilla JavaScript. There is no build step, no npm and no framework.
Open `index.html` in a browser, or upload the folder to any static host.

```
index.html  services.html  our-salon.html  photo-booth.html  parties.html  contact.html
css/   tokens.css (colours, fonts, spacing)  base.css  components.css  pages.css  scroll-film.css
js/    site-config.js  main.js  effects.js  floorplan.js  gallery.js  services-data.js  services-menu.js
       forms.js  confetti.js  party-chooser.js  film-data.js  scroll-film.js  vendor/ (GSAP, Lenis)
assets/  logo.svg  logo-white.svg  favicon.svg  images/  svg/  film/
scripts/ prepare-film.sh  film-config.txt  (dev-time only, for the home page film)
references/  source files (not linked from the site)
```

Contact details (phone, WhatsApp, email, Instagram, hours, directions, domain) live in **`js/site-config.js`**. Empty values are hidden automatically. See **`PLACEHOLDERS.md`** for the to-do list.

---

## Edit the services menu

Everything is in **`js/services-data.js`**. It feeds the Services page (pill bar, search, "Book" links) and the booking form dropdown. No prices are shown anywhere.

```js
{
  id: "girls-blow-dry",            // unique category id
  audience: "girls",               // boys | girls | toddlers | nails | extras | mums | packages
  category: "Blow Dry for Girls",  // card heading
  icon: "hairdryer",               // scissors | hairdryer | braid | crown | droplet | leaf | polish | baby | sparkle
  items: [
    { id: "girls-blow-dry", name: "Blow Dry", note: "", lengths: ["Short", "Medium", "Long", "Very Long"] }
  ]
}
```

- **Item ids** must be unique. They're used in "Book" links (`contact.html?service=<id>`), which preselect the service in the booking form.
- `note` is optional ("what's included"). `lengths` shows as small chips.
- On package items, `highlight: true` adds the "Superstar" ribbon.
- Tabs (audiences) and their labels are in `LN_AUDIENCES` at the top of the file. Deep links work as `services.html#girls`.

## Home page scroll film

The top of `index.html` is a scroll-controlled film: scrolling plays a 10-second animation forwards (and backwards), with chapter cards beside it. It is an **animated illustration**, not footage of the store, and is captioned that way.

| File | What it is |
|---|---|
| `js/film-data.js` | **Edit this.** Chapter timecodes, card text, which services show as chips (ids from `services-data.js`), buttons, card side, scroll length. |
| `js/scroll-film.js`, `css/scroll-film.css` | The player and its styles. |
| `js/vendor/` | GSAP 3.12.5 + ScrollTrigger and Lenis 1.1.20 (pinned, local). Loaded only on the home page, after the visitor first scrolls. |
| `assets/film/desktop/`, `assets/film/mobile/` | The 240 frames (1600×900, and 900×1125 portrait for phones). Generated; don't edit by hand. |
| `assets/film/posters/` | First frame + the middle of each chapter. Used before the frames arrive, with reduced motion and on Save-Data connections. |
| `scripts/prepare-film.sh`, `scripts/film-config.txt` | Turn the source video into the files above (dev-time only). |

**Edit text or chapter timing:** change `js/film-data.js` and reload. Each chapter's `start`/`end` (seconds) decides which card shows over which part of the film. If you change timecodes, re-run the script so the chapter posters match.

**Replace the video:**
1. Put the new file at **`assets/film/source/little-naturals-journey.mp4`**. That folder is git-ignored, so the source video is never committed; keep a copy somewhere safe.
2. Install ffmpeg (Windows: `winget install Gyan.FFmpeg`, Mac: `brew install ffmpeg`).
3. Update `scripts/film-config.txt` (see below), then run `bash scripts/prepare-film.sh` (Git Bash on Windows). It takes about a minute.
4. Adjust the chapter timecodes in `js/film-data.js`.
5. Check the before/after proof images in `assets/film/source/build/proof/` (git-ignored).

**What the script does to every frame:** removes the audio, removes the generator's watermark (`logo` line in the config), and softens baked-in wall text with feathered blur patches that follow the text as the camera moves (`blur` lines: a few keyframed boxes per patch, measured frame by frame). It then exports both frame sets as WebP and the posters. `focus` keyframes steer the portrait crop for phones so faces stay in frame. A new video needs these re-measured; the comments at the top of `film-config.txt` explain the format.

**How it loads:** the first frame is a normal image in the HTML, so it shows instantly with the chapter 1 card. After the page has loaded and painted, every 8th frame is fetched (31 frames: about 1.2 MB desktop, 0.7 MB mobile), so scrubbing works right away. The remaining frames load once the visitor starts scrolling. Save-Data or 2G connections get the posters with crossfades instead. With `prefers-reduced-motion`, nothing is pinned or scrubbed: the chapters show as a simple list of posters and cards.

## Swap images

Each image is stored in two sizes, `name-800.webp` and `name-1600.webp`, in `assets/images/`. The file names follow the **zone**, not the PDF view, so swapping a render or adding real photos only means replacing files:

| File | Used for | Current source |
|---|---|---|
| `hero-*` | Home hero | PDF View 01, option 02 |
| `zone-entry-billing-*` | Entry & Billing | View 02 (right side) |
| `zone-junior-styling-*` | Junior Styling | View 07 |
| `zone-hair-wash-*` | Hair Wash | View 09 (right side) |
| `zone-ballpit-climbing-*` | Ball Pit & Climbing Wall | View 09 (left side) |
| `zone-kids-play-*` | Kids Play Wall | View 08 (left side) |
| `zone-little-nails-*` | Little Nails | View 04 |
| `zone-pedicure-*` | Pedicure Lounge | View 11, option 01 |
| `zone-retail-*` | Retail | View 03 (game poster cropped out) |
| `gallery-*` | Extra gallery shots | Views 05, 06, 10 (right side), 12 |
| `og-image.jpg` | Social share preview (1200 × 630) | Hero + logo |

Tips:
- Keep the same file names and export WebP at 800 px and 1600 px wide. If the new image has a different aspect ratio, update the `height` attribute on its `<img>`. The images sit in `object-fit: cover` frames, so small differences are fine.
- In `js/floorplan.js`, each zone has one `img` name plus `w`/`h`. Update them if you rename a file or change its shape.
- Once real photos are in, remove the "Store design preview" captions: search for `Store design preview`.
- **Sub-Junior Styling** is shown as an illustration because every render of that zone contains third-party character decals. Once a real photo exists, replace the illustration in `our-salon.html` (`#zone-sub-junior-styling`) and set `img` on that zone in `js/floorplan.js`.

## Contact details and domain

Fill in `js/site-config.js`. Each value appears on the site as soon as it's filled, and stays hidden while empty. Once `whatsapp` is set, the booking form switches to the pre-filled WhatsApp flow. See `PLACEHOLDERS.md` for what to do once the domain is known (static canonical/OG tags and `sitemap.xml`).

## Colours, fonts and the logo

- **Colours:** every colour is a custom property in `css/tokens.css`. Change a value there and the whole site follows. `--blue-deep` and `--brass` are for decoration only; they are too light for text.
- **Fonts:** Quicksand (headings), Nunito (body), Caveat (neon quotes only) and Cinzel (small spaced labels), loaded from Google Fonts in each page's `<head>`.
- **Logo:** the current logo is a **temporary redraw**. When the official vector arrives:
  - Replace `assets/logo.svg`, `assets/logo-white.svg` and `assets/favicon.svg`.
  - Replace the inline `<svg>` inside `<a class="brand">` at the top of each HTML file. Keep `class="logo-ink"` on the lettering and `class="logo-sprout"` on the sprout if you want the grow animation.

## Header and footer

These are repeated in each of the six HTML files, because a static site with no build step has no shared includes. If you change the nav or footer, make the same edit in all six files.

## Connect the booking form to a backend

Right now the form validates in the browser, then shows a success panel. When `SITE_CONFIG.whatsapp` is empty, the panel shows the details to present at the front desk; once it's filled, it offers a pre-filled WhatsApp message. To also store enquiries, follow the comment at the top of `js/forms.js`. It works with a `fetch()` to your endpoint, Formspree, Netlify Forms, Google Apps Script or a CRM.

## Deploy

Any static host works: Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, or cPanel file upload.

1. Upload everything **except** `references/`, `PLAN.md` and `PLACEHOLDERS.md`. They aren't linked, but there's no need to publish them.
2. Make sure `index.html` is at the web root.
3. Turn on gzip/brotli compression and long cache headers for `/assets`, `/css` and `/js` if your host doesn't do it automatically.
4. After the domain is live, recreate `sitemap.xml` (see `PLACEHOLDERS.md`) and submit it in Google Search Console.

## Accessibility and motion

- Semantic landmarks, a skip link, one `<h1>` per page, and alt text on every image.
- Visible keyboard focus. The floor plan, gallery lightbox, service menu, party chooser, mobile menu and bottom sheet all work with the keyboard (Enter/Space, arrow keys, Esc).
- `prefers-reduced-motion`: all animation stops and all content shows immediately. The home page film becomes a plain list of chapter posters and cards.
- If JavaScript is off, all content is still visible. Only the services tabs need JS, and they show a fallback note.
