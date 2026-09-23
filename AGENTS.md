# maminco-frontend

Next.js 16 (App Router) + React 19 + Tailwind v4 + TypeScript. Two surfaces in one app:

- Marketing landing at `/` (`app/(marketing)`).
- Admin back-office at `/dashboard, /areas, /categories, /products, /tables, /orders, /payments,
  /users` (`app/(admin)`).
- POS terminal at `/pos/tables` and `/pos/orders/[tableId]` (`app/(pos)`).

## Commands

```bash
cp .env.example .env.local      # NEXT_PUBLIC_API_URL / NEXT_PUBLIC_SOCKET_URL (default :3000)
npm install
npm run dev                     # port 3001
npm run lint                    # eslint (0 errors expected; warnings are pre-existing `any`s)
npm run build                   # must succeed; the only typecheck
```

There is no test runner.

## Conventions

- **English identifiers/comments; Spanish UI copy.**
- **Design system:** use the primitives in `components/ui/*` and the semantic Tailwind tokens
  defined in `app/globals.css` (`bg-background`, `text-foreground`, `bg-surface`, `text-muted`,
  `border-border`, `bg-primary`, `text-primary-foreground`, `bg-accent`, ...). Never hardcode brand
  hex values in components. Add new themes via `[data-theme="..."]` blocks. See
  `docs/DESIGN-SYSTEM.md`.
- **Theming:** `next-themes` with `attribute="class"`; `dark:` variants follow the `.dark` class
  (enabled by `@custom-variant dark` in `globals.css`). Theme toggle in `components/theme/`.
- **API base:** always read `process.env.NEXT_PUBLIC_API_URL` via `lib/http/client.ts`
  (`API_BASE`, `getHeaders`). Never hardcode hosts.
- **Auth:** Zustand store `hooks/useAuth.tsx`, persisted to localStorage `maminco-auth`; a `token`
  cookie (non-httpOnly) is set for `middleware.ts`, which redirects unauthenticated users from
  protected prefixes to `/auth/login`.
- **Realtime:** socket.io client in `lib/utils/socket.ts` / `hooks/useOrderSocket.ts`.
- Domains: `lib/api/{admin,pos,auth}` with barrel `index.ts`; path alias `@/*` maps to the repo root.
- Tailwind v4 is configured ONLY through `postcss.config.mjs` + `@theme` in `globals.css`. Do not
  re-add `tailwind.config.cjs`/`postcss.config.cjs`.
