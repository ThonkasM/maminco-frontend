# Landing page (Maminco)

Página pública de Maminco, servida en `/`.

## Estructura

- Ruta: `app/(marketing)/page.tsx` (grupo de rutas `(marketing)`).
- Layout: `app/(marketing)/layout.tsx` → `Navbar` + contenido + `Footer`.
- Componentes: `components/marketing/Navbar.tsx`, `components/marketing/Footer.tsx`.

> El antiguo `app/page.tsx` (redirección forzada a `/auth/login` o `/dashboard`)
> fue eliminado. Ahora `/` es público. Los usuarios autenticados llegan al panel
> con los botones "Ir al panel" o "Iniciar sesión" (el login redirige a
> `/dashboard` si ya hay sesión).

## Secciones

1. **Hero** — titular, subcopy, CTAs y fondo `bg-brand-mesh` (verde→amarillo/naranja).
2. **Características** (`#caracteristicas`) — POS web, mesas/órdenes en tiempo
   real, pagos y caja, reportes, pronósticos de ventas con IA y móvil.
3. **Cómo funciona** (`#como-funciona`) — 3 pasos + preview de UI (`AppPreview`).
4. **Banda de estadísticas** — métricas destacadas sobre verde de marca.
5. **Equipo** (`#equipo`) — Jorge Carvajal.
6. **CTA final** — acceso al panel.

## Convenciones

- Copy 100% en español; identificadores y comentarios en inglés.
- Usa los primitivos de `components/ui/` y tokens semánticos.
- CTAs de marketing con forma `pill`; responsive y accesible.
- Navbar con menú móvil, `aria-expanded` y `ThemeToggle`.
