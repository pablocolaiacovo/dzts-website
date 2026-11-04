---
name: DZTS Inmobiliaria
description: A broker's street window on the web, with listings up front and clearly priced, and a named person behind them.
colors:
  brand-cyan: "#01BCF3"
  brand-grey: "#404041"
  white: "#FFFFFF"
  surface-light: "#F8F9FA"
  ink: "#212529"
  whatsapp-float: "#25D366"
  whatsapp-cta: "#198754"
  status-sold: "#DC3545"
  status-reserved: "#FFC107"
  status-rented: "#198754"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.5
  price:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.1em"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "1rem"
  pill: "50rem"
  circle: "50%"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.brand-cyan}"
    textColor: "{colors.brand-grey}"
    rounded: "{rounded.sm}"
    padding: "0.375rem 0.75rem"
  button-primary-hover:
    backgroundColor: "{colors.brand-grey}"
    textColor: "{colors.brand-cyan}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.brand-grey}"
    rounded: "{rounded.sm}"
    padding: "0.375rem 0.75rem"
  button-outline-hover:
    backgroundColor: "{colors.brand-cyan}"
    textColor: "{colors.brand-grey}"
  button-search:
    backgroundColor: "{colors.white}"
    textColor: "{colors.brand-grey}"
    rounded: "{rounded.sm}"
    padding: "1rem 2rem"
  button-search-hover:
    backgroundColor: "{colors.brand-cyan}"
    textColor: "{colors.brand-grey}"
  button-whatsapp:
    backgroundColor: "{colors.whatsapp-cta}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "0.375rem 1rem"
  whatsapp-float:
    backgroundColor: "{colors.whatsapp-float}"
    textColor: "{colors.white}"
    rounded: "{rounded.circle}"
    size: "56px"
  property-card:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.brand-grey}"
    rounded: "{rounded.lg}"
    width: "400px"
  badge-operation:
    backgroundColor: "{colors.brand-cyan}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "0.35em 0.65em"
  input-select:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.375rem 2.25rem 0.375rem 0.75rem"
  header-bar:
    backgroundColor: "{colors.brand-grey}"
    textColor: "{colors.white}"
---

# Design System: DZTS Inmobiliaria

## Overview

**Creative North Star: "The Broker's Window"**

The site works like the street window of a small licensed agency: the properties are on display, each with its price in plain sight, and the broker's name is on the glass. The dark grey bar carries the "by César Torres" logo, the photographs supply nearly all the color and texture, and the brand cyan points at what a visitor came to compare.

Components are familiar and direct. The system is Bootstrap 5 with the brand mapped onto it, so visitors meet the selects, cards, pills and pagination they already know. Density is moderate and listing-led. Pages stay on a white ground with a single type family, and hierarchy comes from weight, size and color rather than ornament.

There is no dark mode, because the palette is calibrated against white.

**Key Characteristics:**
- Three brand colors from the 2015 brand manual, plus functional colors for status and WhatsApp
- Inter throughout, with bold grey titles and bold cyan prices
- Photography as the main visual material, with a full-bleed Rosario skyline on the home hero
- Bootstrap patterns restyled through tokens rather than custom widgets
- Solid grey header and footer framing white content

## Colors

A strict brand pair of bright cyan and dark grey on white, with outside colors allowed only when they carry a function.

### Primary
- **Logo Cyan** (`brand-cyan`): Prices, links, the 4px rule on property cards, and fills such as primary buttons, active pagination, checkboxes and pills. Also the color of `h2` and `h3` headings in home sections on white, light and grey grounds.

### Secondary
- **Manual Grey** (`brand-grey`): Header and footer backgrounds, property titles, the label on cyan fills, and the hover state of links and primary buttons.

### Neutral
- **White** (`white`): The page ground, and text on grey.
- **Pale Card Grey** (`surface-light`): Property card bodies, the price box, and the light section variant. It comes from Bootstrap's light token.
- **Bootstrap Ink** (`ink`): Default running text. At 75% opacity it is the muted text for card metadata and the detail subtitle. Card subtitles use it at full strength. Subtitles stay muted rather than cyan, for readability.

### Functional
- **WhatsApp Green** (`whatsapp-float`): The floating WhatsApp button only.
- **Consult Green** (`whatsapp-cta`): The "Consultar" WhatsApp button on the property detail page. It is the same value as Rented Green because both are Bootstrap's success color.
- **Sold Red** (`status-sold`), **Reserved Yellow** (`status-reserved`), **Rented Green** (`status-rented`): Property status pills and ribbons only.

### Named Rules
**The Manual Palette Rule.** Brand color means cyan, grey and white. No tints, shades or derived tones of either brand color.

**The Cyan Never Reads Rule.** Cyan on white measures 2.21:1, which the client knowingly accepts for short accents. It may set prices, links and section headings, never running text.

**The Channel Exception Rule.** Green and the status colors signal WhatsApp or property state. They never decorate.

## Typography

**Body and Display Font:** Inter (with system-ui, -apple-system, sans-serif)

**Character:** One neutral, highly legible sans for everything. Personality comes from the logo and the photographs, not the type.

### Hierarchy
- **Display** (700, 2.25rem on mobile and 3rem from `md`, line-height 1.25, -0.025em): Page headings, including the hero line. The property detail title is set smaller, at about 1.5rem.
- **Headline** (700, 1.875rem on mobile and 2.25rem from `md`, line-height 1.25, -0.025em): Section headings.
- **Title** (700, 1.25rem, line-height 1.5): Property card titles, centered and in grey. CMS titles often arrive in all caps.
- **Price** (700, 1.5rem, line-height 1.5): Prices, in cyan, right-aligned on cards. The detail price box uses 1.75rem with line-height 1. Both sizes are fluid below 1200px. Always formatted `es-AR` with `AR$` or `US$`.
- **Body** (400, 1rem, line-height 1.625): Paragraphs. Property descriptions tighten to 1.5.
- **Label** (600, 0.75rem, 0.1em tracking, uppercase): Footer column headings, in cyan. Filter group headings use a similar small uppercase style.

### Named Rules
**The Heavy Price Rule.** A price is always bold and large for its context. Cyan's low contrast is offset by weight and size, so don't set a price small or light.

## Layout

Mobile-first on Bootstrap's grid and breakpoints (576, 768, 992, 1200 and 1400px), using its `.container` and spacing scale.

The home page opens with a full-viewport hero: a photo under a 50% black overlay, the logo above the heading, and the search selects stacked on mobile and in one row from `md`. The listing page stacks filters above results on mobile. From `lg` it uses a sticky sidebar beside the grid, 250px wide when expanded and 140px when collapsed. Property cards cap at 400px with 4:3 images.

The property detail page pairs the carousel with facts and a price box. Below that come the description and a full-width map, 450px tall. The home contact map fills the viewport between header and footer from `lg`.

The header is always sticky. Its logo shrinks on scroll from 56px to 52px on mobile and from 82px to 64px from `lg`, clipping the "by César Torres" line. This is a scroll-driven CSS animation, with a static logo when unsupported or with reduced motion.

Text-and-image home sections use `col-lg-7` and `col-lg-5`, with text capped at 40rem.

## Elevation & Depth

Mostly flat. Depth comes from photographs, the grey bars and the pale card bodies, with very few shadows.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 .125rem .25rem rgba(0,0,0,.075)`): Property cards, using Bootstrap's small shadow.
- **Float** (`box-shadow: 0 4px 12px rgba(0,0,0,.25)`): The floating WhatsApp button, deepening to `0 6px 16px rgba(0,0,0,.3)` on hover.
- **Ribbon** (`box-shadow: 0 2px 6px rgba(0,0,0,.3)`): The status ribbon over the detail carousel.
- **Loading card** (`box-shadow: 0 12px 30px rgba(15,23,42,.12)`): The listing's loading message.

### Named Rules
**The Earned Shadow Rule.** A shadow marks something that sits above the page, such as a card, a floating button or a ribbon. Sections and panels stay flat.

## Shapes

Gentle corners on controls (0.375rem), generous corners on property cards (1rem), and full pills for badges. Circles recur in three places: the floating WhatsApp button, social links, and the framed images in home sections (240px on mobile, 300px from `md`, 380px from `lg`).

The status ribbon is the one sharp form: square-cornered, overhanging the carousel's left edge with a small folded tail.

## Components

### Buttons
Familiar and direct: standard Bootstrap buttons recolored through tokens.
- **Shape:** Gently curved (`rounded.sm`).
- **Primary:** Cyan fill with a grey label (4.67:1).
- **Hover / Focus:** Inverts to a grey fill with a cyan label, with a transition of 0.2s or less. Focus shows a 0.25rem cyan ring at 50% opacity.
- **Outline:** Grey label and cyan border, filling cyan on hover.
- **Search:** "Buscar" on the hero is white with a cyan border, filling cyan on hover. Padding is 0.75rem 1.25rem below `md`.
- **WhatsApp:** "Consultar" is a bold, white-on-green button in the price box. Secondary actions such as Ficha and Compartir are small, quiet text links beneath it.

### Chips
- **Operation pills:** Venta and Alquiler are cyan with white text, as the client requested, despite about 2.2:1 contrast. They sit top-right on card images and inline on the detail page.
- **Property type pill:** On the detail page only, cyan with a grey label.
- **Status pills:** Vendido, Reservado and Alquilado sit top-left on card images, with white text on red, yellow and green. White on yellow (about 1.6:1) is a client request. The spec's first fix, if readability becomes an issue, is a grey label on Reservado.
- **Active filter badges:** Dismissible pills with grey labels, a cyan border and a 10% cyan tint, shown above the listing results. The tint is known drift.

### Cards / Containers
- **Corner Style:** Generously rounded (`rounded.lg`).
- **Background:** Pale card grey under a full-width 4:3 photo.
- **Shadow Strategy:** Card lift only.
- **Border:** None. A 4px cyan rule separates photo from body.
- **Internal Padding:** Bootstrap's card default with reduced bottom padding, centered text, and a hairline above the right-aligned price.

### Inputs / Fields
- **Style:** Bootstrap defaults: white, hairline border, `rounded.sm`. Checkboxes and radios fill cyan when checked.
- **Focus:** Cyan border with a 0.25rem cyan ring at 25% opacity.

### Navigation
- **Header:** Solid grey sticky bar with white links (weight 500, 1.125rem, 1.25rem from `lg`). Links turn cyan on hover. Focus shows a 2px cyan outline. Below `lg` the links collapse behind a toggler.
- **Breadcrumb:** Cyan links with a home icon and grey current page.
- **Pagination:** Bootstrap's, with a cyan active page and grey numeral. Disabled controls are non-links.

### Footer
Solid grey with three columns (brand, contact, explore) and a bottom bar. Text is white at 78% opacity, with cyan uppercase column labels and hairline dividers. Its WhatsApp button is cyan-outlined rather than green, filling cyan on hover. Columns stack and center on mobile.

### Status Ribbon
A square-cornered uppercase ribbon (700, about 1.1rem) that overlays the detail carousel when a property is sold, reserved or rented, using the matching status color.

### Text and Image Section
A home section block with white, light, grey or cyan backgrounds. Its image or carousel is cropped to a circle. `h2` and `h3` headings are cyan on white, light and grey grounds, and grey on cyan.

## Do's and Don'ts

### Do:
- **Do** use the brand tokens and Bootstrap's token overrides before writing custom CSS.
- **Do** set property titles in grey and text on cyan fills in grey, except the operation pills the client specified.
- **Do** invert primary buttons to grey with a cyan label on hover, rather than darkening the cyan.
- **Do** keep a visible focus indicator on every interactive element. Buttons, inputs, pagination and navigation have brand focus styles. The hero Search button, floating WhatsApp button and property cards currently rely on the browser default.
- **Do** honor reduced motion: no logo shrink, no carousel auto-advance, and instant scrolling.

### Don't:
- **Don't** treat existing off-palette UI as precedent. Known drift: `#0684AC` (feature icons and action hover) and `#495057` (detail action links) in `property-detail.css`, the cyan tint on active filter badges, red on "Limpiar todos" and on error text (reference search, error page), the green "Link copiado" badge, and the Bootstrap grey outline buttons in the filters.
- **Don't** set running text in cyan.
- **Don't** use WhatsApp green or status colors for anything other than WhatsApp and property state.
- **Don't** add dark mode or a partial `prefers-color-scheme` block. Swapping text colors without darkening the ground puts bright cyan on white.
- **Don't** add shadows to sections or flat panels.
