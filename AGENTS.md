# maminco-frontend

Next.js 16 (App Router) + React 19 + Tailwind v4 + TypeScript.

## Surfaces

- Marketing landing at `/` (`app/(marketing)`).
- Admin back-office at `/dashboard, /areas, /categories, /products, /tables, /orders, /payments,
  /users, /ai, /settings` (`app/(admin)`).
- POS terminal at `/pos/tables` and `/pos/orders/[tableId]` (`app/(pos)`).

## Commands

```bash
cp .env.example .env.local      # NEXT_PUBLIC_API_URL / NEXT_PUBLIC_SOCKET_URL (default :3000)
npm install
npm run dev                     # port 3001
npm run lint                    # 0 errors expected; warnings are pre-existing `any`s
npm run build                   # must succeed; the only typecheck
```

There is no test runner.

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

Full rules: `docs/FRONTEND-CONVENTIONS.md`. Read it before adding a feature. Charts use **recharts**
(see `docs/CHARTING.md`; mobile uses Victory Native).

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
- **API base:** read `process.env.NEXT_PUBLIC_API_URL` via `lib/http/client.ts`. Never hardcode.
- **Auth:** Zustand store `hooks/useAuth.tsx` (localStorage `maminco-auth`) + a `token` cookie read
  by `middleware.ts`, which gates protected prefixes and redirects to `/auth/login`.
- **Realtime:** socket.io client in `lib/realtime/socket.ts` / `features/pos/orders/hooks/useOrderSocket.ts`.
- Path alias `@/*` maps to the repo root.
- Tailwind v4 is configured ONLY via `postcss.config.mjs` + `@theme` in `globals.css`. Do not
  re-add `tailwind.config.cjs`/`postcss.config.cjs`.
