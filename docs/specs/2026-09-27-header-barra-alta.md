# Header redesign — "Barra Alta"

- **Date**: 2026-09-27
- **PR**: TBD
- **Status**: Implemented
- **Owner**: implementer agent (Sonnet tier)

## Goal

Replace the header's fixed-size single logo with a two-state lockup: a tall
lockup (with the "inmobiliaria" tagline) shown at rest, that shrinks and
crossfades into the current compact logo as the visitor scrolls. On the home
page, the bar should float transparent over the hero instead of sitting on a
flat background bar, so the header reads as part of the hero rather than a
stacked block on top of it. Approved from a set of HTML prototypes; this spec
ports the chosen "Opción 1 — Barra Alta" prototype into the codebase.

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

### Fallback for browsers without scroll-driven animations, and reduced motion

`@supports not (animation-timeline: scroll(root))` (older Firefox/Safari) and
`prefers-reduced-motion: reduce` both fix the bar at an intermediate size and
show only `.logo-compact` (`.logo-full { display: none }`), rather than
leaving the bar stuck at the "rest" (tallest) size forever.

### `is-home`: transparent, fixed header over the hero

`Header.tsx` computes `isHome = usePathname() === "/"` and adds `is-home` to
`.sticky-header` instead of branching into a separate component. On `/`, the
header is `position: fixed` (transparent background + a top-down dark
gradient for contrast over the hero image) and solidifies to
`var(--header-nav-bg)` via a second scroll-driven animation as the user
scrolls. Both `@supports not` and reduced-motion make it solid immediately
instead of leaving it transparent statically. Non-home pages keep the
existing `position: sticky` in-flow header — the only change there is the
taller art size and the two-logo crossfade.

Because the home header is `fixed`, the hero section (`SearchProperties`,
which owns the `.hero` class) needs `padding-top` equal to the header's own
height (80px mobile / 110px `lg`+) so hero content doesn't render under the
bar. `TextImageSection`'s anchored sections (`/#servicios`, `/#nosotros`) got
their `scroll-margin-top` bumped from a flat 60px to 80px/100px
(mobile/`lg`+) to clear the new *scrolled* bar height, which is taller than
before (~68px/~84px) now that the art is bigger.

### New `headerLogo` field instead of reusing `logo`

`logo` (the existing field) keeps being the compact mark used in the footer,
`RealEstateAgent` JSON-LD, and now the header's scrolled/compact state.
`headerLogo` is a new, separate Sanity image field for the tall lockup —
adding it as its own field (rather than deriving a "tall" crop from `logo`)
means the editor can upload a differently-cropped asset with the tagline
without touching the mark that's shared with the footer/SEO, and lets
production keep working with a single logo until someone uploads the new
one.

### Fallback when `headerLogo` isn't set yet

If `headerLogo` has no asset (the common case until an editor uploads it),
`Header.tsx` renders only `.logo-compact`, and `.header-logo` gets a
`logo-compact-only` modifier class that fixes it at the "rest" art size with
no animation — production doesn't get a broken half-implemented crossfade
while it's mid-migration.

## Implementation

- `apps/studio/schemaTypes/siteSettingsType.ts` — new `headerLogo` image field
  (with an `alt` subfield, mirroring `logo`), placed right after `logo` in the
  "branding" group.
- `apps/frontend/src/sanity/queries/siteSettings.ts` — `SITE_SETTINGS_QUERY`
  projects `headerLogo { asset->{ _id, url, metadata { lqip, dimensions } },
  alt }`, same shape as `logo`.
- `apps/frontend/src/sanity/types.ts` — regenerated via `pnpm typegen` (ran
  successfully against the `development` dataset's live schema; no manual
  edits needed).
- `apps/frontend/src/app/(site)/layout.tsx` — passes `headerLogo` through to
  `Header`.
- `apps/frontend/src/components/Header.tsx` — `isHome` from `usePathname()`;
  renders `.logo-full` (only when `headerLogo` has an asset) and
  `.logo-compact` (`alt=""` + `aria-hidden` when the full logo is also
  present, so the link's accessible name — from the full logo's `alt` — isn't
  duplicated); both sized via `urlFor(...).width(400)` (~2x the largest
  rendered width, the `lg`+ full lockup at ~190px). Neither image gets
  `priority` — the LCP candidate is the hero background image, not the
  header.
- `apps/frontend/src/components/Header.css` — full rewrite: `--art-rest` /
  `--art-scrolled` / `--pad-rest` / `--pad-scrolled` custom properties on
  `.sticky-header .navbar`, the `.header-logo` grid + `shrink-logo`/`mark-
  in`/`mark-out` keyframes, `logo-compact-only` fallback modifier, `@supports
  not` and `prefers-reduced-motion` fallbacks, and the `is-home` transparent/
  solidify rules.
- `apps/frontend/src/components/SearchProperties.css` — `.hero` gets
  `padding-top: 80px` (mobile) / `110px` (`lg`+) to clear the fixed home
  header.
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
  the existing compact logo only, unanimated — no visual regression.
- `pnpm build` was attempted against the `development` Sanity dataset and
  failed at `generateStaticParams()` for `/propiedades/[slug]` and
  `/propiedades/[slug]/ficha` ("returned an empty array") — that dataset has
  no properties with a published slug. This is a pre-existing content/dataset
  issue unrelated to this change: `lint`, `tsc --noEmit`, and `vitest run`
  (unit tests) all pass, and typegen ran successfully against the same
  dataset's live schema. Re-run `pnpm build` against a dataset that has
  properties (or in CI, which uses the `preview` environment) to confirm the
  static export end-to-end.
- Anchors and the sticky (non-home) header are otherwise unaffected beyond
  the taller bar — no other component reads `--art-rest`/`--art-scrolled`.
