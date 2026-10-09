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
- `QueryClient` defaults (`components/providers/ReactQueryProvider.tsx`): `staleTime` 30 s,
  `gcTime` 5 min, `retry` 1, `refetchOnWindowFocus` false. The client is created per instance
  (not module scope) to avoid cross-request state on the server. Realtime updates come from
  socket.io invalidations, not from aggressive refetching.

## Tables

Data tables use **`DataTable`** (`@/components/ui`), built on **`@tanstack/react-table`** and the
`Table*` primitives. Define **columns** (`ColumnDef<T>[]`) and render:

```tsx
import type { ColumnDef } from '@tanstack/react-table'
import { Badge, Button, DataTable } from '@/components/ui'

const columns: ColumnDef<Thing>[] = [
  { accessorKey: 'name', header: 'Nombre' },
  {
    id: 'total',
    header: 'Total',
    accessorFn: (row) => Number(row.total),   // accessorFn for computed/numeric sorting
    meta: { align: 'right' },                 // left (default) | center | right
    cell: ({ row }) => formatCurrency(Number(row.original.total)),
  },
  {
    id: 'actions',
    header: 'Acciones',
    enableSorting: false,
    meta: { align: 'right' },
    cell: ({ row }) => <Button onClick={() => onEdit(row.original)}>Editar</Button>,
  },
]

<DataTable columns={columns} data={things} getRowId={(thing) => thing.id} />
```

- **Client-only:** `DataTable` is `'use client'`; columns with `cell` render functions must be
  defined in a client component.
- Sortable headers are enabled by default (click to cycle asc/desc). Opt a column out with
  `enableSorting: false` (actions, badges, pre-formatted/chronological columns).
- Sorting is **client-side over the current page**; pagination/search still live on the server via
  React Query (see `Pagination` + `features/<d>/hooks`).
- Extra props: `loading` (skeleton rows), `emptyState` (defaults to an `EmptyState`), `onRowClick`,
  `initialSorting`, `skeletonRows`.
- Column `meta`: `align`, `headerClassName`, `cellClassName`.
- Do **not** hand-roll `<Table>` markup for data lists — use `DataTable`. The raw `Table*`
  primitives remain for static/mockup layouts (e.g. marketing mockups).

## UI

- Use primitives from `@/components/ui`: `Button`, `Input`, `Textarea`, `Select`, `Label`,
  `FormField`, `Card`, `Badge`, `DataTable`, `TableWrapper/Table/THead/TBody/Tr/Th/Td`, `Dialog*`,
  `EmptyState`, `Skeleton`, `Spinner`, `Pagination`, `Switch`.
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
