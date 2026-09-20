# Brand Cyan Tokens

- **Date**: 2026-09-20
- **PR**: TBD
- **Status**: Implemented
- **Owner**: main agent (architect tier)

## Goal

The site defines `--bs-primary: #01BCF3` (the logo's cyan) in `apps/frontend/src/styles/variables.css`, but Bootstrap 5.3.8 barely reads that token. Most of the UI — buttons, form focus states, pagination, checkboxes, and every link — kept rendering Bootstrap's stock blue (`#0d6efd`) instead of the brand cyan.

## Diagnosis

The blue came in through two paths, neither covered by the existing `--bs-primary`:

1. **`-rgb` tokens that were never defined.** Bootstrap derives several utilities from `--bs-primary-rgb`, not from `--bs-primary`: `.text-primary`, `.bg-primary`, `.border-primary` and the `bg-opacity-*` variants. The same applies to `a { color: rgba(var(--bs-link-color-rgb), …) }`. Neither `-rgb` token was set, so those rules fell back to the compiled default `13, 110, 253`.
2. **`#0d6efd` compiled directly into the framework's rules.** `.btn-primary`, `.btn-outline-primary`, the focus state of `.form-control`/`.form-select`/`.form-check-input`, `.form-check-input:checked`, the active `.pagination` item, and the focus rings all resolve through component variables (`--bs-btn-bg`, `--bs-pagination-active-bg`, …) that Bootstrap ships with the blue hex baked in. They never inherit from `--bs-primary` at all.

No blue hex was hand-written anywhere in `src/` — the only brand color literal in the source was the cyan. All remaining blue came from the Bootstrap bundle itself.

## Decisions

### A two-level scale instead of a single cyan

`#01BCF3` on white measures 2.2:1, well below the 4.5:1 WCAG AA minimum for text. Using it for text and links would have made the card title and price on every property card effectively illegible (the blue it replaces measures 4.6:1). The fix is a scale derived from the base cyan:

- **Fills** (button backgrounds, the card's top rule, checkboxes, active pagination) use `--brand-cyan` (`#01BCF3`) as-is — a large area of color carries no text-contrast requirement.
- **Text and links** use `--brand-cyan-700` (`#017597`), which measures 5.3:1 on white and clears AA for body text.

### Dark text on cyan

Where cyan is the background (primary buttons, active pagination), the label uses `--brand-on-cyan` rather than white. White on `#01BCF3` is 2.2:1; dark on the same cyan is ~7:1. This follows a precedent already in the repo: `TextImageSection.css` paints `.section-bg-primary` with `color: var(--bs-dark)`, not white.

### Everything in `variables.css`, no component touched

`variables.css` is imported after Bootstrap in `apps/frontend/src/app/layout.tsx`, so rules there win on cascade order without `!important` — the one exception being `.text-primary`, where Bootstrap's own utility is `!important` and ours has to match. The class names already in the JSX (`btn btn-primary`, `text-primary`, …) get re-skinned from a single stylesheet.

### No dark-mode block

An earlier draft of this change added an `@media (prefers-color-scheme: dark)` block that swapped `--bs-link-color` and `.text-primary` back to the full-brightness `--brand-cyan` on dark grounds, on the assumption (from `CLAUDE.md`) that the site supports dark mode. It does not: `grep -rn "prefers-color-scheme" apps/frontend/src apps/frontend/public` returns zero matches outside that one block — there is no CSS anywhere that darkens the background for `prefers-color-scheme: dark`. A visitor with the OS in dark mode still gets the site's normal white background, but that block would have pushed their links, headings and prices to `--brand-cyan` (`#01BCF3`), which measures 2.2:1 on white — the exact contrast failure this whole change exists to fix, reintroduced for every dark-mode user. The block was removed. If the site gets real dark-mode support later, the cyan scale needs its own pass against a dark background; it is not something a standalone media query on top of the light-mode scale can fix.

## Implementation

- `apps/frontend/src/styles/variables.css`:
  - New scale tokens in `:root`: `--brand-cyan`, `--brand-cyan-600`, `--brand-cyan-700`, `--brand-cyan-800`, `--brand-cyan-100`, `--brand-on-cyan`.
  - `--bs-primary`, `--bs-link-color` and `--bs-link-hover-color` now reference the scale instead of loose hex values; `--bs-primary-rgb`, `--bs-link-color-rgb`, `--bs-link-hover-color-rgb` and `--bs-focus-ring-color` were added (they did not exist before).
  - New selector block, placed after `:root` and before `html {}`: `.btn-primary`, `.btn-outline-primary`, `.text-primary`, `.badge.bg-primary`, the focus state of `.form-control`/`.form-select`/`.form-check-input`, `.form-check-input:checked`, `.pagination`, and `.nav-link:focus-visible`.
- `apps/frontend/src/app/(site)/propiedades/[slug]/page.tsx`: the property-type badge moved from `bg-info text-white` to `bg-primary`. See "Two badge fixes" below.

## Two badge fixes

Both surfaced only when the change was viewed running; neither was visible from lint, typecheck or a reading of the diff.

1. **A regression this change introduced.** `.badge` hardcodes `--bs-badge-color: #fff`, which the token work does not reach. The filter-count badge (`badge bg-primary` in `PropertiesFilters.tsx`) therefore went from white-on-blue at 4.6:1 to white-on-cyan at 2.2:1 — the change made it worse than it was. Fixed with `.badge.bg-primary { --bs-badge-color: var(--brand-on-cyan) }`, the same dark-on-cyan treatment as `.btn-primary`. `ActiveFilterBadges` is unaffected: its `.text-primary` carries `!important` and still wins.
2. **A pre-existing problem, folded in.** The property-type badge on the detail page used `bg-info text-white` — Bootstrap's `#0dcaf0` at 1.9:1. It predates this change, but `bg-info` sits within a few points of the brand cyan, so the badge read as brand-colored while being the only illegible one on the page, directly beside a legible green `Venta` badge. Moving it to `bg-primary` puts it on the real brand cyan with a dark label.

## Operational notes

- Grep across `apps/frontend/src` for every `primary` consumer (`text-primary`, `bg-primary`, `border-primary`, `btn-primary`, `btn-outline-primary`, `link-primary`, `text-bg-primary`) found no use of `link-primary` or `text-bg-primary`. The rest are covered: `bg-primary`/`border-primary` (including the `bg-opacity-10` badge in `ActiveFilterBadges`) read `--bs-primary-rgb`, now set to `1, 188, 243`; the others are rewritten explicitly.
- On a future Bootstrap upgrade, check whether the new version compiles primary hex into rules this change did not audit — `.btn-check`, `.list-group-item-primary`, `.alert-primary`, `.nav-pills` and `.form-range` are the likely candidates. None are used today.
- The scale is derived from the base cyan by mixing with black (18% / 38% / 52% for `-600` / `-700` / `-800`) and with white (88% for `-100`). Re-deriving it for a different base color follows the same ratios.
- Verified on `pnpm dev` against the production dataset: search-select focus rings, checked radios and checkboxes, card rules/titles/prices, active-filter badges, `Aplicar filtros`, breadcrumb and body links all render in the brand scale. Both badge issues above were found during that pass — worth remembering that neither lint nor typecheck can catch a contrast regression.
- `CLAUDE.md` line 311 states "Dark mode supported via `prefers-color-scheme` CSS media query." That is stale documentation — no such support exists in the frontend today (see "No dark-mode block" above). Left as-is per instruction; not corrected in this change.
