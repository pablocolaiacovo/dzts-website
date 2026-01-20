# DZTS Inmobiliaria

## Requirements

- [pnpm](https://pnpm.io/)

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Sanity Studio

### Configuration

1. Create an account on [Sanity](https://www.sanity.io/).
2. Accept the invitation to the project.
3. Create a `.env.local` file in the root of your project and add the following variables:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=your_dataset
```

4. Replace `your_project_id` and `your_dataset` with the actual values from your Sanity project.
5. Create a read token in the Sanity project settings and add it to your `.env.local` file:

```bash
SANITY_API_READ_TOKEN=your_api_token
```

6. Replace `your_api_token` with the actual token you created in the Sanity project settings.
