# Brand Palette (option D′)

- **Date**: 2026-09-28
- **PR**: TBD
- **Status**: Implemented
- **Owner**: main agent (architect tier)
- **Builds on**: `2026-09-20-brand-cyan-tokens.md` (PR #169)

## Goal

The client wants the site in the logo's cyan, as the previous site (bak.dzts.com.ar) had it, even though bright cyan on white is below WCAG AA. The brand-cyan-tokens change had solved contrast with a derived deep cyan (`#017597`) for text and links, which is not in the brand manual. This change replaces that scale with the manual's own three colors.

## Decisions

### Only the manual's palette

The *Manual básico de marca* (May 2015) defines three colors and no secondary tones:

| Color | Hex | Pantone |
|---|---|---|
| Cyan | `#00BCF2` (site keeps `#01BCF3`, visually identical) | 306 C |
| Grey | `#404041` | Black C at 90% |
| White | `#FFFFFF` | White |

The manual's RGB values (`0 191 219`, `25 25 25`) don't match its own hex; the PDF fills measure `#00BDF2` / `#404041`, so the hex values are the reference.

`--brand-cyan-600/700/800` and `--brand-on-cyan` were removed. Tokens are now just `--brand-cyan` and `--brand-grey`.

### Where each color goes (the previous site's rule)

The previous site used cyan on white at 2.0–2.5:1 for years without it being perceived as illegible, because cyan never carried running text: card titles were dark grey, cyan was on prices, subtitles and accents. Option D′ reproduces that rule:

- **Cyan `#01BCF3`**: prices, detail-page subtitle/address, feature values, links, the card's top rule, fills (buttons, active pagination, checkboxes, badges). `.text-primary` is back to Bootstrap's own rule, i.e. the exact logo cyan.
- **Grey `#404041`**: property titles (card `h5` and detail `h1`), text on cyan (buttons, badges, active pagination, skip link), active-filter badge labels, hover of links, header and footer backgrounds. `--bs-dark` and `--bs-dark-rgb` point to it, so `.text-dark`, `.bg-dark` and `TextImageSection`'s dark/primary variants follow.
- Card price bumped from `fs-5` to `fs-4`: the only text left in cyan on the card gets more weight, as it had on the previous site.

### Hover/active without derived tones

`.btn-primary` inverts on hover (grey fill, cyan label, 4.67:1) instead of darkening the cyan. `.btn-outline-primary` has a grey label and cyan border, filling cyan on hover. Links hover to grey.

## Contrast

| Pair | Ratio |
|---|---|
| Cyan on white (prices, links, subtitles) | 2.21:1, below AA, accepted by the client |
| Grey on white (titles) | 10.36:1 |
| Grey on cyan (buttons, badges) | 4.67:1 |
| Cyan on grey (header/footer, dark sections, button hover) | 4.67:1 |

## Not changed

- Typography stays Inter. The manual asks for Roboto/DIN; the owner prefers Inter.
- Section `h2`/`h3` on white/light `TextImageSection` variants were already cyan.
- The printable ficha keeps its black-and-grey print palette.
- `FichaActions`' `btn-dark` uses Bootstrap's compiled `#212529`.
