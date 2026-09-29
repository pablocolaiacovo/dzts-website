# Header redesign — "Barra Alta"

- **Date**: 2026-09-27
- **PR**: #179
- **Status**: Implemented
- **Owner**: implementer agent (Sonnet tier)

## Goal

Replace the header's fixed-size single logo with a two-state lockup: a tall
lockup (with the "inmobiliaria" tagline) shown at rest, that shrinks and
crossfades into the current compact logo as the visitor scrolls. Approved
from a set of HTML prototypes; this spec ports the chosen "Opción 1 — Barra
Alta" prototype into the codebase. The header keeps a solid background and
`position: sticky` on every page, including `/`.

## Decisions

### Two logos, one grid cell, CSS-only crossfade

`.header-logo` is a CSS grid with a single row; `.logo-full` and
`.logo-compact` both occupy `grid-area: 1 / 1` so they stack instead of
flowing side by side. Scroll-driven animations (`animation-timeline:
scroll(root)`) crossfade opacity between the two images and shrink the
navbar's padding and the logo box's height as the page scrolls the first
~120px. No JavaScript scroll listener is needed — this is the same technique
the existing `shrink-navbar`/`shrink-logo` animations already used, extended
to two images instead of one.

Art height: mobile 56px (full) → 52px (compact) at rest/scrolled; `lg`+ 82px →
64px. When the tall lockup's tagline area disappears, the box's height drops
by more than the compact image needs, so a negative `margin-bottom` (`-25.4%`
of the scrolled height) recovers the freed space and keeps the bar visually
balanced — ported as-is from the prototype's measurements.

### Sequential fade

Over the first 70px of scroll, `.logo-full` fades out between 25% and 55% of
the range and `.logo-compact` fades in between 55% and 85%. There is a brief
moment where neither is visible; the client approved this.

### Fallback for browsers without scroll-driven animations, and reduced motion

`@supports not (animation-timeline: scroll(root))` (Safari < 26, Firefox <
144) and `prefers-reduced-motion: reduce` set `animation: none` on the navbar,
the logo box and its images. Without this, browsers that drop
`animation-timeline` would run the keyframes as 0s time-based animations with
`fill: both`, freezing at the end keyframe (negative margin, logo overflowing
the bar). The static state is: `.logo-full` hidden, `.logo-compact` at 100% of
a fixed box (48/66px in `@supports not`, 50/70px in reduced motion, mobile /
`lg`+), no negative margin, navbar padding 0.625rem.

### Single-logo modes

When only one of `logo` / `headerLogo` has an asset, `Header.tsx` renders that
single image (`alt=""`, `.logo-solo`) and adds `logo-single` to `.header-logo`,
so the brand never disappears and there is no crossfade:

- Only `headerLogo`: box shrinks from `--art-rest` to `--art-scrolled`, no
  negative margin.
- Only `logo` (`logo-single-compact`): box height goes from
  `--art-rest * 0.746` to `--art-scrolled * 0.746` (the compact's proportional
  size), so the bar keeps shrinking on scroll as it did before this redesign.
- In `@supports not` / reduced motion both are static; `logo-single-compact`
  uses the fixed box height with the image at 100%.

The link's accessible name comes from its `aria-label`
(`"<siteName> - Home"`), not from image alt text; all header images use
`alt=""`.

### Always-solid, sticky header on every page (including home)

A transparent, `position: fixed` header that floated over the home hero and
solidified on scroll was tried and rejected by the client — they wanted the
bar visually consistent across all pages, not different on `/`. The header
is `position: sticky` and a solid `var(--header-nav-bg)` background
everywhere, including `/`; the only change on any page is the taller art
size and the two-logo crossfade.

`TextImageSection`'s anchored sections (`/#servicios`, `/#nosotros`) keep
their `scroll-margin-top` at 80px/100px (mobile/`lg`+) to clear the taller
*scrolled* bar height (~68px/~84px) now that the art is bigger.

### New `headerLogo` field instead of reusing `logo`

`logo` (the existing field) keeps being the compact mark used in the footer,
`RealEstateAgent` JSON-LD, and now the header's scrolled/compact state.
`headerLogo` is a new, separate Sanity image field for the tall lockup —
adding it as its own field (rather than deriving a "tall" crop from `logo`)
means the editor can upload a differently-cropped asset with the tagline
without touching the mark that's shared with the footer/SEO, and lets
production keep working with a single logo until someone uploads the new
one.

### Hero logo and nav links

The hero logo on the home page is 50% larger (300x150 / 600x300, with `sizes`
updated). Nav links are 18px (20px on `lg`+) at weight 500. `.header-logo`
sets `padding-block: 0` to override Bootstrap's `.navbar-brand` padding, which
would otherwise inflate the bar.

## Implementation

- `apps/studio/schemaTypes/siteSettingsType.ts` — new `headerLogo` image field
  (with an `alt` subfield, mirroring `logo`), placed right after `logo` in the
  "branding" group.
- `apps/frontend/src/sanity/queries/siteSettings.ts` — `SITE_SETTINGS_QUERY`
  projects `headerLogo { asset->{ _id, url, metadata { lqip, dimensions } },
  alt, crop, hotspot }`, and `logo` now also projects `crop, hotspot`, so
  Studio crops apply through `urlFor` (covered by
  `apps/frontend/src/lib/imageUrl.test.ts`).
- `apps/frontend/src/sanity/types.ts` — regenerated via `pnpm typegen` (ran
  successfully against the `development` dataset's live schema; no manual
  edits needed).
- `apps/frontend/src/app/(site)/layout.tsx` — passes `headerLogo` through to
  `Header`.
- `apps/frontend/src/components/Header.tsx` — renders `.logo-full` and
  `.logo-compact` when both logos exist, or a single `.logo-solo` image with
  a `logo-single` modifier otherwise (all with `alt=""`; the link's
  `aria-label` names the brand); each sized via `urlFor(...).width(400)` (~2x the largest
  rendered width, the `lg`+ full lockup at ~190px). Neither image gets
  `priority` — the LCP candidate is the hero background image, not the
  header.
- `apps/frontend/src/components/Header.css` — full rewrite: `--art-rest` /
  `--art-scrolled` / `--pad-rest` / `--pad-scrolled` custom properties on
  `.sticky-header .navbar`, the `.header-logo` grid + `shrink-logo`/`mark-
  in`/`mark-out` keyframes, `logo-single` modifiers, and
  `@supports not` / `prefers-reduced-motion` fallbacks. The header stays
  `position: sticky` with a solid background on every page.
- `apps/frontend/src/components/TextImageSection.css` — `.section-block`
  `scroll-margin-top` raised from `60px` to `80px`/`100px` (mobile/`lg`+).
- `docs/specs/2026-09-27-header-barra-alta.md` — this file.

## Operational notes

- **The editor still needs to do the schema flow before this is live in
  production**: `pnpm --filter dzts-studio typegen` (already run and
  committed here) → `pnpm --filter dzts-studio deploy` → commit the
  regenerated `apps/frontend/src/sanity/types.ts` if it changes again. Then,
  in Sanity Studio, upload the cropped tall lockup (with the "inmobiliaria"
  tagline, ~2.3:1 aspect ratio) to **Configuración del Sitio → Logo y Marca →
  "Logo del header (completo)"**. Until that upload happens, the header shows
  the compact logo only at its proportional size, still shrinking on scroll.
- `pnpm build` was attempted against the `development` Sanity dataset and
  failed at `generateStaticParams()` for `/propiedades/[slug]` and
  `/propiedades/[slug]/ficha` ("returned an empty array") — that dataset has
  no properties with a published slug. This is a pre-existing content/dataset
  issue unrelated to this change: `lint`, `tsc --noEmit`, and `vitest run`
  (unit tests) all pass, and typegen ran successfully against the same
  dataset's live schema. Re-run `pnpm build` against a dataset that has
  properties (or in CI, which uses the `preview` environment) to confirm the
  static export end-to-end.
- Anchors and the sticky header are otherwise unaffected beyond the taller
  bar — no other component reads `--art-rest`/`--art-scrolled`.
