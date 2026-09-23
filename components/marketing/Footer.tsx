import Link from 'next/link'

const FOOTER_LINKS = [
  {
    title: 'Producto',
    links: [
      { href: '#caracteristicas', label: 'Características' },
      { href: '#como-funciona', label: 'Cómo funciona' },
      { href: '/auth/login', label: 'Iniciar sesión' },
      { href: '/dashboard', label: 'Ir al panel' },
    ],
  },
  {
    title: 'Módulos',
    links: [
      { href: '/pos/tables', label: 'Punto de venta' },
      { href: '/orders', label: 'Órdenes' },
      { href: '/payments', label: 'Pagos y caja' },
      { href: '/dashboard', label: 'Reportes' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
              M
            </span>
            <span className="text-lg font-semibold tracking-tight">Maminco</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            El sistema integral para restaurantes: punto de venta, mesas y órdenes
            en tiempo real, pagos, caja y reportes con pronósticos de ventas.
          </p>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={`${group.title}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Maminco. Todos los derechos reservados.</p>
          <p>Hecho para restaurantes de Bolivia · Precios en Bolivianos (Bs.)</p>
        </div>
      </div>
    </footer>
  )
}
