# Agent Guidelines for DZTS Inmobiliaria

This file provides guidance for AI agents working on this Next.js real estate website.

Tech stack: Next.js 16, React 19, TypeScript, Sanity CMS, Bootstrap 5, Tailwind CSS 4, SCSS

## Build & Development Commands

```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint on all files
```

**Note**: No test framework is configured. When adding tests, choose a framework that fits the codebase.

## Code Style Guidelines

### File Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - React components
- `src/sanity/` - Sanity CMS configuration and utilities
- `styles/` - Global styles and Bootstrap overrides

### Imports

- Use ES modules with `import/export`
- Use `@/*` alias for src directory imports (configured in tsconfig.json)
- Type imports: `import type { TypeName }` for type-only imports
- Order: external dependencies first, then internal imports

```typescript
import type { Metadata } from 'next';
import { createClient } from 'next-sanity';
import PropertyCard from '@/components/PropertyCard';
```

### Components

- Use functional components with explicit returns
- Client components must include `'use client'` at the top of the file
- Component files: PascalCase (e.g., `PropertyCard.tsx`)
- Use TypeScript interfaces for component props

```typescript
'use client';

interface ComponentProps {
  title: string;
  items: string[];
}

export default function Component({ title, items }: ComponentProps) {
  return <div>{content}</div>;
}
```

### TypeScript

- Strict mode enabled in tsconfig.json
- All components should be properly typed
- Use `Readonly<>` for complex prop types

```typescript
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html>{children}</html>;
}
```

### Styling

- **Primary**: Bootstrap 5 utility classes
- **Secondary**: Custom SCSS files for component-specific styles
- Inline styles are allowed (ESLint rule disabled)
- Custom variables in `styles/custom-variables.scss` using `$primary: #01BCF3`

```tsx
<div className="container py-4">
  <div className="row justify-content-center">
    <div className="col-12 col-md-4">Content</div>
  </div>
</div>
```

### Naming Conventions

- **Components**: PascalCase (`PropertyCard`, `FeaturedProperties`)
- **Functions/Variables**: camelCase (`createClient`, `assertValue`)
- **Constants**: UPPER_SNAKE_CASE for global constants
- **Files**: PascalCase for components, kebab-case for utilities
- **Sanity schemas**: camelCase type exports, lowercase schema names

### Sanity CMS Integration

- Schema types in `src/sanity/schemaTypes/`
- Use `defineType` and `defineField` from `sanity`
- Environment variables validated in `src/sanity/env.ts`
- Client configured in `src/sanity/lib/client.ts`

```typescript
import { defineType, defineField } from 'sanity';

export const propertyType = defineType({
  name: 'property',
  title: 'Properties',
  type: 'document',
  fields: [defineField({ name: 'title', title: 'Title', type: 'string' })]
});
```

### Error Handling

- Validate environment variables with assertion helper
- Use TypeScript optional chaining for potentially null/undefined values

```typescript
function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) throw new Error(errorMessage);
  return v;
}
```

### ESLint & Configuration

- ESLint with TypeScript and Next.js rules
- Inline styles allowed: `react/no-inline-styles: off`
- Core Web Vitals enabled
- React Compiler enabled in next.config.ts

### Images

- Use `next/image` component for all images
- Specify width, height, and objectFit for responsive images
- Configure remote domains in `next.config.ts` when adding external images

```tsx
<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={400}
  height={220}
  style={{ objectFit: 'cover' }}
/>
```

## Before Submitting Changes

1. Run `npm run lint` to ensure code passes ESLint
2. Verify TypeScript types with editor or build process
3. Test responsive design (mobile, tablet, desktop)
4. Ensure all imports are properly typed
5. Check that Bootstrap and SCSS styles are correctly applied

## Important Notes

- The project uses both Bootstrap and Tailwind CSS (prefer Bootstrap for consistency)
- Spanish language content in UI
- Primary brand color: `#01BCF3` (cyan blue)
