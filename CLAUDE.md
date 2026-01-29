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
- `/propiedades` - Properties listing page
- `/propiedades/[slug]` - Property detail page with images, description, and location map

### Content Integration

- Property schema includes: title, subtitle, address, description, price, images, operationType (rent/sale), currency, city, and propertyType
- Site Settings singleton in Sanity stores office address for home page map display
- All property and site data is fetched server-side via `sanityFetch` for optimal performance

## Components

- **MapSection** - Reusable component for displaying embedded Google Maps. Renders full-width iframe (450px height) when address is provided, returns null if no address exists.

## Conventions

- Components in `/app` are Server Components unless marked with `"use client"`
- Use Next.js Metadata API for SEO (exported `metadata` object)
- Use `next/image` for optimized images
- Dark mode supported via `prefers-color-scheme` CSS media query.
- Don't add too many comments to the code.
- Use double quotes for strings (Prettier is pre-configured for this).
- Use mobile first for css.
- Prefer bootstrap css classes and components over custom css.
- Use CSS over JavaScript when possible for animations and dynamic behavior.
