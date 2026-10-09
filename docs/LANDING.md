# Landing page (Maminco)

Página pública de Maminco, servida en `/`.

Documentación completa (estructura, componentes, reglas de hidratación y fidelidad de los mockups
frente a la app real): **[`MARKETING-UI.md`](./MARKETING-UI.md)**.

Resumen:

- Ruta: `app/(marketing)/page.tsx` (grupo `(marketing)`).
- Layout: `app/(marketing)/layout.tsx` → `Navbar` + contenido + `Footer`
  (`components/layout/marketing/`).
- Mockups: `components/marketing/{AppFrame,LiveAppPreview,FeaturesBento,StepsShowcase}.tsx`.
- Copy 100% en español; identificadores y comentarios en inglés.
- Usa primitivos de `components/ui/` y tokens semánticos; CTAs de marketing con forma `pill`.
