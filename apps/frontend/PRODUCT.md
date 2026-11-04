# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People in the Rosario area (Santa Fe, Argentina) looking for a home or a commercial space to buy or rent. They search by operation, property type, locality and bedrooms, compare listings, and then write to the broker on WhatsApp.

Property owners deciding whether to list with DZTS are not a confirmed primary audience (see open decisions).

## Product Purpose

DZTS Inmobiliaria's public site is a catalog of the properties it has available for sale or rent. It exists so a visitor can find a suitable property, understand it, and contact the broker about it. Success is a visitor starting a WhatsApp conversation about a property, tracked as the `whatsapp_contact` GA4 event.

## Positioning

You deal directly with César Torres, a licensed broker (Mat. N° 1862 COCIR, Colegio de Corredores Inmobiliarios de Rosario), not a large agency's rotating sales staff.

## Operating Context

- Listings are edited in Sanity Studio. Publishing triggers a rebuild and FTP deploy, so content is only as fresh as the last build.
- Contact happens off-site, mostly on WhatsApp, with a pre-filled message naming the property. The site has no forms, accounts or online transactions.
- Each property has a printable and shareable sheet, the "ficha", at `/propiedades/[slug]/ficha`.

## Capabilities and Constraints

- **Catalog:** home search, `/propiedades` listing with filters, sorting, pagination and reference search, property detail with carousel, lightbox and map, and print-optimized ficha.
- **Fully static export on shared hosting:** no Node server, API routes, middleware, server actions or runtime data. Filtering and pagination run client-side.
- **Language:** Spanish for an Argentine audience (`lang="es"`). Current copy uses voseo ("Encontrá", "Escribinos").
- **Terminology:** Venta and Alquiler for operations; Disponible, Reservado, Vendido and Alquilado for status; Monoambiente; ficha. Prices use `es-AR` formatting with `AR$` and `US$`.
- **Content comes from Sanity or environment variables, not hardcoded values.** Property titles are often all caps in the CMS, and images and other fields can be `null`, so UI must tolerate messy content.

### Open decisions

- Whether to actively win property owners (for example appraisal or service pages). No such page exists today.
- Which office address is canonical. The site says "Rawson 480 Bis", while a 2026-09 audit found directories listing "Don Orione 482" and "Rawson 480 bis".

## Brand Commitments

- Name: DZTS Inmobiliaria. The full logo lockup reads "dzts / inmobiliaria / by César Torres". Logo assets live in Sanity `siteSettings`.
- The client requires the *Manual básico de marca* (May 2015) palette only: cyan `#01BCF3`, grey `#404041` and white, with no derived tones. See `docs/specs/2026-09-28-brand-palette-d-prime.md`.
- The license number and COCIR affiliation are shown on the site.

## Evidence on Hand

- Real listings in Sanity, across Rosario, Funes, Roldán and Granadero Baigorria.
- Broker license, COCIR membership, the AFIP Data Fiscal snippet and certification logos (Sanity `siteSettings`).
- Contact details and office hours, managed in Sanity `siteSettings`.
- Absent, and not to be fabricated: testimonials, sales volumes, years of experience, client counts, awards and press.

## Product Principles

1. **The person is the differentiator.** The direct relationship with a named, licensed broker should be evident; nothing should suggest a large agency.
2. **Every property path leads to a conversation.** Contacting the broker about the property in view is always easy.
3. **Listing facts come first.** Price, operation, status, location and features must be quick to find and accurate.
4. **Credibility is shown, not claimed.** Use verifiable facts such as the license and real listings rather than superlatives.
5. **Stay simple to run.** Features must work on a static host and be maintainable through Studio.

## Accessibility & Inclusion

No formal standard has been set. The client knowingly accepts cyan on white at 2.21:1, below WCAG AA, for prices, links and section headings, so cyan must not carry running text. Reduced-motion preferences are respected across the site.
