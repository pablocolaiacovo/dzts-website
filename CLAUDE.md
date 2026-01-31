# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About Website

This is a small real estate website, to work as a catalog of the available properties for rent or sale.

## Monorepo Structure

This is a **pnpm workspace monorepo** with two apps:

```text
apps/
  frontend/   # Next.js 16 website (public-facing)
  studio/     # Sanity Studio CMS (content management)
```

**Note**: The monorepo uses simple pnpm workspaces without Turborepo. This was a deliberate decision to keep the setup simple for a two-app monorepo without shared packages.

## Build & Development Commands

From the repository root:

```bash
pnpm install  # Install all dependencies
pnpm dev      # Start both apps in parallel (frontend + studio)
pnpm build    # Production build for both apps
```

Frontend-specific (from `apps/frontend/`):

```bash
pnpm dev      # Start Next.js dev server with Turbopack
pnpm build    # Production build
pnpm start    # Run production server
pnpm lint     # Run ESLint
```

Studio-specific (from `apps/studio/`):

```bash
pnpm dev      # Start Sanity Studio
pnpm build    # Build for deployment
pnpm deploy   # Deploy to Sanity hosting
pnpm typegen  # Generate TypeScript types from schema
```

## Tech Stack

### Frontend (`apps/frontend/`)

- **Next.js 16** with App Router
- **React 19** with Server Components by default
- **TypeScript** with strict mode
- **Bootstrap 5.x** for styling
- **next-sanity** for CMS integration

### Studio (`apps/studio/`)

- **Sanity Studio v5** for content management
- **React 19**
- **TypeScript**

## Environment Variables

Each app has its own `.env.local` file with different prefixes (Next.js uses `NEXT_PUBLIC_`, Sanity Studio uses `SANITY_STUDIO_`).

### Frontend (`apps/frontend/.env.local`)

| Variable                         | Description                       |
| -------------------------------- | --------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`  | Sanity project identifier         |
| `NEXT_PUBLIC_SANITY_DATASET`     | Sanity dataset name               |
| `NEXT_PUBLIC_WEB3FORMS_KEY`      | Web3Forms API key for contact form|
| `SANITY_REVALIDATE_SECRET`       | HMAC secret for Sanity webhook (server-only, no `NEXT_PUBLIC_` prefix) |

### Studio (`apps/studio/.env.local`)

| Variable                   | Description               |
| -------------------------- | ------------------------- |
| `SANITY_STUDIO_PROJECT_ID` | Sanity project identifier |
| `SANITY_STUDIO_DATASET`    | Sanity dataset name       |

See `.env.example` files in each app for templates.

## Architecture

### Frontend

Next.js App Router project:

- `apps/frontend/src/app/` - Routes and layouts (file-based routing)
- `apps/frontend/src/components/` - React components
- `apps/frontend/src/lib/` - Shared utility functions (e.g., `filters.ts`)
- `apps/frontend/src/types/` - Shared TypeScript type definitions (e.g., `filters.ts`)
- `apps/frontend/src/sanity/` - Sanity client and configuration
- `apps/frontend/src/styles/` - Global styles and CSS variables

Path alias: `@/*` maps to `./src/*` within the frontend app

### Studio

Sanity Studio project:

- `apps/studio/schemaTypes/` - Content schema definitions
- `apps/studio/sanity.config.ts` - Studio configuration

## Git Workflow

- **Default PR Target**: Create PRs against the `dev` branch, not `main`
- Feature branches follow the naming convention: `feat/feature-name`
- Push changes and create PRs using `gh pr create` command

## Page Structure & Routes

### Frontend Routes

- `/` - Home page with search, featured properties, and location map
- `/propiedades` - Properties listing page with filters, pagination, and active filter badges
- `/propiedades/[slug]` - Property detail page with images, description, JSON-LD structured data, and location map
- Custom `not-found.tsx` (branded 404 page) and `error.tsx` (error boundary with retry) at app root

### Content Integration

- Property schema includes: title, subtitle, address, description, price, images, operationType (rent/sale), currency, city, and propertyType
- Site Settings singleton in Sanity stores office address for home page map display
- All property and site data is fetched server-side via `sanityFetch` for optimal performance

## Components

- **MapSection** - Reusable component for displaying embedded Google Maps. Renders full-width iframe (450px height) when address is provided, returns null if no address exists.
- **ContactButton** - Client component that wraps a button + dynamically imported `ContactModal`. Used on the property detail page (server component) to open the contact form without making the entire page a client component.
- **ContactModal** - Client component with Web3Forms integration for the contact form. Dynamically imported (`next/dynamic`, `ssr: false`) wherever used.

## Conventions

- Components in `/app` are Server Components unless marked with `"use client"`
- Use Next.js Metadata API for SEO (exported `metadata` object). The root layout uses a `title.template` (`"%s | DZTS Inmobiliaria"`), so child pages only set the page-specific part (e.g., `title: "Propiedades"`, not `"Propiedades | DZTS Inmobiliaria"`).
- Use `next/image` for optimized images
- Dark mode supported via `prefers-color-scheme` CSS media query.
- Don't add too many comments to the code.
- Use double quotes for strings (Prettier is pre-configured for this).
- Use mobile first for css.
- Prefer bootstrap css classes and components over custom css.
- Use CSS over JavaScript when possible for animations and dynamic behavior.
- Format prices with `toLocaleString("es-AR")` and display currency as `AR$`/`US$` (not `ARS`/`USD`).
- Shared types go in `src/types/`, shared utilities in `src/lib/`. Do not duplicate type definitions or utility functions across components — import from the shared location.

## Caching Strategy

The frontend uses Next.js 16 cache components (`"use cache"` directive + `cacheLife()` + `cacheTag()`):

- **`cacheLife("hours")`** - For rarely-changing data: site settings, SEO, page headings, map address.
- **`cacheLife("minutes")`** - For content that updates more often: featured properties, individual property detail pages, home sections, filter option lists.
- Cached functions are standalone `async function` with `"use cache"` as the first line, calling `sanityFetch` inside.
- Every cached function includes a `cacheTag()` call matching the Sanity document `_type` it queries, enabling on-demand revalidation via webhook.

### Cache Tags

| Tag | Sanity `_type` | Cached functions |
|-----|----------------|-----------------|
| `"siteSettings"` | `siteSettings` | `getSiteSettings()`, `getCachedMapAddress()`, `getCachedSiteSeo()` |
| `"property"` | `property` | `getCachedProperty()`, `FeaturedProperties`, `getCachedRoomCounts()` |
| `"homePage"` | `homePage` | `getCachedHomeSections()`, `getCachedHomeContent()`, `getCachedHomeSeo()` |
| `"propiedadesPage"` | `propiedadesPage` | `getCachedPropiedadesHeading()`, `getCachedPropiedadesSeo()` |
| `"city"` | `city` | `getCachedCities()` |
| `"propertyTypeCategory"` | `propertyTypeCategory` | `getCachedPropertyTypes()` |

### On-Demand Revalidation

- A webhook route at `POST /api/revalidate` (`src/app/api/revalidate/route.ts`) receives Sanity webhook payloads, validates the HMAC signature via `parseBody` from `next-sanity/webhook`, and calls `revalidateTag(body._type, "max")`.
- The `"max"` second argument is required by Next.js 16 to invalidate cache entries across all cache life profiles.
- The webhook must be configured in the Sanity dashboard (see README for setup instructions).
- Without the webhook (e.g. local development), `cacheLife` TTLs still apply as a fallback.

## SEO

- Root layout defines `metadata.title.template` so child pages only set the page-specific title string.
- Property detail pages include `<script type="application/ld+json">` with Schema.org `RealEstateListing` data (name, price, address, images).
- Property detail pages generate OpenGraph metadata via `generateMetadata()`.
- Ensure only one `<h1>` per page. Section headings within page content should use `<h2>` or lower.

## Recent Implementation Notes

- Listing skeleton: `apps/frontend/src/app/propiedades/loading.tsx` mirrors `PropertiesLayout` (filters sidebar + badges/count + grid).
- Property detail skeleton: `apps/frontend/src/app/propiedades/[slug]/loading.tsx` includes carousel-sized media + 450px map placeholder.
- Sanity property images can have `url`/`metadata` as `null`; normalize before passing to `ImageCarousel` and only cast to `SanityImageSource` when `url` is present.
- `ImageCarousel` accepts `asset?: SanityImageSource | null` and `lqip?: string | null`. Uses `.quality(80)` for consistent compression.
- Property detail `description` is Portable Text; use `PortableTextBlock[] | null` and import `@portabletext/types` (dependency added to frontend).
- `FilterOption` and `FilterOptions` types live in `src/types/filters.ts`. The `parseMultiple()` and `buildFilterOptions()` helpers live in `src/lib/filters.ts`. Both pages and multiple components import from these shared modules.
- `ContactButton` is the pattern for triggering the contact modal from server components — a thin client component that manages modal state and dynamically imports `ContactModal`.
- Only one image per page should have `priority` (the LCP candidate). Do not mark logos or secondary images as priority.
- The `html` element uses `lang="es"` (Spanish site targeting Argentine audience).
- Home page sections come from the `homePage` singleton (`apps/frontend/src/sanity/queries/homePage.ts`) and render via `TextImageSection` with Portable Text and images.
- `homePage.sections[]` includes optional `anchorId` for header anchors (e.g., `/#servicios`, `/#nosotros`).
- Header smooth-scrolls to anchors when already on `/` and updates the hash without full navigation.
- `TextImageSection` supports a carousel (multiple images) and uses `asset.url` directly when present (fallback to `urlFor`).
- Anchored sections use `scroll-margin-top: 60px` to offset the sticky header.
- Webhook revalidation route: `src/app/api/revalidate/route.ts`. Uses `parseBody` from `next-sanity/webhook` for HMAC validation and `revalidateTag(type, "max")` from `next/cache`.
- In Next.js 16, `revalidateTag()` requires two arguments: `(tag, profile)`. Pass `"max"` as the profile to revalidate all cache entries for a tag regardless of their original `cacheLife`.
- The `/propiedades` listing page calls `sanityFetch` directly without `"use cache"` (dynamic `searchParams`), so it has no cache tag and is unaffected by revalidation.
