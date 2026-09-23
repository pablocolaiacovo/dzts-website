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
  - New scale tokens in `:root`: `--brand-cyan`, `--brand-cyan-600`, `--brand-cyan-700`, `--brand-cyan-800`, `--brand-on-cyan`.
  - `--bs-primary`, `--bs-link-color` and `--bs-link-hover-color` now reference the scale instead of loose hex values; `--bs-primary-rgb`, `--bs-link-color-rgb`, `--bs-link-hover-color-rgb` and `--bs-focus-ring-color` were added (they did not exist before).
  - New selector block, placed after `:root` and before `html {}`: `.btn-primary`, `.btn-outline-primary`, `.text-primary`, `.badge.bg-primary`, the focus state of `.form-control`/`.form-select`/`.form-check-input`, `.form-check-input:checked`, `.pagination`, and `.nav-link:focus-visible`.
- `apps/frontend/src/app/(site)/propiedades/[slug]/page.tsx`: the property-type badge moved from `bg-info text-white` to `bg-primary`. See "Contrast fixes found by running the site" below.
- `apps/frontend/src/components/ShareButton.tsx`: the "Compartir" button moved from `btn-info text-white` to `btn-outline-primary`. See item 3 below.
- `apps/frontend/src/components/SearchProperties.css`: `.btn-custom` text color moved to `--brand-cyan-700`, its `:hover` text color moved to `--brand-on-cyan`. See item 4 below.
- `apps/frontend/src/components/Footer.css`: `.footer-credit` and `.footer-credit a` text color raised from `rgba(255, 255, 255, 0.5)` to `rgba(255, 255, 255, 0.65)`. See item 5 below.
- `apps/frontend/src/app/(print)/propiedades/[slug]/ficha/page.tsx`: the property-type badge moved from `bg-secondary text-dark` to `bg-secondary text-white`. See item 6 below.

## Contrast fixes found by running the site

All three surfaced only when the change was viewed running; none was visible from lint, typecheck or a reading of the diff.

1. **A regression this change introduced.** `.badge` hardcodes `--bs-badge-color: #fff`, which the token work does not reach. The filter-count badge (`badge bg-primary` in `PropertiesFilters.tsx`) therefore went from white-on-blue at 4.6:1 to white-on-cyan at 2.2:1 — the change made it worse than it was. Fixed with `.badge.bg-primary { --bs-badge-color: var(--brand-on-cyan) }`, the same dark-on-cyan treatment as `.btn-primary`. `ActiveFilterBadges` is unaffected: its `.text-primary` carries `!important` and still wins.
2. **A pre-existing problem, folded in.** The property-type badge on the detail page used `bg-info text-white` — Bootstrap's `#0dcaf0` at 1.9:1. It predates this change, but `bg-info` sits within a few points of the brand cyan, so the badge read as brand-colored while being the only illegible one on the page, directly beside a legible green `Venta` badge. Moving it to `bg-primary` puts it on the real brand cyan with a dark label.
3. **A pre-existing problem on the property detail page's "Compartir" button, also not a badge.** `ShareButton` used `btn btn-info text-white`, the same Bootstrap `#0dcaf0`/white pairing, measuring 1.95:1. Beyond contrast, it was a visual-hierarchy problem: the button sits in an action row alongside "Ficha" (`btn-outline-secondary`) and "WhatsApp" (`btn-outline-success`), with "Consultar por WhatsApp" (`btn-success`, filled) directly below. A filled `btn-info` made "Compartir" the only solid button in a row of secondary actions, competing with the real green CTA for attention. Changed to `btn-outline-primary` (5.3:1, via `--brand-cyan-700` through `--bs-btn-color`), which both fixes the contrast and matches the outline treatment of its two row neighbors, leaving the green button as the page's one solid CTA.
4. **The home page's "Buscar" button.** `.btn-custom` in `SearchProperties.css` painted its text with `var(--bs-primary)` on `var(--bs-secondary)` (white), i.e. the raw brand cyan at 2.2:1. Changed the `color` to `var(--brand-cyan-700)` (5.3:1); the `border` stays on `var(--bs-primary)` since a border isn't text, and `background-color` is unchanged.

   The `:hover` state has the same problem in reverse — `background-color: var(--bs-primary)` with `color: var(--bs-secondary)` (white on cyan, 2.2:1) — and axe-core doesn't evaluate `:hover` rules, so this half didn't show up in the automated scan; it was only found by reading the CSS. Changed the hover `color` to `var(--brand-on-cyan)` (~7:1), the same dark-on-cyan treatment already used by `.btn-primary` and `.badge.bg-primary`. Worth keeping in mind for any future contrast pass: hover/focus/active state colors need a manual CSS read, not just an axe run.
5. **The footer credit link.** `.footer-credit` and `.footer-credit a` in `Footer.css` both used `rgba(255, 255, 255, 0.5)` on the footer's `#3d3d3d` background, measuring 4.05:1 — just under the 4.5:1 AA threshold. Raised both to `rgba(255, 255, 255, 0.65)` (5.66:1). The `:hover` state (`0.8`) and the decorative `border-top` (`0.15`, not text) were left alone.
6. **The printable ficha's property-type badge — the same root-cause bug as `--bs-primary-rgb`, on the other token.** `apps/frontend/src/app/(print)/propiedades/[slug]/ficha/page.tsx` rendered the property-type badge as `badge bg-secondary text-dark`, which measures 3.29:1 (`#212529` on Bootstrap's default gray `#6c757d`). `variables.css` sets `--bs-secondary: #ffffff`, but Bootstrap's `.bg-secondary` reads `--bs-secondary-rgb`, which was never defined — exactly the same gap that `--bs-primary-rgb` had before this PR — so the badge falls back to the compiled default gray instead of picking up white.

   This is deliberately **not** fixed by defining `--bs-secondary-rgb` here: doing so would turn every `.bg-secondary` on the site white, and on this one badge (this ficha page has a white background) that would make the badge invisible. `grep -rn "bg-secondary" apps/frontend/src/` confirms this is the only `.bg-secondary` consumer in the codebase today, so the blast radius is currently zero, but the underlying inconsistency (`--bs-secondary` says white, `--bs-secondary-rgb` says gray) is real and latent — a second `.bg-secondary` usage elsewhere would silently render gray-not-white and need this same badge-local treatment, not a global `--bs-secondary-rgb` fix. The local fix here was `text-dark` → `text-white` (4.69:1 dark-label-on-gray), keeping the gray fill (which prints fine — this route group, `(print)`, is the print-optimized ficha).

## Operational notes

- Grep across `apps/frontend/src` for every `primary` consumer (`text-primary`, `bg-primary`, `border-primary`, `btn-primary`, `btn-outline-primary`, `link-primary`, `text-bg-primary`) found no use of `link-primary` or `text-bg-primary`. The rest are covered: `bg-primary`/`border-primary` (including the `bg-opacity-10` badge in `ActiveFilterBadges`) read `--bs-primary-rgb`, now set to `1, 188, 243`; the others are rewritten explicitly.
- On a future Bootstrap upgrade, check whether the new version compiles primary hex into rules this change did not audit — `.btn-check`, `.list-group-item-primary`, `.alert-primary`, `.nav-pills` and `.form-range` are the likely candidates. None are used today.
- The scale is derived from the base cyan by mixing with black (18% / 38% / 52% for `-600` / `-700` / `-800`). Re-deriving it for a different base color follows the same ratios.
- Verified on `pnpm dev` against the production dataset: search-select focus rings, checked radios and checkboxes, card rules/titles/prices, active-filter badges, `Aplicar filtros`, breadcrumb and body links all render in the brand scale. Both badge issues above were found during that pass — worth remembering that neither lint nor typecheck can catch a contrast regression.
- `CLAUDE.md` line 311 has been corrected in this PR. It previously stated "Dark mode supported via `prefers-color-scheme` CSS media query," an assumption that led to the dark-mode block draft described in "No dark-mode block" above. The line now correctly documents that there is no dark-mode support in the frontend and warns against adding a partial dark block. Fixing the documentation prevents the same misunderstanding from causing future regressions.
