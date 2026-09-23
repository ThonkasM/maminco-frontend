# Maminco Design System

Guía de diseño y componentes del frontend de Maminco. Objetivo: una interfaz
profesional y consistente con theming (claro/oscuro + temas de marca) sin romper
la funcionalidad existente.

- Stack: Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · `next-themes`
- Tokens semánticos, nunca referencias a la paleta cruda dentro de componentes.
- Utilidades: `class-variance-authority` + `tailwind-merge` + `clsx` vía
  `lib/utils/cn.ts`.

---

## 1. Principios ("Vercel inspired", adaptado)

1. **Restricción cromática.** Un solo primario (verde oscuro) carga las
   llamadas a la acción. Un único acento (amarillo/naranja) resalta. Nada de
   arcoíris de colores.
2. **Tokens semánticos.** Los componentes usan `bg-primary`, `text-muted-foreground`,
   `border-border`… nunca `#143f29` ni `bg-green-800`.
3. **Tipografía.** Geist (sans) hasta peso 600; Geist Mono para _eyebrows_
   técnicos y datos. Titulares display con tracking negativo agresivo
   (`tracking-[-0.04em]`).
4. **Dos escalas de radio.** Marketing = pill (`rounded-full`); dentro de la app
   = cuadrado (6–12px: `rounded-sm|md|lg`).
5. **Elevación sutil.** Sombras apiladas + anillo interior tipo _hairline_,
   nunca drops pesados.
6. **Mesh gradient de marca** (verde→amarillo/naranja) solo a escala de héroe.

---

## 2. Tokens

### 2.1 Primitivas de marca

Definidas en `app/globals.css` dentro de `@theme` (generan utilidades
`bg-brand-*`, `text-brand-*`, `border-brand-*`):

| Token                   | Valor     |
| ----------------------- | --------- |
| `--color-brand-green`   | `#143f29` |
| `--color-brand-charcoal`| `#191919` |
| `--color-brand-yellow`  | `#fcbe28` |
| `--color-brand-orange`  | `#f26c1e` |

> Las primitivas solo se referencian desde los tokens semánticos o desde el mesh
> gradient. No se usan directamente en componentes de producto.

### 2.2 Tokens semánticos

Definidos en `:root` (claro), `.dark` (oscuro) y `[data-theme="brand-yellow"]`
(tema de marca), y mapeados a utilidades Tailwind con `@theme inline`:

| Token CSS                 | Utilidad Tailwind        | Uso                          |
| ------------------------- | ------------------------ | ---------------------------- |
| `--background`            | `bg-background`          | Fondo de página              |
| `--surface`               | `bg-surface`             | Tarjetas, barras, modales    |
| `--surface-muted`         | `bg-surface-muted`       | Fondos secundarios, hover    |
| `--foreground`            | `text-foreground`        | Texto principal              |
| `--muted-foreground`      | `text-muted-foreground`  | Texto secundario             |
| `--border`                | `border-border`          | Bordes y separadores         |
| `--primary`               | `bg-primary`             | CTA principal / nav activa   |
| `--primary-foreground`    | `text-primary-foreground`| Texto sobre primario         |
| `--accent`                | `bg-accent`              | Resaltado (amarillo/naranja) |
| `--accent-foreground`     | `text-accent-foreground` | Texto sobre acento           |
| `--ring`                  | `ring-ring`              | Anillo de foco               |
| `--success`               | `text-success`           | Éxito                        |
| `--warning`               | `text-warning`           | Advertencia                  |
| `--danger`                | `text-danger`            | Error / destructivo          |

### 2.3 Tipografía

- `font-sans` → Geist (`--font-geist-sans`, cargada con `next/font`).
- `font-mono` → Geist Mono (`--font-geist-mono`).
- Pesos permitidos: 400/500/600. Evitar `font-bold` en display grande.
- Escala sugerida:
  - Display: `text-4xl sm:text-6xl`, `font-semibold`, `tracking-[-0.04em]`,
    `leading-[1.05]`.
  - Título de sección: `text-3xl sm:text-4xl`, `tracking-tight`.
  - Título de tarjeta: `text-lg font-semibold tracking-tight`.
  - Cuerpo: `text-sm` / `text-base`.
  - Eyebrow: `font-mono text-xs uppercase tracking-[0.2em]`.

### 2.4 Radios

| Token          | Valor | Uso                        |
| -------------- | ----- | -------------------------- |
| `rounded-sm`   | 6px   | Controles pequeños         |
| `rounded-md`   | 8px   | Botones, inputs (default)  |
| `rounded-lg`   | 12px  | Tarjetas, modales          |
| `rounded-xl`   | 16px  | Superficies grandes        |
| `rounded-full` | 9999  | CTAs de marketing (pill)   |

### 2.5 Espaciado

Escala estándar de Tailwind (múltiplos de 4px). Ritmo recomendado:

- Padding interno de tarjeta: `p-6`.
- Separación entre secciones de landing: `py-24` (móvil `py-16`).
- Gap de grillas: `gap-5` / `gap-6`.
- Ancho de contenido: `max-w-6xl` con `px-4 sm:px-6`.

### 2.6 Elevación

| Utilidad          | Uso                                    |
| ----------------- | -------------------------------------- |
| `shadow-card`     | Tarjetas e inputs (hairline + sutil)   |
| `shadow-elevated` | Hover de tarjeta, popovers             |
| `shadow-float`    | Modales / previews flotantes           |

Complementar con `ring-1 ring-inset ring-black/[0.02] dark:ring-white/[0.03]`
para el borde _hairline_.

---

## 3. Inventario de componentes

Todos en `components/ui/`, exportados desde `components/ui/index.ts`.

| Componente                        | Notas                                                        |
| --------------------------------- | ------------------------------------------------------------ |
| `Button`                          | Variantes `primary/accent/secondary/outline/ghost/danger`; tamaños `sm/md/lg/icon`; forma `squared/pill`; estado `disabled` y foco unificados. |
| `Input` / `Textarea` / `Select`   | Estilos de token, estado `aria-invalid` en rojo.             |
| `Label`                           | Basado en `@radix-ui/react-label`.                           |
| `FormField`                       | Conecta `htmlFor/id`, `aria-invalid`, `aria-describedby` y error con `role="alert"`. |
| `Card`                            | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. |
| `Badge`                           | `neutral/info/success/warning/danger/brand`.                 |
| `Dialog`                          | Radix Dialog: overlay, focus trap, Escape, `role="dialog"`, `aria-modal`. |
| `Table`                           | `TableWrapper` (overflow), `Table`, `THead`, `TBody`, `TFoot`, `Tr`, `Th`, `Td`. |
| `EmptyState`                      | Icono + título + descripción + acción.                       |
| `Skeleton`                        | Placeholder de carga.                                        |
| `Spinner`                         | Indicador de carga accesible (`role="status"`).              |
| `Pagination`                      | Navegación accesible con `aria-current`.                     |

Temas: `components/theme/ThemeProvider.tsx` (wrapper de `next-themes`) y
`components/theme/ThemeToggle.tsx`.

### Reglas de uso

- Usa los primitivos en código nuevo. El código legado conserva sus clases
  Tailwind y sigue funcionando.
- Los CTAs de producto (dentro de la app) usan forma `squared`; los de marketing
  usan `pill`.
- No mezcles colores de estado (por ejemplo `success`) con el acento de marca
  salvo que el estado sea semántico.
- Un solo primario visible por pantalla para la acción principal.

---

## 4. Theming

El modo oscuro es **por clase**: `@custom-variant dark (&:where(.dark, .dark *))`.
`next-themes` (configurado en `app/layout.tsx` con `attribute="class"`) agrega
`.dark` a `<html>`.

### Agregar un nuevo tema

1. Define el bloque de variables en `app/globals.css`:

   ```css
   [data-theme="mi-tema"] {
     --background: #...;
     --surface: #...;
     --foreground: #...;
     --primary: #...;
     --accent: #...;
     /* …resto de tokens semánticos */
     color-scheme: light;
   }

   [data-theme="mi-tema"].dark {
     /* variante oscura del tema */
     color-scheme: dark;
   }
   ```

2. Aplícalo con `document.documentElement.dataset.theme = 'mi-tema'` (o desde un
   selector de temas).
3. No es necesario tocar componentes: todos consumen tokens semánticos.

Tema de ejemplo incluido: `[data-theme="brand-yellow"]` (primario verde, acento
naranja).

---

## 5. Accesibilidad

- Todo control de formulario debe tener `label` asociado (`FormField` lo hace
  automáticamente).
- Errores: `role="alert"` + `aria-describedby` apuntando al mensaje.
- Estado inválido: `aria-invalid="true"` (estilizado con `aria-[invalid=true]:`).
- Foco visible siempre (`:focus-visible` con `--ring`).
- Diálogos: focus trap, cierre con Escape, `aria-modal="true"`.
- Iconos decorativos: `aria-hidden`; botones con solo icono: `aria-label`.
- Contraste: usar tokens semánticos; no colocar `text-muted-foreground` sobre
  fondos de color de marca.
- Navegación: enlaces con `aria-current="page"` cuando corresponda.
