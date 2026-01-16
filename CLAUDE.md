# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About Website

This is a small real-state website, to work as a catalog of the available properties for rent or sale.

## Build & Development Commands

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Production build
npm run start    # Run production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Next.js 16** with App Router (`/src/app`)
- **React 19** with Server Components by default
- **TypeScript** with strict mode
- **Bootstrap 5.x**

## Architecture

This is a Next.js App Router project:
- `src/app/` - Routes and layouts (file-based routing)
- `src/app/layout.tsx` - Root layout with Geist font configuration
- `src/app/globals.css` - Global styles with Tailwind and CSS variables for theming

Path alias: `@/*` maps to `./src/*`

## Conventions

- Components in `/app` are Server Components unless marked with `"use client"`
- Use Next.js Metadata API for SEO (exported `metadata` object)
- Use `next/image` for optimized images
- Dark mode supported via `prefers-color-scheme` CSS media query
