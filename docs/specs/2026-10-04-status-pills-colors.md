# Status & Operation Pill Colors

- **Date**: 2026-10-04
- **PR**: TBD
- **Status**: Implemented
- **Owner**: main agent (architect tier), implemented by `implementer`
- **Builds on**: `2026-09-28-brand-palette-d-prime.md`

## Goal

The client asked for new colors on the property pills (cards, property detail, ficha):

| Pill | Background | Text | Before |
|---|---|---|---|
| Venta / Alquiler | cyan (`bg-primary`, `--brand-cyan`) | white | Venta green, Alquiler yellow + dark text (ficha: dark) |
| Vendido | red (`bg-danger`) | white | unchanged |
| Reservado | yellow (`bg-warning`) | white | yellow + dark text |
| Alquilado | green (`bg-success`) | white | red |

## Decisions

### Follow the client request despite contrast

White on yellow (~1.6:1) and white on cyan (~2.2:1) are below WCAG AA, and white on cyan goes against the palette rule "grey for text on cyan". The client asked for white text explicitly, so it ships as requested. If readability becomes an issue, the first change to make is Reservado text → `--brand-grey`.

### Status semantic colors are Bootstrap's, not brand tones

Red/yellow/green are Bootstrap's `danger`/`warning`/`success`, already used for status before this change. They signal state, not brand, so they don't count as "derived tones" under the brand palette rule.

### One shared source for labels and classes

Status labels and badge classes were duplicated in `PropertyCard`, the property detail page and the ficha. They now live in `src/lib/propertyStatus.ts`:

- `OPERATION_BADGE_CLASS` — operation pill classes.
- `PROPERTY_STATUS` — `{ label, badgeClass }` for `reservado` / `vendido` / `alquilado`.
- `getOperationLabel()` — "Venta" / "Alquiler".

## Implementation

- `PropertyCard.tsx`, `propiedades/[slug]/page.tsx` and `ficha/page.tsx` import from `propertyStatus.ts`.
- The detail page ribbon uses `status-banner--${status}`; `property-detail.css` sets white text on `--reservado` and adds `--alquilado` (`--bs-success`, fold `#0f5132`). Vendido keeps the default red.
- Ficha: an unknown status now renders no pill (before, anything other than `disponible` rendered a red "Reservado").

## Verification

Checked in Chrome against a local dev server (production dataset, read-only). Venta, Alquiler and Vendido were verified on real properties. No property is currently `reservado` or `alquilado`, so those two were checked by applying their classes to cloned pills/ribbons in the DOM.
