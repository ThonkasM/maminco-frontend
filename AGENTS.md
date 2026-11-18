# maminco-frontend

Next.js 16 (App Router) + React 19 + Tailwind v4 + TypeScript.

## Surfaces

- Marketing landing at `/` (`app/(marketing)`).
- Admin back-office at `/dashboard, /areas, /categories, /products, /tables, /orders, /payments,
  /users, /ai, /settings` (`app/(admin)`).
- POS terminal at `/pos/tables` and `/pos/orders/[tableId]` (`app/(pos)`).
- Also: `/reports`, `/features` (admin), `/kitchen` (`app/(kitchen)`), `/auth/login`, `/unauthorized`, and Next
  route handlers under `app/api/printing/*` (they delegate to `lib/server/backend-proxy.ts`; client code calls
  them through `features/printing/api.ts`). To reset modal state on open use `hooks/useResetOnChange`, not an effect.

## Commands

```bash
cp .env.example .env.local      # NEXT_PUBLIC_API_URL / NEXT_PUBLIC_SOCKET_URL (default :3000)
npm install
npm run dev                     # port 3001
npm run lint                    # 0 errors expected; remaining warnings are pre-existing react-hooks rules
npm run build                   # must succeed; the only typecheck
npm test                        # vitest (unit tests in tests/, no network/DB)
npm run test:cov                # with v8 coverage
```

Unit tests cover `lib/` and `proxy.ts`; there are no component tests.

## Architecture (feature-based)

`app/` is **routing only** — each `page.tsx` is a thin wrapper that renders a feature page
component. All feature code lives in `features/<domain>/`:

```
features/<domain>/{api.ts, hooks/, components/}
components/ui/          design-system primitives — the single source of truth
components/layout/      app shells, nav, marketing chrome
components/shared/      ConfirmDialog, ToastProvider
components/providers/   React Query, theme, mode
lib/http/client.ts      apiFetch / ApiError (the ONLY place that calls fetch)
lib/utils/              cn, currency, errors, ...
lib/realtime/           socket.io client
```

Full rules: `docs/FRONTEND-CONVENTIONS.md`. Read it before adding a feature. Charts use **@tanstack/charts**
through the wrappers in `components/charts` (`TrendChart`, `DonutChart`, `BarListChart`, `ColumnChart`);
mobile uses Victory Native. Tables use TanStack Table via `DataTable`.

## Conventions

- **English identifiers/comments; Spanish UI copy.**
- **Data layer:** `apiFetch` from `@/lib/http/client` in `features/<d>/api.ts`; server state via
  **React Query** (`useQuery`/`useMutation` + `invalidateQueries`) in `features/<d>/hooks`. Never
  call `fetch` directly, never fetch in `useEffect`.
- **Design system:** use primitives from `@/components/ui` and semantic Tailwind tokens
  (`bg-background`, `bg-surface`, `text-foreground`, `text-muted-foreground`, `border-border`,
  `bg-primary text-primary-foreground`, `bg-accent`, `text-danger`, ...). No raw palette
  (`bg-slate-*`, `bg-blue-600`), no emoji — use `lucide-react`. See `docs/DESIGN-SYSTEM.md`.
- **Theming:** `next-themes` `attribute="class"`; `dark:` follows the `.dark` class
  (`@custom-variant dark` in `globals.css`). Theme toggle in `components/theme/`.
- **API base:** read `process.env.NEXT_PUBLIC_API_URL` via `lib/http/client.ts`. Never hardcode; import `API_BASE`
  everywhere (route handlers and socket included).
- **Auth:** Zustand store `hooks/useAuth.tsx` (localStorage `maminco-auth`) + a `token` cookie
  (`SameSite=Lax`, `Secure` on https) read by `proxy.ts` (Next 16's renamed middleware), which decodes the
  JWT (no signature check) to redirect on expiry and enforce role per route prefix.
- **Types:** enums and role groups live only in `lib/types/enums.ts` (must match `../contratos.md`).
- **Realtime:** single socket.io `/orders` client in `lib/realtime/socket.ts`; consume it with
  `useOrdersSocket` (`lib/realtime/useOrdersSocket.ts`) and typed events from `lib/realtime/events.ts`.
- **Query stale times:** use `STALE_TIME` from `lib/query/staleTimes.ts`. Charts load via `next/dynamic`.
- Path alias `@/*` maps to the repo root.
- **Money:** never treat it as a plain `number` from the API — Prisma `Decimal` may arrive as a
  string. Use `parseMoney`/`roundMoney` (`lib/utils/money.ts`) and `formatCurrency`. See
  `../maminco-backend/docs/MONEY.md`.
- Tailwind v4 is configured ONLY via `postcss.config.mjs` + `@theme` in `globals.css`. Do not
  re-add `tailwind.config.cjs`/`postcss.config.cjs`.
