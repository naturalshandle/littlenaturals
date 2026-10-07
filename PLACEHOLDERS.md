# Internal to-do: details still to fill

Not linked from the site. Nothing unfinished is visible on any page: empty values are hidden automatically.

## 1. Fill `js/site-config.js`

| Key | What to enter | Shows up in |
|---|---|---|
| `phone` | Salon phone number | Footer, home "Find us" card, contact page |
| `whatsapp` | International format, digits only (e.g. `971500000000`) | Footer and contact page. It also switches the booking form from the "show this at the front desk" message to the pre-filled WhatsApp flow. |
| `email` | Salon email | Footer, contact page |
| `instagram` | Handle (`littlenaturals`) or full URL | Footer, contact page |
| `address` | Currently `"Phoenix Mall"`. Add unit / floor if wanted. | Footer, home card, contact page |
| `hours` | e.g. `[{ days: "Mon–Sun", time: "10am–10pm" }]` | Footer, home card, contact page |
| `directionsUrl` | Google Maps link | "Get directions" buttons (home, contact, footer) |
| `domain` | e.g. `https://www.example.com` (no trailing slash) | Adds canonical, `og:url` and `og:image` tags automatically |

## 2. Once the domain is known

- Add `<link rel="canonical">`, `og:url`, `og:image` and `twitter:image` statically to each page's `<head>`. JS adds them from `domain`, but static tags are better for SEO. You can then switch `twitter:card` back to `summary_large_image`.
- Recreate `sitemap.xml` with the six page URLs and add `Sitemap: <domain>/sitemap.xml` to `robots.txt`. The sitemap was removed because it needs absolute URLs.
- Optionally add `url`, `telephone` and `openingHours` to the JSON-LD in `index.html` and `contact.html`.

## 3. Still to confirm with the client

- **Original vector logo.** The current logo is a temporary redraw.
- **Kids Play Wall and Photo Booth positions** on the floor plan. Both are currently left off the plan.
- **Photo booth reference board** (`references/photo-booth-reference.png`). It was never added, so colours are sampled from the renders.
- **KidsBoys font licence** for commercial use.
- **Party chooser copy:** the Birthday card mentions "glitter", which isn't on the menu. It was left as-is because that brief said not to change the chooser.
- **Spa party intro** mentions "soft music" and "in our pedicure lounge". Please confirm.
- **Girls' Superstar Package** still lists "hair curling or straightening" as an inclusion, although curling/straightening was removed as a separate service. Confirm whether the package still includes it.
- **Real photography** to replace the "Store design preview" renders.
- **Booking backend** (optional). See the comment at the top of `js/forms.js`.
- **Trust badges (home, "Our promise" band).** The five badges in `assets/badges/` are a temporary redraw made from the badge names only; the client's artwork (`references/badges.png`) was never added. Ask for the original vector files and replace them, keeping wording, icons and colours exactly as supplied.
- **Trust badge captions** are draft, confirm with client: "Products that are kind to animals." / "Chosen for little hair, skin and nails." / "Picked with parents in mind." / "Gentle formulas for gentle care." / "Quality products in every service."
