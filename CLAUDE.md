# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Stack

Next.js 16 (App Router, `src/` dir, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Better Auth · Drizzle ORM · Postgres on Neon. Path alias `@/*` → `src/*`.

Next.js 16 differs from older versions (e.g. `middleware` is now `proxy`). Check `node_modules/next/dist/docs/` before writing Next-specific code.

## Commands

Package manager is **pnpm** only (`pnpm-lock.yaml`). Node version is pinned in `.node-version` (managed with fnm).

```bash
pnpm dev            # dev server on :3000
pnpm build          # production build
pnpm lint           # eslint
pnpm typecheck      # tsc --noEmit

pnpm db:generate    # drizzle-kit: create SQL migration from schema changes → ./drizzle
pnpm db:migrate     # apply migrations to DATABASE_URL
pnpm db:push        # push schema directly (prototyping only)
pnpm db:studio      # Drizzle Studio
pnpm db:seed        # idempotent catalog seed (tsx, src/db/seed.ts)

pnpm auth:generate  # Better Auth CLI (via pnpm dlx) → writes src/db/schema/auth.ts
```

No test runner is configured yet.

Env vars live in `.env.local` or `.env` (template: `.env.example`): `DATABASE_URL` (Neon pooled URL), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`. Next loads both natively; `drizzle.config.ts` (dotenv) and `db:seed` (`--env-file-if-exists`) load both too, with `.env.local` taking precedence.

## Architecture

- **DB client** — `src/db/index.ts` exports `db`, a Drizzle client over Neon's HTTP driver (`drizzle-orm/neon-http`). It is stateless per query, so it has no interactive transactions; switch to the `neon-serverless` (WebSocket) driver if those are needed.
- **Schema** — `src/db/schema/index.ts` is the barrel that both `db` (typed relational queries) and drizzle-kit (`schema: "./src/db/schema"`) read. Every new table file must be re-exported from it.
- **Auth server** — `src/lib/auth.ts` exports `auth`, built on the Drizzle adapter (`provider: "pg"`) and the shared `db`. No sign-in methods are enabled yet. `nextCookies()` must remain the **last** plugin.
- **Auth tables** — Better Auth's tables are generated, not handwritten. After changing auth config or plugins, run `pnpm auth:generate`, ensure `export * from "./auth"` is in the schema barrel, then `pnpm db:generate && pnpm db:migrate`. Auth endpoints fail at runtime until these tables exist.
- **Auth HTTP** — `src/app/api/auth/[...all]/route.ts` mounts the handler with `toNextJsHandler(auth)`. Client components use `authClient` from `src/lib/auth-client.ts` (same-origin, no baseURL). On the server, call `auth.api.*` directly with `headers: await headers()` instead of using the client.

## Design system

Tailwind v4, CSS-first (no `tailwind.config`). `src/app/globals.css` only imports:
- `src/styles/theme.css`: `@theme` tokens. The default colors, type scale, radii, tracking and breakpoints are **reset**, so stock classes like `text-gray-500`, `rounded-lg` or `2xl:` don't exist. Use the semantic tokens (`bg-bg-muted`, `text-fg-muted`, `border-border-strong`, `aspect-product`, `ease-editorial`). Breakpoints: `sm` 480, `md` 768, `lg` 1024, `xl` 1440.
- `src/styles/base.css`: per-breakpoint runtime vars (`--gutter`, `--header-height`, `--section-space`, exposed as `px-gutter`, `h-header`, `py-section`) and element defaults.
- `src/styles/primitives.css`: `@utility` primitives for layout (`page-container`, `grid-12`, `product-grid`), media (`media-frame`, `media-product`), type roles (`type-*`), buttons (`btn` + `btn-primary|secondary|inverse|ghost`, `btn-icon`), links (`link`, `link-quiet`) and forms (`field`). Prefer these over ad-hoc utility stacks.

Visual rules: the UI is monochrome (imagery supplies the color) and light-only. Corners are square (radius only on `xs` inputs and round icon buttons), borders are 1px hairlines, and text labels are 12px. Fonts come from `next/font` in `layout.tsx`: Hanken Grotesk (`--font-hanken` → `font-sans`) and EB Garamond (`--font-garamond` → `font-serif`, wordmark only).

## Storefront

- **Catalog** — products, categories and product images live in Postgres (`src/db/schema/catalog.ts`). Stock is the `products.stock` column (no variants yet), prices are integer cents, and image `position` 0 is the card shot. Read products only through `src/lib/catalog.ts` (`getProduct`, `getNewArrivals`, `getProductsBySlugs`, `getRelatedProducts`), which maps rows to the `Product` view type. Seed data is in `src/db/seed-data.ts`.
- `src/lib/sample-data.ts` holds editorial content only (hero, category tiles, collections, nav, footer). The featured collection references products by `productSlugs`. Photos come from `images.unsplash.com` (allowed in `next.config.ts` under `/photo-*` only); URL helpers are in `src/lib/unsplash.ts`.
- Pages that read the catalog use `export const revalidate = 60` (ISR). `pnpm build` needs `DATABASE_URL` pointing at a migrated, seeded database.
- `SiteHeader` and `SiteFooter` are rendered from the root layout. The header is transparent only on routes in `OVERLAY_ROUTES` (pages that open on a full-bleed image). Other pages must add `pt-header` themselves so content isn't hidden under the fixed header.
- Homepage sections live in `src/components/home/`. Product UI (`ProductCard`, `ProductGallery`, `ProductInfo`, `StockStatus`, `Disclosure`) lives in `src/components/product/`.
- The product detail page is `src/app/products/[slug]/page.tsx`, statically generated from `getProductSlugs()`. Stock states come from `getStockState()` in `src/lib/stock.ts`: 0 is out of stock, 3 or fewer is low stock. Use that function rather than comparing `stock` inline.
- Gallery images beyond the first are `detail()` crops: 3:4 focal-point zooms of the primary Unsplash photo. Check crops visually; zooms can expose brand labels.
- next/image in Next 16: use `preload` for above-the-fold images (`priority` is deprecated). The default `qualities` is `[75]`.

## pnpm build scripts

`pnpm-workspace.yaml` → `allowBuilds` whitelists esbuild (needed by drizzle-kit). It explicitly denies `@prisma/client` and `better-sqlite3`, which pnpm auto-installs as optional peers of better-auth and this project doesn't use. New packages with install scripts will fail `pnpm install` until they're added there.
