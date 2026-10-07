# Header redesign — "Barra Alta"

- **Date**: 2026-09-27
- **PR**: #179
- **Status**: Implemented
- **Owner**: implementer agent (Sonnet tier)

## Goal

Replace the header's fixed-size single logo with a taller lockup (with the
"inmobiliaria" tagline) that shrinks slightly as the visitor scrolls.
Approved from a set of HTML prototypes ("Opción 1 — Barra Alta"), then
simplified by a later client decision (see Decisions). The header keeps a
solid background and `position: sticky` on every page, including `/`.

## Decisions

### Final behavior: only the tall lockup

A later client decision (approved on a live mock) removed the two-logo
crossfade and the navbar's animated vertical padding. The header renders only
`headerLogo`. Both the box and the image are animated with
`animation-timeline: scroll(root)` over the first 120px: the `.header-logo`
box (`overflow: hidden`) goes from `--art-rest` to `--art-scrolled ×
--logo-mark-ratio`, and the `img` (`width: auto`) from `--art-rest` to
`--art-scrolled` (56px → 52px on mobile, 82px → 64px on `lg`+). The navbar has
a static vertical padding `--header-pad-y` (see the updates below).
`.header-logo` keeps `padding-block: 0` (cancels Bootstrap's `.navbar-brand`
padding).

### Fallback: compact logo

When `headerLogo` has no asset, `Header.tsx` renders `siteSettings.logo`
instead and adds `header-logo-compact` (`--logo-scale` and
`--logo-mark-ratio` both set to `--logo-compact-scale`, 0.746), so the box
goes from `--art-rest * 0.746` to `--art-scrolled * 0.746`, equal to the image
and never clipped. If neither exists
the link is empty. The link keeps `.navbar-brand` (e2e selector) and its
`aria-label`; the image uses `alt=""`.

### No scroll-driven animations, and reduced motion

`@supports not (animation-timeline: scroll(root))` (Safari < 26, Firefox <
144) and `prefers-reduced-motion: reduce` set `animation: none` on
`.header-logo` and its `img`, and override `--header-height` on `:root` with
the rest height (`--art-rest + 2 * --header-pad-y`; for the compact fallback
`max(40px, --art-rest * 0.746) + 2 * --header-pad-y`). Without it, browsers that drop `animation-timeline` would run
the keyframes as 0s time-based animations with `fill: both` and freeze at the
end keyframe. The logo stays static at `--art-rest` (or its ×0.746).

### Rejected along the way

- A transparent, `position: fixed` home header that solidified on scroll:
  the client wanted the bar consistent across pages.
- A two-logo crossfade (tall lockup into the compact logo, with a negative
  margin trick and animated navbar padding): dropped in favor of the simpler
  behavior above.

`TextImageSection`'s anchored sections (`/#servicios`, `/#nosotros`) use
`scroll-margin-top` 64px / 80px (mobile / `lg`+), i.e. the scrolled bar height
(56 / ~68px) plus a small gap.

### Update 2026-10-07: tagline clipped on scroll

The client asked for the bottom line of the lockup ("by César Torres") to hide on scroll after all, leaving "dzts / inmobiliaria".
Implemented with a single image: `.header-logo` has `overflow: hidden` and its
height animates to `--art-scrolled * 0.746` (the mark's share of the lockup
height), while the `img` height animates separately (`shrink-logo-art`) to
`--art-scrolled`. The box shrinks faster than the image, so the tagline is
progressively clipped from the bottom and only "dzts / inmobiliaria" remains.

Scrolled logo/toggler heights: 40px on mobile (the toggler dominates) and 47.7px on
`lg`+ (bar heights including padding: see the next update). With
the compact fallback box and image are equal throughout, so nothing is clipped.
`@supports not` and reduced motion set `animation: none` on both the box and
the image (static full lockup).

### Update 2026-10-07: vertical breathing room

The client asked for a bit more breathing room, so the navbar now has a static
vertical padding `--header-pad-y`: 0.5rem on mobile, 0.625rem on `lg`+ (not
animated). The scrolled bar is 56px (mobile) / ~68px (`lg`+), and
`--header-height` includes the padding:
`max(40px, --art-scrolled * 0.746) + 2 * --header-pad-y`.

Caveat: the 0.746 ratio (`--logo-mark-ratio`, separate from the compact
fallback's `--logo-compact-scale`) assumes the `headerLogo` crop keeps the
tagline as the bottom 25.4% of the image. It was verified visually against the
production crop (~2.52:1, 2497×990).

### New `headerLogo` field instead of reusing `logo`

`logo` keeps being the compact mark used in the footer and `RealEstateAgent`
JSON-LD (and as the header fallback). `headerLogo` is a separate Sanity image
field for the tall lockup, so the editor can upload a differently-cropped
asset without touching the mark shared with the footer/SEO, and production
keeps working with a single logo until the new one is uploaded.

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
- `apps/frontend/src/components/Header.tsx` — renders a single image:
  `headerLogo`, or `logo` (with `header-logo-compact`) as fallback (`alt=""`;
  the link's `aria-label` names the brand), via `urlFor(...).width(400)`.
  No `priority` — the LCP candidate is the hero background image.
- `apps/frontend/src/components/Header.css` — `--art-rest` / `--art-scrolled`
  / `--logo-mark-ratio` / `--header-pad-y` on `:root`, the `.header-logo` box
  (`overflow: hidden`) + `shrink-logo` keyframes, the image's `shrink-logo-art`
  keyframes, `--logo-scale` for the compact fallback, and the `@supports not`
  / reduced-motion blocks (`animation: none` plus the rest-height
  `--header-height` override).
- `apps/frontend/src/components/TextImageSection.css` — `.section-block`
  `scroll-margin-top` set to `64px`/`80px` (mobile/`lg`+).
- `docs/specs/2026-09-27-header-barra-alta.md` — this file.

## Operational notes

- **The editor still needs to do the schema flow before this is live in
  production**: `pnpm --filter dzts-studio typegen` (already run and
  committed here) → `pnpm --filter dzts-studio deploy` → commit the
  regenerated `apps/frontend/src/sanity/types.ts` if it changes again. Then,
  in Sanity Studio, upload the cropped tall lockup (with the "inmobiliaria"
  tagline, ~2.5:1 aspect ratio) to **Configuración del Sitio → Logo y Marca →
  "Logo del header (completo)"**. Until that upload happens, the header shows
  the compact logo at its proportional size, still shrinking on scroll.
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
