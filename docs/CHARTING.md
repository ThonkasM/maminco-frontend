# Charting

## Decision

Charts are **not** shared through a single library across web and mobile. They share a
**data/prop contract** but use the best tool per platform — the same approach used in the
Homy project (Victory Native only on native, plain views on web).

| Surface | Library | Why |
|---|---|---|
| `maminco-frontend` (Next.js) | **recharts** | Web-native, SSR-friendly, tiny API, integrates with Tailwind token CSS variables via `stroke="var(--border)"`. |
| `maminco-mobile` (Expo, iOS/Android) | **victory-native (XL)** + `@shopify/react-native-skia` | Real GPU-accelerated native charts; matches Homy's `agent-pro` dashboard. |
| `maminco-mobile` (Expo web) | Plain `View` fallback | Skia on web needs WASM and is heavy; the fallback keeps the web/Expo export light. |

Why not one library everywhere:

- Victory's web package (`victory`) and **Victory Native XL** are different codebases with
  different APIs — there is no single "Victory" that works the same on both.
- Skia (required by Victory Native XL) is a native module; on Expo web it adds a large WASM
  payload and can break the static export.

## Rules

- Always theme charts from design tokens: web uses CSS variables (`var(--primary)`,
  `var(--border)`, `var(--surface)`, `var(--muted-foreground)`); mobile uses `useTheme()`
  colors. Never hardcode hex.
- Keep a **shared prop shape** per chart so the web and native variants are interchangeable
  (`features/ai/components/*` on web; `components/charts/*.tsx` + `.native.tsx` on mobile).
- Native chart files (`*.native.tsx`) must never be imported by web-only code paths.
- The mobile `.native.tsx` charts require a dev build / prebuild (Skia is not in Expo Go).

## Where charts live

- Web: `features/dashboard/components/ReportCharts.tsx`, `features/ai/components/*Chart.tsx`.
- Mobile: `components/charts/*` (platform split) used by `(manager)/metrics`, `(manager)/forecast`
  and `(manager)/ai`.
