# Marketing UI (landing)

Cómo se construye y mantiene la superficie pública de Maminco (`/`). Complementa
[`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md), [`FRONTEND-CONVENTIONS.md`](./FRONTEND-CONVENTIONS.md) y
[`CHARTING.md`](./CHARTING.md). Sustituye en detalle a `docs/LANDING.md`.

Regla de oro: **la landing puede simplificar, pero no debe contradecir la app real.** Todo mockup
que "imite" una pantalla debe usar los mismos tokens, etiquetas y jerarquía que la ruta que
representa; si se simplifica, se marca como vista ilustrativa.

---

## 1. Mapa de archivos

| Pieza | Ruta |
| --- | --- |
| Ruta | `app/(marketing)/page.tsx` |
| Layout | `app/(marketing)/layout.tsx` → `Navbar` + `<main>` + `Footer` |
| Chrome | `components/layout/marketing/Navbar.tsx`, `.../Footer.tsx` |
| Secciones | `components/marketing/{ContactSection,FaqSection,Chatbot}.tsx` |
| Mockups | `components/marketing/{AppFrame,LiveAppPreview,FeaturesBento,StepsShowcase}.tsx` |
| Helper de dinero | `components/marketing/formatBs.ts` |

Anclas que el `Navbar` espera que existan: `#productos`, `#caracteristicas`, `#cocina`, `#planes`,
`#faq`, `#contacto` (más `#como-funciona`, `#equipo` usadas desde la página).

> `docs/files/` conserva los archivos originales de la propuesta. **No es fuente de verdad**; la
> fuente de verdad son las rutas de la tabla.

Estructura de la página (orden actual):
1. Hero (`bg-brand-mesh`) + `LiveAppPreview`.
2. `#productos` + ancla oculta `#caracteristicas` + `FeaturesBento`.
3. `#como-funciona` + `StepsShowcase`.
4. Banda de datos clave (`bg-brand-green`).
5. `#planes`.
6. `FaqSection` (`#faq`).
7. `#equipo`.
8. `ContactSection` (`#contacto`).
9. CTA final.
10. `Chatbot`.

---

## 2. Server vs. client

| Componente | Tipo | Motivo |
| --- | --- | --- |
| `AppFrame` | Server | Solo compone markup. |
| `FeaturesBento` | Server | Estático (gráficos SVG/CSS). |
| `LiveAppPreview` | `'use client'` | Intervalo de animación + `useState`. |
| `StepsShowcase` | `'use client'` | Pestañas + `useState`. |
| `Chatbot`, `Navbar` | `'use client'` | Interacción. |
| Secciones de página | Server | Contenido. |

Regla: el estado vive en la hoja cliente más pequeña posible; no convertir una sección entera en
cliente solo por un mockup.

---

## 3. Render e hidratación

- **Estado inicial determinista.** La primera renderización (SSR) y la del cliente deben coincidir:
  `tick = 0`, `active = 'config'`. Nunca `Math.random()`/`Date.now()` en el render inicial.
- **Dinero en mockups: `formatBs` (manual, sin `Intl`).** Evita divergencias de ICU entre servidor y
  cliente. La app usa `formatCurrency` (`lib/utils/currency.ts`); no mezclar los dos en una misma
  pantalla. Ver `components/marketing/formatBs.ts`.
- **Animación acotada y cancelable.** `setInterval` dentro de `useEffect` con `clearInterval`; la
  demo de `LiveAppPreview` para a las 3 vueltas (`MAX_TICKS`).
- **Movimiento reducido.** Respetar `prefers-reduced-motion`:
  - CSS: variantes `motion-reduce:animate-none` / `motion-reduce:transition-none`.
  - JS: `window.matchMedia('(prefers-reduced-motion: reduce)')` antes de arrancar el intervalo.
- **Mockups decorativos** llevan `role="img"` + `aria-label` (o `aria-hidden`) y no exponen contenido
  interactivo falso.

---

## 4. Design system en marketing

- **Tokens semánticos, nunca paleta cruda.** Fondo `bg-background`/`bg-surface-muted`, texto
  `text-foreground`/`text-muted-foreground`, bordes `border-border`, acento de marca `bg-accent`,
  estados `bg-success`, `bg-warning`, `bg-danger`.
- **Radios:** marketing usa `round-full` (`shape="pill"`); dentro de la app, cuadrado (`rounded-md`).
- **Iconos:** `lucide-react`. Sin emoji.
- **Primitivos:** `Button`, `Badge`, `Card` de `components/ui`.
- **CTA como enlace:** `LinkButton` en `app/(marketing)/page.tsx` aplica `buttonVariants` sobre
  `<Link>`. **Nunca** anidar `<Button>` dentro de `<a>`/`<Link>` (HTML inválido). Patrón de
  referencia: `app/unauthorized/page.tsx`.
- **`AppFrame`** es el marco tipo ventana de navegador (semáforos + URL en `font-mono`) para los
  mockups. Es server component.

---

## 5. Mockups vs. app real (fidelidad)

Los mockups siguen las pantallas reales. Revisa esta sección cuando cambie una pantalla y actualiza
el mockup correspondiente.

| Mockup (`components/marketing/…`) | Pantalla real | Estado |
| --- | --- | --- |
| `LiveAppPreview` | `features/pos/tables/components/PosTablesPage.tsx` (`/pos/tables`) | Alineado |
| `StepsShowcase` → `DataPanel` | AI `SalesForecastChart` / `PeakHoursChart` | Alineado |
| `StepsShowcase` → `PosPanel` | `features/pos/orders/components/{CartItemsList,CartSummary,PaymentMethodSelector}.tsx` | Alineado |
| `FeaturesBento` → `TicketPreview` | Ticket ESC/POS del backend (`maminco-backend/src/printing/printing.service.ts`) | Alineado |
| `FeaturesBento` → `PhonePreview` | App móvil (`maminco-mobile`, repo aparte) | Otro surface |
| `FeaturesBento` → `Sparkline` | AI `SalesForecastChart` | Alineado |
| `StepsShowcase` → `ConfigPanel` | `/areas` (`AreaTable`) y `/products` (`ProductsTable`) | Alineado |
| `StepsShowcase` → `KitchenPanel` | `/kitchen` (`features/kitchen`) | Alineado |
| `FeaturesBento` → `KitchenPreview` | `/kitchen`; mobile `(kitchen)/kitchen` | Alineado |

### 5.1 `LiveAppPreview` (POS mesas)

- Ruta real `/pos/tables`; `AppFrame` url `app.maminco.bo/pos/tables`.
- Mismo mapeo de estados que `PosTablesPage.tsx`: `Disponible → bg-success`,
  `Ocupada → bg-danger`, `Reservada → bg-warning`.
- Tarjeta cuadrada rellena con texto blanco y sin punto, igual que la app.
- Pill de `ClipboardList` en mesas con orden activa.
- Título "Centro de órdenes" y pie con la leyenda de estados + contador `N libres · N ocupadas`
  (equivalente a los stats por área del sidebar real).
- Se eliminaron el "Ventas del turno" y el log de actividad, que **no existen** en la pantalla real.
  La animación solo cambia el estado de las mesas (comportamiento real de `useOrderSocket`).
- Estado inicial determinista (`tick = 0`) y parada a las 3 vueltas; respeta `prefers-reduced-motion`.

### 5.2 `StepsShowcase` → `DataPanel`

- Representa la pantalla de IA "Pronóstico de ventas": **área sólida = Modelo**, **línea punteada =
  Baseline**, misma semántica que `SalesForecastChart.tsx` (no barras actual/pronóstico).
- Badge "Datos de ejemplo": la app real usa datos reales, se conserva como etiqueta honesta de demo.
- Se eliminó el rango "13:00 a 15:00" (la API expone `peak_hour` entero y `top_hours`, no un rango);
  el texto ahora describe el chart y las horas pico por hora del día (`PeakHoursChart`).

### 5.3 `StepsShowcase` → `PosPanel`

- Líneas con control de cantidad (−/+), nombre, precio unitario y total de línea, como
  `CartItemsList.tsx`.
- Resumen **solo `Subtotal:`**, como `CartSummary.tsx` (sin `Propina 10%` ni `Total`; la propina es
  una acción/modal, no una línea fija).
- Métodos de pago como **botones verticales** con icono por `code` (`CASH` → `Banknote`,
  `CARD` → `CreditCard`, `TRANSFER` → `Building2`); el seleccionado va con relleno primario, como
  `PaymentMethodSelector.tsx`.
- CTA **"Cerrar y cobrar"**.

### 5.4 `FeaturesBento` → `TicketPreview`

- Filas `Subtotal` / `Propina` / `Total` en lugar de "Total con propina", alineado al vocabulario del
  recibo.

### 5.5 `FeaturesBento` → `PhonePreview`

- Otro surface (app móvil, `maminco-mobile`). Usa el mismo mapeo semántico de estados
  (`Ocupada → danger`, `Reservada → warning`, `Disponible → success`).

### 5.6 `FeaturesBento` → `Sparkline`

- Sólida = modelo, discontinua = baseline (misma semántica que `SalesForecastChart`).

### 5.7 `StepsShowcase` → `ConfigPanel`

- Áreas y productos como tablas con columna `Estado` (Activa/Activo), cerca de `AreaTable` y
  `ProductsTable`; precios con `formatBs`.

### 5.8 `StepsShowcase` → `KitchenPanel` / `FeaturesBento` → `KitchenPreview`

- Reflejan la pantalla real de cocina: board de 3 columnas **Pendiente / En preparación / Listo**
  con textos, puntos y colores reales (`warning` / `primary` / `success`) y tarjetas por mesa.
- Mencionan el rol **Cocinero** y que la función es opcional (flag `digital_kitchen`); el flujo de
  venta normal no cambia.
- `KitchenPanel` es el cuarto paso de "En marcha en cuatro pasos" (`StepsShowcase`); `KitchenPreview`
  es la tarjeta ancha de `FeaturesBento`.

---

## 6. Reglas para agregar un mockup

1. Identifica la ruta real que representa y ponla como `url` del `AppFrame`
   (`app.maminco.bo/...`).
2. Reutiliza tokens, radios, iconos y primitivos del design system. Nada de paleta cruda ni emoji.
3. Copia las **etiquetas reales** (texto español) y la jerarquía; si simplificas, agrega un badge
   "Datos de ejemplo" / "Vista ilustrativa".
4. Mantén el estado inicial determinista y el formateo de dinero con `formatBs`.
5. Respeta `prefers-reduced-motion`; acota cualquier animación y limpia el intervalo.
6. Mockups decorativos: `role="img"` + `aria-label`, o `aria-hidden` si son puramente ornamentales.
7. Actualiza la tabla de §5 cuando cambie la pantalla real: **el mockup y esta tabla son un solo
   artefacto de mantenimiento.**

Cocina (Cocina Digitalizada): **sí se puede mencionar**. Es un estado `OrderKitchenStatus`
(`PENDING → PREPARING → READY`) independiente de `OrderStatus`, con el rol `COOK`, la ruta
`/kitchen` y la flag global `digital_kitchen`. Los mockups deben mostrar el board de 3 columnas
(Pendiente / En preparación / Listo), el rol Cocinero y que es **opcional** (flag apagada = flujo
actual). Mantén separado el flujo de venta `DRAFT → CLOSED/CANCELLED` del de cocina.

---

## 7. Deuda conocida

- [x] Mapeo de estados en `LiveAppPreview` y `PhonePreview`.
- [x] "Ventas del turno" y log de actividad fuera de la preview POS (no existen en la app).
- [x] Semántica de pronóstico en `DataPanel` y `Sparkline` (sólida = modelo).
- [x] `PosPanel` con "Subtotal", "Cerrar y cobrar" y métodos de pago verticales.
- [x] `TicketPreview` alineado al vocabulario del recibo.
- [x] `ConfigPanel` con columnas de áreas/productos y `Estado`.
- [x] Cocina Digitalizada mostrada en la landing (`KitchenPanel` + `KitchenPreview`), fiel a
      `/kitchen` y al rol `COOK`.
- [ ] Verificar que `PhonePreview` coincida con las pantallas reales de `maminco-mobile` (repo aparte).
- [ ] Consistencia de dinero en la app: `SalesSummaryCard` usa `Math.round(...).toLocaleString()`
      inline mientras `DashboardKpis` usa `formatCurrency`; unificar en `formatCurrency`.

---

## 8. Referencias

- [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) — tokens, tipografía, radios, elevación, componentes.
- [`FRONTEND-CONVENTIONS.md`](./FRONTEND-CONVENTIONS.md) — estructura, data layer, copy.
- [`CHARTING.md`](./CHARTING.md) — recharts en web, Victory Native en móvil.
- `contratos.md` (raíz del workspace) — enums y endpoints entre servicios.
