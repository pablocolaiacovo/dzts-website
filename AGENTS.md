# AGENTS.md - DZTS Inmobiliaria

This file contains essential information for agentic coding agents working in this repository.

## Build, Lint, and Test Commands

```bash
pnpm run dev          # Start development server (Next.js 16 with Turbopack)
pnpm run build        # Production build
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
```

**Note**: This project does not currently have a test suite configured. No test commands are available.

## Project Stack

- **Framework**: Next.js 16.1.1 with App Router
- **Language**: TypeScript 5 with strict mode
- **Styling**: Bootstrap 5.3.5 + custom CSS modules
- **CMS**: Sanity v5 for content management
- **Icons**: Bootstrap Icons 1.12.1
- **React**: 19.2.3 with React Compiler enabled

## Code Style Guidelines

### File Organization

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ComponentName.tsx
│   └── ComponentName.css
├── sanity/          # Sanity CMS configuration
│   ├── lib/         # Client helpers
│   ├── schemaTypes/
│   └── env.ts
└── styles/          # Global styles and variables
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
- Environment variables validated with `assertValue()` helper in `src/sanity/env.ts`

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
- Environment variables must be validated before use (see `src/sanity/env.ts`)

### Image Handling

- Use Next.js `Image` component for all images
- Set `priority` on above-the-fold images
- Use `fill` prop for full-width/background images with parent positioning
- Add remote domains to `next.config.ts` when using external images

### Environment Variables

- Client-accessible vars prefixed with `NEXT_PUBLIC_`
- Store in `.env.local` (gitignored)
- Required env vars: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`
- Optional env var: `NEXT_PUBLIC_SANITY_API_VERSION` (defaults to '2025-05-06')

### Next.js Specifics

- Use App Router (no Pages Router)
- Use `layout.tsx` for root layout with metadata
- Client components must have `'use client'` directive
- Server components by default (no directive needed)
- Use Turbopack in development (enabled by default in Next.js 16)

### Sanity CMS Integration

- Client configured in `src/sanity/lib/client.ts`
- Use `sanityFetch` for live content with `<SanityLive />` in layout
- Schema definitions in `src/sanity/schemaTypes/`
- Image URL builder available via `urlFor()` from `src/sanity/lib/image.ts`
- Studio available at `/studio` route

### ESLint Rules

- Extends `@typescript-eslint/recommended`
- Next.js core web vitals rules enabled
- React rules with `react/no-inline-styles` disabled
- Linting ignores `.next/` and `node_modules/`
- Run `pnpm run lint` to check code before committing

### Path Aliases

- `@/*` resolves to `./src/*`
- Configure new aliases in `tsconfig.json` under `paths`

### Security Headers

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- All configured in `next.config.ts`

### When Working with This Codebase

1. **Before adding dependencies**: Check if similar functionality exists in Bootstrap or React
2. **Before creating new components**: Check existing components for patterns to follow
3. **When styling**: Prefer Bootstrap classes over custom CSS
4. **When fetching data**: Use Sanity client, ensure proper typing
5. **When modifying types**: Update related components to ensure type safety
6. **Before committing**: Run `pnpm run lint` to verify code quality
7. **When adding images**: Use Next.js Image component with proper props
