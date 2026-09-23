# Frontend conventions

Feature-based structure: `app/` is **routing only**; all feature code lives in `features/<domain>/`.

```
app/**/page.tsx          -> thin route: renders a feature page component
components/ui/           -> design-system primitives (single source of truth)
components/layout/       -> app shells, nav, marketing chrome
components/shared/       -> cross-feature composed components (ConfirmDialog, ToastProvider)
components/providers/    -> React Query, theme, mode providers
features/<domain>/       -> api.ts + hooks/ + components/ (+ types.ts)
lib/http/client.ts       -> apiFetch / ApiError (the ONLY place that calls fetch)
lib/utils/               -> helpers (cn, currency, errors, ...)
lib/realtime/            -> socket.io client
```

## Data layer

`features/<domain>/api.ts` — typed functions; **no `fetch`, no `getHeaders`, no `API_BASE`**:

```ts
import { apiFetch } from '@/lib/http/client'

export function getThings(page = 1, search?: string, signal?: AbortSignal) {
  return apiFetch<PaginatedThings>('/api/things', { query: { page, search }, signal })
}
export function createThing(payload: CreateThingPayload) {
  return apiFetch<Thing>('/api/things', { method: 'POST', body: payload })
}
```

`features/<domain>/hooks/*.ts` — **React Query** (`@tanstack/react-query`):

```ts
const query = useQuery({
  queryKey: ['things', { page, search }],
  queryFn: ({ signal }) => getThings(page, search || undefined, signal),
})
const mutation = useMutation({
  mutationFn: createThing,
  onSuccess: async () => {
    toast.success('...')                       // Spanish copy
    await queryClient.invalidateQueries({ queryKey: ['things'] })
  },
  onError: (error) => toast.error(getErrorMessage(error, 'Fallback en español')),
})
```

- `toast` comes from `@/components/shared/ToastProvider`.
- `getErrorMessage` comes from `@/lib/utils/errors`.
- No `useEffect` fetching; React Query owns server state.

## UI

- Use primitives from `@/components/ui`: `Button`, `Input`, `Textarea`, `Select`, `Label`,
  `FormField`, `Card`, `Badge`, `TableWrapper/Table/THead/TBody/Tr/Th/Td`, `Dialog*`,
  `EmptyState`, `Skeleton`, `Spinner`, `Pagination`.
- Use **semantic tokens**, never raw palette: `bg-background`, `bg-surface`, `bg-surface-muted`,
  `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary text-primary-foreground`,
  `bg-accent text-accent-foreground`, `text-danger`, `text-success`.
  Do not write `bg-blue-600`, `bg-slate-*`, `dark:bg-slate-*`, etc.
- Icons: `lucide-react`. **No emoji** as icons or in UI text.
- Destructive confirmations use a `Dialog` (or `ConfirmDialog`).
- Modals use `Dialog` (Radix): accessible, focus trap, Escape, backdrop close.

## Copy

- Code identifiers and comments: **English**.
- All user-facing copy: **Spanish**. Watch for corrupted text where a global rename replaced
  Spanish words inside JSX text (e.g. `Tables` → `Mesas`, `orders` → `Órdenes`, `payments` → `Pagos`,
  `products` → `Productos`, `categories` → `Categorías`, `users` → `Usuarios`, `cash` → `Efectivo`,
  `card` → `Tarjeta`, `transfer` → `Transferencia`, `tip` → `Propina`, `discount` → `Descuento`).

## Pages

`app/**/page.tsx` must be minimal:

```tsx
import { ThingsPage } from '@/features/things/components/ThingsPage'
export default function ThingsRoute() {
  return <ThingsPage />
}
```
