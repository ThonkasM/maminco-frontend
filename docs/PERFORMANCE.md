# Performance, security and realtime changes

## Measurements (production build, Turbopack, gzip of the scripts referenced by each prerendered page)

| Route | Before | After |
|---|---|---|
| `/dashboard` | 385.9 KB | 277.8 KB |
| `/reports` | 392.9 KB | 278.1 KB |
| `/ai` | 390.8 KB | 277.0 KB |
| `/tools/basis-path`, `/`, `/pos/tables` | unchanged | unchanged |

"Before" is the same tree built with the three chart pages importing Recharts statically. Recharts now loads
through `next/dynamic` (`ssr: false`, `ChartSkeleton` placeholder) in the 6 chart components.
Measure again with a build and summing `.next/static/chunks/*.js` referenced by `.next/server/app/<route>.html`.

Public assets: removed the 5 unused template SVGs; UI logos use `maminco-logo-128.png` (30 KB) instead of the
512 px, 280 KB `maminco-logo.png` (still shipped for external references).

## Build output

`next.config.ts` sets `output: 'standalone'`, AVIF/WebP image formats, `poweredByHeader: false` and basic
security headers (nosniff, frame deny, referrer policy, permissions policy, HSTS). `metadataBase` reads
`NEXT_PUBLIC_SITE_URL`. After `npm run build`, run with `node .next/standalone/server.js`; copy `public/` and
`.next/static/` next to it (`standalone/public`, `standalone/.next/static`) or serve them from a CDN.

## Auth

- Cookie `token`: `Path=/; Max-Age=<JWT exp>; SameSite=Lax` plus `Secure` on https (`lib/auth/cookie.ts`).
  It is JS-readable by design (the SPA store also holds the token); the backend remains the security boundary.
- `proxy.ts` decodes the JWT without verifying the signature (`lib/auth/jwt.ts`): expired or malformed
  token -> `/auth/login?expired=1` and the cookie is cleared; wrong role for the prefix -> `/unauthorized`
  (`COOK` -> `/kitchen`). Role sets live in `lib/types/enums.ts`.
- The Zustand store drops expired tokens on rehydrate and re-syncs the cookie.

## Realtime (`lib/realtime`)

One `/orders` client (`socket.ts`, ref-counted, closes 1 s after the last consumer) with infinite reconnection
(1 s -> 15 s backoff with jitter). `useOrdersSocket` registers typed handlers (`events.ts`, no `any`), emits
`join:table` / `leave:table` / subscribe events on every `connect`, and calls `off` for each handler on cleanup.
The kitchen cache is updated with `setQueryData` from `kitchen:orders:snapshot` and
`order:kitchen-status:changed`; other events invalidate the query. The POS table grid already used
`setQueryData`.

## React Query stale times (`lib/query/staleTimes.ts`)

`live` 5 s (orders, active order, tables), `list` 30 s, `catalog` 5 min (areas, categories, products),
`reference` 10 min (payment methods, denominations, feature flags). Mutations still invalidate.

## Types

`lib/types/enums.ts` is the single source for `UserRole` (includes `COOK`), `OrderStatus`, `TableStatus`,
`OrderKitchenStatus`, payment method codes and role groups; feature `api.ts` files re-export from it.
Long term the contract should be generated from OpenAPI.

## Basis path tool (`/tools/basis-path`)

`lib/utils/basisPath.ts`: V(G) = E - N + 2P; candidate paths are the shortest walk through every edge plus a
bounded DFS fallback (`MAX_STEPS` steps, `MAX_PATHS` paths); the V(G) paths are selected shortest-first with
exact fraction-free Gaussian elimination on edge-count vectors (BigInt, rank over Q, not GF(2)). The page shell
is a server component; `BasisPathTool`/`BasisPathResults`/`BasisPathGraph` are the client parts (SVG graph with
the selected path highlighted, copy Markdown, export CSV/Markdown).

Verification (no dependencies): `node --experimental-strip-types scripts/verify-basis-path.mjs`
covers sequence, if, while, `OrdersService.create` (V=10) and `PaymentsService.processPayment`
(N=20, E=30, V=12), 300 random cyclic graphs, and error messages.
