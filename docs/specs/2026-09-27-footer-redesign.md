# Footer Redesign (map above, fixed-height footer)

- **Date**: 2026-09-27
- **PR**: [#178](https://github.com/pablocolaiacovo/dzts-website/pull/178)
- **Status**: Implemented
- **Owner**: main agent (architect tier) — schema via `implementer`, UI via `ui-developer`

## Goal

Redesign the site footer so it carries the office's contact information in a structured way, and make the end of the home page (map + footer) fill exactly one viewport on desktop. Three visual options were prototyped; option 1 ("Mapa arriba, footer de altura fija") was chosen.

## Decisions

### Layout: map above, footer with fixed height

The home map (`#contacto`) stays as its own section above the footer. On ≥992px the footer has a fixed height (`--footer-height: clamp(340px, 44dvh, 400px)`) and the home map grows to fill the rest: `calc(100dvh - var(--header-height) - var(--footer-height))`, min 300px. On mobile the map is 320px and the footer has its natural height. The property detail map keeps its 450px height via `MapSection`'s default variant; the home opts in with `variant="footer"`.

### Footer structure

Three columns — **Marca** (logo, tagline, social icons) | **Contacto** (address, phone, email, office hours, "Escribinos por WhatsApp" CTA) | **Explorá** (`footerLinks` in two columns, certification logos) — plus a thin bottom bar with "© {year} {siteName} · {licenseNumber}" and the `creditLine`. Every item and column is hidden when its Sanity data is empty, so no empty headings render.

### Three new optional Sanity fields (no structured hours)

Everything else in the design already existed in `siteSettings` (`footerLinks` was queried but not rendered before). Added:

- `footerTagline` (text, "Pie de Página") — kept separate from `seo.description`, which is written for search snippets.
- `officeHours` (string, "Contacto") — free text shown on one line; a per-day structure would add editing friction for no display benefit.
- `licenseNumber` (string, "Pie de Página") — the editor enters the full text (e.g. "Matrícula CUCICBA N.º 0000").

### Mobile: fully centered

Below 992px the columns stack and everything is centered (logo, tagline, socials, contact items, links as a wrapping centered row, certifications, © bar), with a short centered rule between sections and a full-width 44px WhatsApp CTA. Chosen over a 2×2 contact-tile grid (tallest) and a `<details>` accordion (hides contact data, needs `::details-content` to stay open on desktop). The centered rules are the base styles and the `lg` block restores the desktop layout, which measures identical. Below 768px the © bar gets extra bottom padding so the fixed WhatsApp float doesn't cover it.

### AFIP "Data Fiscal" snippets in URL fields

AFIP provides the Data Fiscal badge as an HTML snippet, and editors paste it (whole or partially) into URL fields. `extractUrl()` (`src/lib/url.ts`) resolves `footerLinks[].url` and `certificationLogos[].url`: internal paths pass through, otherwise the `href` value or the first `http(s)://` URL is used, and unusable values are dropped. `certificationLogo.url` changed from `url` to `string` (with a custom validation requiring an `http(s)://` URL somewhere in the value) so the snippet can be pasted without a Studio error. The Data Fiscal badge is shown only as a certification logo, not also as a text link.

### No back-to-top button

The prototype had one in the bottom bar; it was dropped by request. `ScrollToTopButton.tsx` was only used by the footer and was deleted.

### `min-height` instead of `height` for the footer

On desktop the footer uses `min-height: var(--footer-height)` so long content grows instead of clipping. The trade-off: if the footer content exceeds the token, the home page scrolls slightly past one viewport.

### `--header-height` follows the scrolled header

The map height subtracts the header's scrolled height, so any mismatch shows a strip of the previous section between the header and the map. After the "Barra Alta" header (see `2026-09-27-header-barra-alta.md`) the bar is as tall as its logo, so `--header-height` is defined in `Header.css` from the same `--art-scrolled` value the logo animation uses: 52px / 64px (mobile / ≥992px) with `headerLogo`, and `--art-scrolled × --logo-compact-scale` (min 40px, the toggler) when only the compact logo exists (`:root:has(.header-logo-compact)`).

## Implementation

- `apps/studio/schemaTypes/siteSettingsType.ts` — `footerTagline`, `officeHours`, `licenseNumber`.
- `apps/frontend/src/sanity/queries/siteSettings.ts` + regenerated `types.ts` / `apps/studio/schema.json`.
- `apps/frontend/src/app/(site)/layout.tsx` — passes the new fields plus `whatsappNumber` / `whatsappMessage` to `Footer`.
- `apps/frontend/src/components/Footer.tsx` / `Footer.css` — rewritten. The WhatsApp CTA uses `TrackedLink` with `ANALYTICS_EVENT.whatsappContact` and `{ location: "footer" }`. Internal `footerLinks` (starting with `/`) use `next/link`; external ones open in a new tab.
- `apps/frontend/src/lib/url.ts` (+ test) — `extractUrl()` for footer and certification links.
- `apps/frontend/src/lib/whatsapp.ts` (+ test) — `buildWhatsAppUrl()` shared by the footer and `WhatsAppButton`.
- `apps/frontend/src/components/MapSection.tsx` / `MapSection.css` — inline styles moved to CSS; new `variant` prop. The home skeleton (`MapSectionFallback`) uses the same classes.
- `apps/frontend/src/styles/variables.css` — `--header-height`, `--footer-fg-muted`, `--footer-rule`, `--footer-height`.

## Operational notes

- Schema change: after merge, the Studio must be deployed (automatic on push to `main` via `deploy-studio.yml`) before editors see the new fields.
- Content to update in Sanity: fill `footerTagline`, `officeHours`, `licenseNumber`; shorten `creditLine` to just the developer credit (the © now lives on the left of the bottom bar); remove the "Data Fiscal" text link from `footerLinks` (it's already a certification logo) and add the site links used in the `development` dataset: "Propiedades en venta" (`/propiedades/?operacion=venta`), "Propiedades en alquiler" (`/propiedades/?operacion=alquiler`), "Servicios" (`/#servicios`), "Nosotros" (`/#nosotros`).
- GA4: `whatsapp_contact` events now include a new `location` value, `"footer"`.
- `TextImageSection.css` still hardcodes `scroll-margin-top: 60px`; it could use `--header-height` in a follow-up.
