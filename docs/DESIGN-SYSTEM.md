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
| `--color-brand-leaf`    | `#4b9c30` |
| `--color-brand-emerald` | `#0a5c33` |
| `--color-brand-ink`     | `#0b100d` |

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

### 2.7 Identidad visual (landing y app)

La paleta cálida de la tabla siguiente es **global** (`:root` y `.dark`): la heredan la landing, el
login, el panel de administración, el POS y la cocina. La clase `.landing` solo añade extras de la
landing (hero, tonos de apoyo). La identidad es **clara y cálida** (servicio para restaurantes); el
oscuro es una variante afinada, no una inversión.

En la app: sidebar `bg-nav` con línea derecha `border-brand-leaf` y enlace activo `bg-menu-green`;
cabeceras de POS y cocina en `bg-nav` con línea inferior verde y etiqueta ámbar; títulos de página
en `font-display` (mayúsculas, Anton); el login lleva el panel de madera con la vista previa del POS.
**Rellenos sólidos de estado** (`bg-success-fill`, `bg-warning-fill`, `bg-danger-fill`, con texto
blanco ≥ 5,0:1): ladrillo, verde bosque y ámbar tostado; sustituyen a `success/warning/danger`
cuando el color es el fondo (mesas del POS, botón `danger`), porque esos tokens están pensados como
texto (en claro el blanco sobre `#f59e0b` daba 2,2:1 y en oscuro sobre `#f87171`, 2,8:1).

Origen de los colores (logo `maminco-logo.png`): cabeza del pato verde esmeralda `#06602e`, marco
verde hoja `#4b9c30`, pico amarillo `#fdc624`, cola ámbar a naranja `#f7aa02` → `#e84f00`, fondo casi
negro y trazo blanco. Roles: **verde = marca y acción**, **amarillo = énfasis y CTA sobre verde**,
**naranja = acento puntual**.

| Token (`.landing`)  | Claro     | Oscuro    | Uso                                              |
| ------------------- | --------- | --------- | ------------------------------------------------ |
| `--background`      | `#faf7f0` | `#131110` | Fondo de página (papel cálido / carbón cálido)     |
| `--surface`         | `#ffffff` | `#1b1815` | Tarjetas                                         |
| `--surface-muted`   | `#f2ecdf` | `#221f1b` | Secciones alternas                               |
| `--foreground`      | `#1a1713` | `#f1ece0` | Texto principal                                  |
| `--muted-foreground`| `#5a5348` | `#a79f90` | Texto secundario                                 |
| `--border`          | `#e5dccb` | `#2f2a23` | Bordes                                           |
| `--primary`         | `#35701a` | `#417d1c` | Relleno de botones (texto blanco encima)         |
| `--primary-ink`     | `#35701a` | `#7bc65a` | Verde usado **como texto** (`text-primary-ink`)  |
| `--accent`          | `#fcbe28` | `#f2c14e` | Amarillo; más suave en oscuro para no fatigar    |
| `--hero`            | `#0e2a1b` | `#0e2a1b` | Verde profundo del header y del plan destacado; igual en ambos modos |
| `--hero-foreground` | `#f6f8f2` | `#f1f4ee` | Texto sobre el verde profundo                    |
| `--hero-muted`      | `#c9d8cd` | `#a9bdb0` | Texto secundario sobre el verde profundo         |
| `--hero-accent`     | `#fcbe28` | `#f2c14e` | Checks y énfasis sobre el verde profundo         |
| `--tone-leaf`       | `#337d1f` | `#86d268` | Verde hoja (marco del logo): chips, checks, etiqueta del hero |
| `--tone-amber`      | `#a15c00` | `#f2c14e` | Ámbar (pico del logo): chips e iconos                |
| `--tone-orange`     | `#c2500f` | `#f59a5b` | Naranja (cola del logo): chips e iconos              |
| `--tone-emerald`    | `#0a5c33` | `#62c28d` | Esmeralda (cabeza del logo): chips e iconos          |
| `--cream`           | `#ece4d3` | `#ece4d3` | Texto cálido sobre madera                            |
| `--nav`             | `#121212` | `#121212` | Carbón del header (el tono del menú impreso, igual en ambos modos) |
| `--nav-foreground`  | `#f4efe4` | `#f4efe4` | Texto crema del header                           |
| `--menu-green`      | `#457e20` | `#457e20` | Verde del título del menú impreso: letras y botones verdes del hero, burbuja del usuario en el chat (blanco encima: 4,9:1) |
| `--color-wood`      | `#1b110d` | `#1b110d` | Madera oscura (primitiva `bg-wood`); `bg-wood-ink` `#14100d` para el footer |

Contraste (WCAG, texto normal ≥ 4,5:1): texto/fondo 16,1 claro y 17,1 oscuro; atenuado/fondo 6,9 y
8,3; hero texto/hero 14,4 y 13,9; hero atenuado 10,4 y 7,8; hero acento 9,2 y 9,2; blanco sobre
`--primary` 11,9 y 5,2; `--primary-ink` sobre fondo 11,4 y 8,7. El verde `--primary` sobre fondo
oscuro daba 3,6:1 como texto, por eso existe `--primary-ink`.

Lenguaje visual inspirado en el menú impreso del restaurante (se toma la paleta y la sensación, no sus elementos): **madera oscura, carbón, verde hoja, ámbar cálido y crema**. El **hero y la cabecera de `/nosotros` van sobre madera** en ambos modos (`<WoodBackground />`, SVG procedural con `feTurbulence`, sin imágenes; sombreado `from-black/85` a la izquierda para legibilidad) y llevan la clase `dark` para resolver los tokens oscuros en su subárbol (`.landing .dark`), con una línea inferior `border-brand-leaf`. El **footer** es `bg-wood-ink` con la misma línea superior. La señal inferior del hero («Descubre Maminco») va solo en pantallas anchas: texto en mayúsculas espaciadas entre dos líneas que se desvanecen en verde hoja, con una flecha animada que enlaza a `#productos`. Los títulos usan la fuente display **Anton** (`font-display`, mayúsculas, `font-normal`; variable `--font-anton` cargada con `next/font`); el cuerpo sigue en Geist. Botón principal del hero: `bg-tone-leaf text-brand-ink`; el texto sobre madera usa `text-cream` (`--cream: #ece4d3`). El verde profundo queda para el header y el plan destacado. Los tonos de apoyo se aplican como chips `bg-tone-*/12 text-tone-* ring-tone-*/25` (utilidades generadas por `@theme inline`); sus luminosidades se ajustan en oscuro para no fatigar.

Header de la landing: barra de ancho completo en `bg-nav` (carbón `#121212`) con una línea inferior de 3 px `border-brand-leaf`, texto
`text-nav-foreground`, enlaces al 85 %, enlace activo con `bg-nav-foreground/10`, logo de 44–48 px y botón de login en degradado `from-brand-yellow to-brand-orange` (los colores de la cola del logo; texto `brand-ink`, 5,8:1). Ese mismo degradado se usa en el plan destacado, su sello y el botón del chat. La sección de **Roles** es una banda carbón (`dark bg-nav`) para dar ritmo; el **plan destacado** va en carbón con borde verde. El **chatbot** sigue el tema de la landing (cuerpo `bg-background`, crema en claro y carbón cálido en oscuro) con cabecera carbón y línea verde. La **vista previa del POS** del hero se renderiza con `.app-theme`, que restablece los tokens reales de la app (claros) para que las mesas sean idénticas a las de `PosTablesPage` (tarjetas sólidas `bg-success/danger/warning`, texto blanco) y no hereden los colores de modo oscuro. El selector de tema, el menú móvil y el botón del chat usan clases `nav-foreground` para mantener el contraste sobre el carbón.

Reglas: el amarillo es relleno, nunca texto sobre fondo claro (1,6:1; en claro el eyebrow usa
`text-primary-ink`); los tonos `--tone-*` se usan en iconos y chips, y como texto solo `--tone-leaf` y `--tone-emerald` (≥ 4,5:1 sobre superficie); no usar `text-primary` para texto en la landing; el único degradado permitido es el ámbar a naranja de las acciones (login, plan destacado, chat); sin otros gradientes decorativos ni
rejillas. `defaultTheme="system"` respeta `prefers-color-scheme`; el logo trae su propio fondo oscuro,
por lo que no requiere variante para tema claro u oscuro.

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
