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

### Frontend (`apps/frontend/`)

| Command      | Description                          |
|--------------|--------------------------------------|
| `pnpm dev`   | Start Next.js dev server             |
| `pnpm build` | Production build                     |
| `pnpm lint`  | Run ESLint                           |

### Studio (`apps/studio/`)

| Command        | Description                          |
|----------------|--------------------------------------|
| `pnpm dev`     | Start Sanity Studio                  |
| `pnpm build`   | Build for deployment                 |
| `pnpm deploy`  | Deploy to Sanity hosting             |
| `pnpm typegen` | Generate TypeScript types from schema|

## Environment Variables

Each app has a `.env.example` file. Copy it to `.env.local` and fill in your values:

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/studio/.env.example apps/studio/.env.local
```

Get the Sanity project ID and dataset from your [Sanity project settings](https://www.sanity.io/manage). The Web3Forms key is needed for the contact form — get one at [web3forms.com](https://web3forms.com).

## Cache Revalidation Webhook

The frontend uses on-demand cache revalidation so content changes published in Sanity appear immediately. This requires a webhook configured in the Sanity dashboard.

### 1. Generate a secret

```bash
openssl rand -hex 32
```

Add the output as `SANITY_REVALIDATE_SECRET` in `apps/frontend/.env.local`.

### 2. Create the webhook in Sanity

Go to **sanity.io/manage → Project → API → Webhooks → Add webhook** and configure:

| Setting | Value |
|---------|-------|
| Name | `Revalidate Next.js cache` |
| URL | `https://<your-domain>/api/revalidate` |
| Dataset | your dataset name |
| Trigger on | Create, Update, Delete |
| Filter | `_type in ["property", "siteSettings", "homePage", "propiedadesPage", "city", "propertyTypeCategory"]` |
| Projection | `{_type}` |
| Secret | same value as `SANITY_REVALIDATE_SECRET` |

Without the webhook (e.g. local development), cache entries still expire based on their `cacheLife` TTL (`"minutes"` or `"hours"`).

### Testing locally

With the dev server running, you can simulate a webhook call using curl. Replace `YOUR_SECRET` with your `SANITY_REVALIDATE_SECRET` value and `_type` with the Sanity document type to revalidate:

```bash
BODY='{"_type":"property"}'
SECRET="YOUR_SECRET"
TS=$(date +%s%3N)
SIG=$(echo -n "${TS}.${BODY}" \
  | openssl dgst -sha256 -hmac "$SECRET" -binary \
  | openssl base64 \
  | tr '+/' '-_' | tr -d '=')

curl -s http://localhost:3000/api/revalidate \
  -X POST \
  -H "Content-Type: application/json" \
  -H "sanity-webhook-signature: t=${TS},v1=${SIG}" \
  -d "$BODY"
```

A successful response looks like: `{"revalidated":true,"tag":"property"}`
