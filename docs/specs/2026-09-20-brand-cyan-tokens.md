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

## Implementation

- `apps/frontend/src/styles/variables.css`:
  - New scale tokens in `:root`: `--brand-cyan`, `--brand-cyan-600`, `--brand-cyan-700`, `--brand-cyan-800`, `--brand-cyan-100`, `--brand-on-cyan`.
  - `--bs-primary`, `--bs-link-color` and `--bs-link-hover-color` now reference the scale instead of loose hex values; `--bs-primary-rgb`, `--bs-link-color-rgb`, `--bs-link-hover-color-rgb` and `--bs-focus-ring-color` were added (they did not exist before).
  - New selector block, placed after `:root` and before `html {}`: `.btn-primary`, `.btn-outline-primary`, `.text-primary`, the focus state of `.form-control`/`.form-select`/`.form-check-input`, `.form-check-input:checked`, `.pagination`, and `.nav-link:focus-visible`.
  - New `@media (prefers-color-scheme: dark)` block, separate from the existing `@media (prefers-reduced-motion)` at the end of the file: on dark grounds the deep cyan goes muddy, so links and `.text-primary` revert to `--brand-cyan` and the link hover moves to `--brand-cyan-100`.
- No component or any other file was modified.

## Operational notes

- Grep across `apps/frontend/src` for every `primary` consumer (`text-primary`, `bg-primary`, `border-primary`, `btn-primary`, `btn-outline-primary`, `link-primary`, `text-bg-primary`) found no use of `link-primary` or `text-bg-primary`. The rest are covered: `bg-primary`/`border-primary` (including the `bg-opacity-10` badge in `ActiveFilterBadges`) read `--bs-primary-rgb`, now set to `1, 188, 243`; the others are rewritten explicitly.
- On a future Bootstrap upgrade, check whether the new version compiles primary hex into rules this change did not audit — `.btn-check`, `.list-group-item-primary`, `.alert-primary`, `.nav-pills` and `.form-range` are the likely candidates. None are used today.
- The scale is derived from the base cyan by mixing with black (18% / 38% / 52% for `-600` / `-700` / `-800`) and with white (88% for `-100`). Re-deriving it for a different base color follows the same ratios.
- `lint` and `tsc --noEmit` ran clean. `next build` and the e2e suite were not run: the machine had no `.env.local`, so the static export fails at `Dataset not found` when fetching Sanity content. That is an environment gap, not a regression — this change is pure CSS with no content dependency — but it does mean the result has not yet been seen rendered. Verify visually on `pnpm dev` before merging.
