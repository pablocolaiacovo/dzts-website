# DZTS Inmobiliaria

A real estate website built as a pnpm monorepo.

## Structure

```text
apps/
  frontend/   # Next.js website
  studio/     # Sanity Studio CMS
```

## Apps

### Frontend

Public-facing website built with Next.js 16 and React 19. Displays property listings for rent and sale, fetching content from Sanity CMS. Styled with Bootstrap 5.

### Studio

Sanity Studio for content management. Used to create and edit properties, images, and other site content.

## Requirements

- Node.js >= 20.0.0
- [pnpm](https://pnpm.io/) >= 10.0.0

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run both apps in development mode:

```bash
pnpm dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Studio: [http://localhost:3333](http://localhost:3333)

## Scripts

| Command      | Description                          |
|--------------|--------------------------------------|
| `pnpm dev`   | Start both apps in development mode  |
| `pnpm build` | Build both apps for production       |

## Sanity Configuration

1. Create an account on [Sanity](https://www.sanity.io/) and accept the project invitation.
1. Create a `.env.local` file in `apps/frontend/` with:

    ```bash
    NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
    NEXT_PUBLIC_SANITY_DATASET=your_dataset
    SANITY_API_READ_TOKEN=your_api_token
    ```

1. Get these values from your Sanity project settings. The read token can be created in the API section.
