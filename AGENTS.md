# AGENTS.md - DZTS Inmobiliaria

This file contains essential information for agentic coding agents working in this repository.

## Monorepo Structure

This is a **pnpm workspace monorepo** with two apps:

```text
apps/
  frontend/   # Next.js 16 website (public-facing)
  studio/     # Sanity Studio CMS (content management)
```

**Important**: This monorepo uses simple pnpm workspaces without Turborepo. Keep the setup simple.

## Build, Lint, and Test Commands

From repository root:

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start both apps in parallel
pnpm build            # Production build for both apps
```

Frontend-specific (from `apps/frontend/`):

```bash
pnpm dev              # Start Next.js dev server with Turbopack
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

Studio-specific (from `apps/studio/`):

```bash
pnpm dev              # Start Sanity Studio
pnpm build            # Build for deployment
pnpm deploy           # Deploy to Sanity hosting
pnpm typegen          # Generate TypeScript types from schema
```

**Note**: This project does not currently have a test suite configured. No test commands are available.

## Project Stack

### Frontend (`apps/frontend/`)

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5 with strict mode
- **Styling**: Bootstrap 5.x + custom CSS
- **CMS Integration**: next-sanity for content fetching
- **Icons**: Bootstrap Icons
- **React**: 19 with React Compiler enabled

### Studio (`apps/studio/`)

- **Framework**: Sanity Studio v5
- **Language**: TypeScript 5
- **React**: 19

## Code Style Guidelines

### File Organization

```text
apps/
├── frontend/                    # Next.js website
│   └── src/
│       ├── app/                 # Next.js App Router pages
│       ├── components/          # React components
│       │   ├── ComponentName.tsx
│       │   └── ComponentName.css
│       ├── sanity/              # Sanity CMS configuration
│       │   ├── lib/             # Client helpers
│       │   └── env.ts
│       └── styles/              # Global styles and variables
└── studio/                      # Sanity Studio
    ├── schemaTypes/             # Content schema definitions
    └── sanity.config.ts         # Studio configuration
```

### Imports and Exports

- Use `type` keyword for type-only imports: `import type { Metadata } from "next"`
- Named imports from libraries: `import { createClient } from 'next-sanity'`
- Use path alias `@/*` for absolute imports: `import Component from "@/components/Component"`
- Default exports for components: `export default function ComponentName() {}`

### Component Patterns

- Add `'use client'` directive at the top for client-side components
- Define prop interfaces above the component function
- Use function declarations for components: `export default function ComponentName() {}`
- Arrow functions acceptable for simple presentational components
- Bootstrap classes for styling, inline styles for dynamic values

### TypeScript Conventions

- Always type function parameters and return types when clear
- Use interfaces for prop definitions: `interface Props { title: string }`
- Strict mode is enabled - no `any` types unless absolutely necessary
- Environment variables validated with `assertValue()` helper in `apps/frontend/src/sanity/env.ts`

### Styling Guidelines

- Use Bootstrap utility classes for layout and spacing
- Co-locate CSS with component: `ComponentName.css` in same directory
- Custom CSS variables defined in `src/styles/variables.css`
- Inline styles only for dynamic values: `style={{ color: primaryColor }}`
- Use Bootstrap's color variables: `var(--bs-primary)`, `var(--bs-dark)`

### Naming Conventions

- **Components**: PascalCase (`PropertyCard.tsx`)
- **Functions/Variables**: camelCase (`getPropertyData`)
- **CSS Files**: kebab-case (`search-properties.css`)
- **CSS Classes**: kebab-case (Bootstrap convention)
- **Constants**: UPPER_SNAKE_CASE (`const API_VERSION`)

### Formatting and Style

- 2-space indentation
- Single quotes for strings
- Semicolons required at end of statements
- Trailing commas in multi-line arrays/objects
- Maximum line length: not strictly enforced but prefer readability
- No code comments unless explicitly required

### Error Handling

- Throw `Error` for invalid configuration/missing env vars
- Use TypeScript strict mode to catch type errors at compile time
- Environment variables must be validated before use (see `apps/frontend/src/sanity/env.ts`)

### Image Handling

- Use Next.js `Image` component for all images
- Set `priority` on above-the-fold images
- Use `fill` prop for full-width/background images with parent positioning
- Add remote domains to `next.config.ts` when using external images

### Environment Variables

Frontend environment variables (in `apps/frontend/.env.local`):

- Client-accessible vars prefixed with `NEXT_PUBLIC_`
- Required: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`
- Optional: `NEXT_PUBLIC_SANITY_API_VERSION` (has default value)
- Optional: `SANITY_API_READ_TOKEN` (for authenticated API requests)

### Next.js Specifics

- Use App Router (no Pages Router)
- Use `layout.tsx` for root layout with metadata
- Client components must have `'use client'` directive
- Server components by default (no directive needed)
- Use Turbopack in development (enabled by default in Next.js 16)

### Sanity CMS Integration

**Frontend** (`apps/frontend/`):

- Client configured in `src/sanity/lib/client.ts`
- Use `sanityFetch` for live content with `<SanityLive />` in layout
- Image URL builder available via `urlFor()` from `src/sanity/lib/image.ts`

**Studio** (`apps/studio/`):

- Runs as a separate app at `http://localhost:3333`
- Schema definitions in `schemaTypes/`
- Run `pnpm typegen` to regenerate TypeScript types after schema changes

### ESLint Rules (Frontend)

- Extends `@typescript-eslint/recommended`
- Next.js core web vitals rules enabled
- React rules with `react/no-inline-styles` disabled
- Linting ignores `.next/` and `node_modules/`
- Run `pnpm lint` from `apps/frontend/` to check code before committing

### Path Aliases (Frontend)

- `@/*` resolves to `./src/*` within `apps/frontend/`
- Configure new aliases in `apps/frontend/tsconfig.json` under `paths`

### Security Headers (Frontend)

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- All configured in `apps/frontend/next.config.ts`

### When Working with This Codebase

1. **Monorepo awareness**: Run commands from appropriate directory (root for both apps, or specific app folder)
2. **Before adding dependencies**: Check if similar functionality exists in Bootstrap or React
3. **Before creating new components**: Check existing components for patterns to follow
4. **When styling**: Prefer Bootstrap classes over custom CSS
5. **When fetching data**: Use Sanity client, ensure proper typing
6. **When modifying types**: Update related components to ensure type safety
7. **Before committing**: Run `pnpm lint` from the frontend directory to verify code quality
8. **When adding images**: Use Next.js Image component with proper props
9. **When changing schema**: Update in `apps/studio/schemaTypes/`, then run `pnpm typegen` in studio
